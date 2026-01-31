"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useBingoGameWebSocket } from "@/lib/hooks/websockets/use-bingo-game-websocket"
import type {
  GameStatePayload,
  NumberCalledPayload,
  GamePlayer,
  GameWinner,
  PlayerMarkPayload,
  BingoClaimPayload,
  WebSocketConnectionState,
} from "@/lib/types/websocket"

interface WebSocketContextValue {
  // Connection state
  connectionState: WebSocketConnectionState
  isConnected: boolean
  isConnecting: boolean

  // Game state
  gameState: {
    gameId: string
    status: "waiting" | "starting" | "active" | "paused" | "finished"
    currentNumber?: number
    calledNumbers: number[]
    players: GamePlayer[]
    winners: GameWinner[]
    nextNumberIn?: number
    lastUpdated: Date
  }

  // Connection actions
  connect: () => void
  disconnect: () => void
  reconnect: () => void

  // Game actions
  joinGame: (cardIds: string[]) => Promise<boolean>
  leaveGame: () => Promise<boolean>
  markNumber: (cardId: string, number: number, position: { row: number; col: number }) => Promise<boolean>
  claimBingo: (cardId: string, pattern: string, winningNumbers: number[]) => Promise<boolean>
  setReady: (isReady: boolean) => Promise<boolean>

  // Utility functions
  getCurrentPlayer: () => GamePlayer | undefined
  getPlayerMarkedNumbers: (cardId: string) => number[]
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null)

interface WebSocketProviderProps {
  children: React.ReactNode
  gameId: string
  playerId: string
  playerName: string
  enabled?: boolean
}

export function WebSocketProvider({ children, gameId, playerId, playerName, enabled = true }: WebSocketProviderProps) {
  const [events, setEvents] = useState<{
    numberCalled?: NumberCalledPayload
    gameStateUpdate?: GameStatePayload
    playerJoined?: GamePlayer
    playerLeft?: string
    playerMarked?: PlayerMarkPayload
    bingoClaimed?: BingoClaimPayload
    winnerDeclared?: GameWinner[]
  }>({})

  const webSocket = useBingoGameWebSocket({
    gameId,
    playerId,
    playerName,
    enabled,
    onNumberCalled: (payload) => {
      setEvents((prev) => ({ ...prev, numberCalled: payload }))
    },
    onGameStateUpdate: (payload) => {
      setEvents((prev) => ({ ...prev, gameStateUpdate: payload }))
    },
    onPlayerJoined: (player) => {
      setEvents((prev) => ({ ...prev, playerJoined: player }))
    },
    onPlayerLeft: (playerId) => {
      setEvents((prev) => ({ ...prev, playerLeft: playerId }))
    },
    onPlayerMarked: (payload) => {
      setEvents((prev) => ({ ...prev, playerMarked: payload }))
    },
    onBingoClaimed: (payload) => {
      setEvents((prev) => ({ ...prev, bingoClaimed: payload }))
    },
    onWinnerDeclared: (winners) => {
      setEvents((prev) => ({ ...prev, winnerDeclared: winners }))
    },
  })

  const contextValue: WebSocketContextValue = {
    ...webSocket,
  }

  return <WebSocketContext.Provider value={contextValue}>{children}</WebSocketContext.Provider>
}

export function useWebSocketContext() {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error("useWebSocketContext must be used within a WebSocketProvider")
  }
  return context
}

// Custom hooks for specific WebSocket events
export function useNumberCalled(callback?: (payload: NumberCalledPayload) => void) {
  const { gameState } = useWebSocketContext()

  useEffect(() => {
    if (gameState.currentNumber && callback) {
      callback({
        gameId: gameState.gameId,
        number: gameState.currentNumber,
        letter: getColumnLetter(gameState.currentNumber),
        sequence: gameState.calledNumbers.length,
        calledNumbers: gameState.calledNumbers,
        timestamp: gameState.lastUpdated.toISOString(),
      })
    }
  }, [gameState.currentNumber, gameState.calledNumbers, callback])

  return {
    currentNumber: gameState.currentNumber,
    calledNumbers: gameState.calledNumbers,
    lastCalled: gameState.lastUpdated,
  }
}

export function useGameStatus() {
  const { gameState } = useWebSocketContext()

  return {
    status: gameState.status,
    isWaiting: gameState.status === "waiting",
    isActive: gameState.status === "active",
    isFinished: gameState.status === "finished",
    winners: gameState.winners,
    nextNumberIn: gameState.nextNumberIn,
  }
}

export function useGamePlayers() {
  const { gameState, getCurrentPlayer } = useWebSocketContext()

  return {
    players: gameState.players,
    currentPlayer: getCurrentPlayer(),
    playerCount: gameState.players.length,
    readyCount: gameState.players.filter((p) => p.isReady).length,
  }
}

// Helper function to get column letter for bingo number
function getColumnLetter(number: number): "B" | "I" | "N" | "G" | "O" {
  if (number >= 1 && number <= 15) return "B"
  if (number >= 16 && number <= 30) return "I"
  if (number >= 31 && number <= 45) return "N"
  if (number >= 46 && number <= 60) return "G"
  if (number >= 61 && number <= 75) return "O"
  return "B" // fallback
}
