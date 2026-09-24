// use-room-socket.ts
"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { WebSocketManager, WSMessage } from "./web-socket-manager"
import { userStore } from "@/lib/stores/user-store"
import { useRoomStore } from "@/lib/stores/room-store"
import { useGameStore } from "@/lib/stores/game-store"
import { useRouter } from "next/navigation"
import i18n from "@/i18n"
import { GameStatus, BingoClaimRequestPayloadType } from "@/lib/types"
import { useTelegramInit } from "../use-telegram-init"
import { useAgentStore } from "@/lib/stores/agent-store"

interface UseRoomSocketOptions {
  roomId?: number
  enabled?: boolean
}

export function useRoomSocket({ roomId, enabled = true }: UseRoomSocketOptions) {
  useTelegramInit()
  const {activeAgentId} = useAgentStore();
  const { user, initData } = userStore()
  const roomStore = useRoomStore()
  const gameStore = useGameStore()
  const router = useRouter()

  const managerRef = useRef<WebSocketManager | null>(null)

  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  const [latencyMs, setLatencyMs] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // memoized URL so manager doesn't get new instance on each render
  const wsUrl = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_WS_URL
    if (!base || !activeAgentId || !user?.telegramId) return null
    // For lobby/general updates, roomId can be undefined to receive all room updates
    const url = roomId 
      ? `${base}/ws/game?roomId=${roomId}&userId=${user?.telegramId}&agentId=${activeAgentId}`
      : `${base}/ws/game?userId=${user?.telegramId}&agentId=${activeAgentId}`
    return url
  }, [roomId, user?.telegramId, activeAgentId])

  useEffect(() => {
    if (!wsUrl || !enabled || !user?.telegramId) return

    const manager = new WebSocketManager({
      url: wsUrl,
      enabled: true,
      heartbeatInterval: 30_000,
      pongTimeout: 10_000,
      initialBackoff: 1000,
      maxBackoff: 10_000,
      maxReconnectAttempts: null, // infinite retries
      autoConnect: false,
    })

    managerRef.current = manager

    const onConnecting = () => {
      setConnecting(true)
      setConnected(false)
      setError(null)
    }
    const onOpen = () => {
      setConnected(true)
      setConnecting(false)
      setReconnectAttempts(manager.getReconnectAttempts())
      setError(null)
      // request the game state so we can enter the room automatically
      if (roomId && user?.telegramId) {
        manager.send({
          type: "room.getGameStateRequest",
          payload: { roomId, playerId: user.telegramId, capacity: roomStore.room?.capacity },
        })
      }
    }
    const onClose = () => {
      setConnected(false)
      setConnecting(false)
      setReconnectAttempts(manager.getReconnectAttempts())
    }
    const onReconnecting = ({ attempt }: { attempt: number; delay?: number }) => {
      setReconnectAttempts(attempt)
    }
    const onLatency = (lat: number) => setLatencyMs(lat)
    const onError = (err: any) => {
      // normalize error message
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
    }

    // message handler router (centralized)
    const onMessage = (msg: WSMessage) => {
      try {
        const type = msg.type
        const p = msg.payload

        // ---- pong handled by manager already; other events below ----
        switch (type) {
          // case "game.playerJoined":
          //   // If not the active room, ignore
          //   if (p.roomId !== roomStore.room?.id) break
          //   gameStore.setJoinedPlayers(p.joinedPlayers)
          //   gameStore.setPlayersCount(p.playersCount)
          //   gameStore.addPlayerSelectedCards(p.playerSelectedCardIds, Number(p.playerId), user?.telegramId || 0)
          //   gameStore.setAllPlayerSelectedCardIds(p.allSelectedCardIds)
          //   if (user && p.joinedPlayers.includes(user.telegramId.toString()) && Number(p.playerId) === user.telegramId) {
          //     router.push(`/${i18n.language}/rooms/${roomId}/game`)
          //     gameStore.setCountdownTime(p.countdownEndTime, p.countdownDurationSeconds, p.backendEpochMillis, p.status)
          //     gameStore.setJoining(false)
          //   }
          //   break

          case "game.playerJoined": {
            if (p.roomId !== roomStore.room?.id) break

            gameStore.setJoinedPlayers(p.joinedPlayers)
            gameStore.setPlayersCount(p.playersCount)

            // 1️⃣ Always update global state first
            gameStore.setAllPlayerSelectedCardIds(p.allSelectedCardIds)

            // 2️⃣ Update user cards only if this payload is about me
            if (user) {
              gameStore.addPlayerSelectedCards(
                p.playerSelectedCardIds,
                Number(p.playerId),
                user.telegramId
              )
            }

            // 3️⃣ Navigation & timers
            if (
              user &&
              p.joinedPlayers.includes(user.telegramId.toString()) &&
              Number(p.playerId) === user.telegramId
            ) {
              router.push(`/${i18n.language}/rooms/${roomId}/game?agentId=${activeAgentId}`)
              gameStore.setCountdownTime(
                p.countdownEndTime,
                p.countdownDurationSeconds,
                p.backendEpochMillis,
                p.status
              )
              gameStore.setJoining(false)
            }

            break
          }


          case "game.playerLeft":
            if (p.roomId !== roomStore.room?.id) break
            p.releasedCardsIds?.forEach((cardId: string) => gameStore.releaseCard(cardId))
            if (user && user.telegramId === Number(p.playerId)) {
              router.replace(`/${i18n.language}?agentId=${activeAgentId}`)
              gameStore.resetGameState()
              roomStore.resetRoom()
              manager.disconnect()
            } else {
              gameStore.removePlayer(p.playerId)
              gameStore.setPlayersCount(p.playersCount)
              if (p.gameState) gameStore.setGameState(p.gameState)
            }
            break

          case "game.started":
            if (p.roomId !== roomStore.room?.id) break
            gameStore.updateStatus(GameStatus.PLAYING)
            gameStore.setStarted(true)
            gameStore.resetDrawnNumbers()
            gameStore.setClaiming(false)
            break

          case "game.numberDrawn":
            if (p.gameId === gameStore.game?.gameId && p.roomId === roomStore.room?.id) {
              gameStore.addDrawnNumber(p.number)
              gameStore.setCurrentDrawnNumber(p.number)
            }
            break

          case "game.ended":
            // if (p.gameId === gameStore.game?.gameId) {
            if (p.roomId === roomStore.room?.id) {
              // For our own win, merge locally known marks so the winner card
              // shows the full pattern even if the server missed the last mark
              if (user && p.hasWinner && Number(p.playerId) === user.telegramId && p.cardId) {
                const myCard = gameStore.game.userSelectedCards?.find((c) => c.cardId === p.cardId)
                if (myCard) {
                  const cardNumbers = new Set(Object.values(myCard.numbers ?? {}).flat())
                  const drawableMarks = (gameStore.game.drawnNumbers ?? []).filter((n) => cardNumbers.has(n))
                  p.markedNumbers = Array.from(new Set([...(p.markedNumbers ?? []), ...(myCard.marked ?? []), ...drawableMarks]))
                }
              }
              gameStore.setWinner(p)
              router.push(`/${i18n.language}/rooms/${roomId}?agentId=${activeAgentId}`)
              gameStore.resetGameState()
              gameStore.setClaiming(false)
            }
            break

          case "game.countdown":
            if (p.roomId !== roomStore.room?.id) break
            gameStore.setCountdownTime(p.countdownEndTime, p.countdownDurationSeconds, p.backendEpochMillis, GameStatus.COUNTDOWN)
            break

          case "room.serverGameState":
            // gameStore.resetGameState()
            if (p.roomId !== roomStore.room?.id) break
            if (p.success && p.gameState) gameStore.setGameState(p.gameState)
            break

          case "game.stateSync":
            // Update all active games states
            // alert("syncing states for room " + p.roomId)
            // alert(JSON.stringify(p.gameState))

            gameStore.syncActiveGamesStates(p.roomId, p.gameState);

            // Update current game state if it belongs to this room
            if (p.roomId === roomStore.room?.id && p.gameState) gameStore.syncCurrentGameState(p.gameState)
            break

          // case "game.state":
          //   // gameStore.resetGameState()
          //   if (p.gameState) gameStore.setGameState(p.gameState)
          //   break

          case "game.initialized":
            if (p.roomId !== roomStore.room?.id) break
            gameStore.resetGameState()
            gameStore.setGameState(p.gameState)
            break

          case "card.markNumberResponse":
            if (p.cardId && Array.isArray(p.numbers)) gameStore.setMarkedNumbersForACard(p.cardId, p.numbers)
            break

          case "game.notEnoughPlayers":
            if (gameStore.game?.roomId === p.roomId) {
              gameStore.updateStatus(p.status)
              gameStore.setPlayersCount(p.joinedPlayers.length)
              gameStore.setJoinedPlayers(p.joinedPlayers)
            }
            break

          case "error":
            if (p.eventType === "bingo.claim" && p.roomId === roomStore.room?.id) {
              gameStore.setClaimError(p)
              gameStore.setClaiming(false)
            } else if (p.eventType === "game.playerJoinRequest" && p.roomId === roomStore.room?.id) {
              gameStore.setJoinError(p.message)
              if (p.failedCards?.length) p.failedCards.forEach((id: string) => gameStore.releaseCardOptimistically(id))
              router.replace(`/${i18n.language}/rooms/${roomId}?agentId=${activeAgentId}`)
            } else if (p.eventType === "game.playerLeaveRequest" && p.roomId === roomStore.room?.id) {
              gameStore.resetGameState()
              roomStore.resetRoom()
              gameStore.setJoining(false)
              router.replace(`/${i18n.language}?agentId=${activeAgentId}`)
            }
            break

          default:
            // unknown message - let consumers subscribe to types if needed
            break
        }
      } catch (err) {
        // non-fatal
        console.error("Error handling WS message:", err)
      }
    }

    // wire events
    manager.on("connecting", onConnecting)
    manager.on("open", onOpen)
    manager.on("close", onClose)
    manager.on("reconnecting", onReconnecting)
    manager.on("latency", onLatency)
    manager.on("error", onError)
    manager.on("message", onMessage)

    // start
    manager.connect()

    // cleanup
    return () => {
      manager.off("connecting", onConnecting)
      manager.off("open", onOpen)
      manager.off("close", onClose)
      manager.off("reconnecting", onReconnecting)
      manager.off("latency", onLatency)
      manager.off("error", onError)
      manager.off("message", onMessage)

      // gracefully disconnect but don't destroy manager object (in case of re-mount you may want to reuse)
      manager.disconnect(true)
      managerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wsUrl, enabled, user?.telegramId, roomId])

  // Exposed actions
  const send = (msg: WSMessage) => managerRef.current?.send(msg)
  const connect = () => managerRef.current?.connect()
  const disconnect = () => managerRef.current?.disconnect(true)
  const reconnect = () => managerRef.current?.reconnect()

  return {
    connected,
    connecting,
    reconnectAttempts,
    latencyMs,
    error,
    send,
    connect,
    disconnect,
    reconnect,

    // game actions wrappers (optional convenience)
    enterRoom: () => {
      if (!roomId || !user?.telegramId) return
      send?.({ type: "room.getGameStateRequest", payload: { roomId, playerId: user.telegramId, capacity: roomStore.room?.capacity } })
    },

    joinGame: (gameId: number, fee: number, userSelectedCardsIds?: string[]) => {
      gameStore.setJoining(true)
      send?.({ type: "game.playerJoinRequest", payload: { gameId, fee, capacity: roomStore.room?.capacity, playerId: user?.telegramId, userSelectedCardsIds } })
    },

    leaveGame: (gameId: number, playerId: string) => {
      send?.({ type: "game.playerLeaveRequest", payload: { gameId, playerId } })
    },

    markNumber: (gameId: number, cardId: string, number: number) => {
      gameStore.addMarkedNumberToCard(cardId, number)
      send?.({ type: "card.markNumberRequest", payload: { gameId: gameId.toString(), playerId: user?.telegramId?.toString(), cardId, number } })
    },

    unmarkNumber: (gameId: number, cardId: string, number: number) => {
      gameStore.removeMarkedNumberFromCard(cardId, number)
      send?.({ type: "card.unmarkNumberRequest", payload: { gameId: gameId.toString(), playerId: user?.telegramId?.toString(), cardId, number } })
    },

    claimBingo: (request: BingoClaimRequestPayloadType) => {
      gameStore.setClaiming(true)
      send?.({ type: "game.bingoClaimRequest", payload: request })
    },

    getCardFromBackend: (cardId: string) => send?.({ type: "game.getCard", payload: { cardId } }),
    
    releaseCard: (gameId: number, cardId: string) => send?.({ type: "card.cardReleaseRequest", payload: { gameId, cardId } }),
  }
}
