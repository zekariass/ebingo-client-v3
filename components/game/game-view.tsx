"use client"

import { useEffect, useState } from "react"
import { useRoomStore } from "@/lib/stores/room-store"
// import { useWebSocketEvents } from "@/lib/hooks/websockets/use-websocket-events"
import { GameHeader } from "./game-header"
import { NumberGrid } from "./number-grid"
import { GameCards } from "./game-cards"
import { useGameStore } from "@/lib/stores/game-store"
import { Button } from "../ui/button"
import { userStore } from "@/lib/stores/user-store"
import { CountdownTimer } from "../common/countdown-timer"
import { Badge } from "../ui/badge"
import { GameStatus } from "@/lib/types"
import { useRouter } from "next/navigation"
import i18n from "@/i18n"
import { useSystemStore } from "@/lib/stores/system-store"
import { motion } from "framer-motion";
import { useRoomSocket } from "@/lib/hooks/websockets/use-room-socket"
import { useAgentStore } from "@/lib/stores/agent-store"

interface GameViewProps {
  roomId: number
}

export function GameView({ roomId }: GameViewProps) {
  const {activeAgentId} = useAgentStore();
  const gameId = useGameStore(state => state.game.gameId)
  const [currentLetter, setCurrentLetter] = useState<string>("")
  const selectedCardIds = useGameStore(state => state.game.userSelectedCardsIds)
  // const countdownEndTime = useGameStore(state => state.game.countdownEndTime)
  const status = useGameStore(state => state.game.status)
  const currentDrawnNumber = useGameStore(state => state.game.currentDrawnNumber)
  // const voiceOn = useSystemStore(state => state.voiceOn)
  const setLocaleChanged = useSystemStore(state => state.setLocaleChanged)
  const localeChanged = useSystemStore(state => state.localeChanged)

  const telegramId = userStore(state => state.user?.telegramId)
  // const { leaveGame, connected, connect } = useWebSocketEvents({ roomId, enabled: true })
  const { leaveGame, connected, connect } = useRoomSocket({ roomId, enabled: true })
  const router = useRouter()

  router.prefetch(`/${i18n.language}`)
  //useAutoRefreshGameState(roomId, 3000);

  const [isLeaving, setLeaving] = useState(false)

  const { room, loading, fetchRoom } = useRoomStore()

  // const getCurrentLetter = (number: number): string => {
  //   if (number < 1 || number > 75) throw new Error("Number must be between 1 and 75");

  //   const letters = ["B", "I", "N", "G", "O"];
  //   const index = Math.floor((number - 1) / 15);
  //   return letters[index];
  // };



  //  const playNumberSound = (number: number | undefined) => {
  //   if (!number) return;
  //   if (localeChanged){
  //     setLocaleChanged(false)
  //     return
  //   }
  //   const audio = new Audio(`/audio/${i18n.language}/${number}.mp3`);
  //   audio.play().catch((err) => console.warn("Audio blocked:", err));
  // };


  // useEffect(() => {
  //   setCurrentLetter(getCurrentLetter(Number(currentDrawnNumber)))
  //   if (currentDrawnNumber !== null && currentDrawnNumber !==undefined && status === GameStatus.PLAYING && voiceOn) {
  //     playNumberSound(currentDrawnNumber);
  //   }

  // }, [currentDrawnNumber, status, voiceOn]);

  // Fetch room data once
  useEffect(() => {
    const init = async () => {
      try {
        await fetchRoom(roomId)
      } catch (err) {
        console.error("Failed to initialize room data:", err)
      }
    }
    init()
  }, [fetchRoom, roomId])


  const handleLeaveGame = async () => {
    if (!gameId || !telegramId) {
      router.replace(`/${i18n.language}?agentId=${activeAgentId}`)
      return
    }

    setLeaving(true)
    // router.replace(`/${i18n.language}`)
    try {
      await leaveGame(gameId, telegramId.toString())
    } catch (err) {
      console.error("Failed to leave game:", err)
      setLeaving(false)
    }
  }


  // const handleRefresh = async () => {
  //   setRefreshing(true)
  //   await connect()
  //   setRefreshing(false)
  // }


  if (gameId === null || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-muted-foreground">Loading game...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <GameHeader room={room} connected={connected} />

      <div className="m-3 flex justify-center">
        <div className="flex flex-wrap gap-3 text-xs sm:text-sm">

          {/* BEFORE CALL (Disabled / not called) */}
          <div className="flex items-center gap-2 rounded-md bg-card px-3 py-1.5 border border-border opacity-60">
            <span className="text-muted-foreground">ያልተጠራ</span>
            <button
              disabled
              className="
                inline-flex h-6 w-6 items-center justify-center rounded-sm
                bg-[var(--bingo-card-key-legend-before-call-bg)]
                text-[var(--bingo-card-key-legend-before-call-fg)]
                border border-[var(--bingo-card-key-legend-before-call-border)]
                cursor-not-allowed
              "
            />
          </div>

          {/* AFTER CALL (unmarked) */}
          <div className="flex items-center gap-2 rounded-md bg-card px-3 py-1.5 border border-border">
            <span className="text-foreground">የተጠራ</span>
            <button
              className="
                inline-flex h-6 w-6 items-center justify-center rounded-sm
                bg-[var(--bingo-card-key-legend-after-call-unmarked-bg)]
                text-[var(--bingo-card-key-legend-after-call-unmarked-fg)]
                border border-white
              "
            />
          </div>

          {/* MARKED */}
          <div className="flex items-center gap-2 rounded-md bg-card px-3 py-1.5 border border-border">
            <span className="text-foreground">ማርክ የተደረገ</span>
            <button
              className="
                inline-flex h-6 w-6 items-center justify-center rounded-sm
                bg-[var(--bingo-card-key-legend-after-call-marked-bg)]
                text-[var(--bingo-card-key-legend-after-call-marked-fg)]
                border border-white
              "
            />
          </div>

        </div>
      </div>

    
      <div className="container mx-auto p-2 sm:p-4">
        <div className="grid grid-cols-2 gap-1 sm:gap-2 lg:gap-2">
          <div className="order-1">
            <NumberGrid />
          </div>

          <div className="order-2 sm:order-2">
            <div
              className="
                rounded-xl h-12 w-full max-w-xs mx-auto p-1
                border
                bg-[var(--game-countdown-and-call-area-bg)]
                border-[var(--game-countdown-and-call-area-border)]
              "
            >
              <div className="flex items-center justify-center h-full">
                <CountdownTimer label="" />
              </div>
            </div>
            
            <GameCards selectedCardIds={selectedCardIds} />
          </div>
        </div>

        <div className="py-4 px-3 flex flex-row items-center justify-center gap-3 w-full">
          {/* <Button
            onClick={handleRefresh}
            disabled={isLeaving || refreshing}
            className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-4 text-lg rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button> */}

          <Button
            onClick={handleLeaveGame}
            disabled={isLeaving}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-4 text-lg rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {isLeaving ? "Leaving..." : "Leave Game"}
          </Button>
        </div>


      </div>
    </div>
  )
}

