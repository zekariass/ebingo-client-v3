"use client"

import { useEffect, useRef } from "react"
import { useRoomStore } from "@/lib/stores/room-store"
import { generateBingoCard } from "@/lib/utils/bingo"
import { BINGO_PATTERNS } from "@/lib/utils/bingo-patterns"
import { apiClient } from "@/lib/api/client"
import { useVoiceAnnouncer } from "./use-voice-announcer"

interface GameSimulationOptions {
  enabled: boolean
  roomId: string
  numberCallInterval?: number // milliseconds between number calls
  autoStart?: boolean
}

export function useGameSimulation({
  enabled,
  roomId,
  numberCallInterval = 3000, // 3 seconds between calls
  autoStart = true,
}: GameSimulationOptions) {
  const { setGame, setCalledNumbers, setCurrentNumber, setPattern, setUserCards, selectedCardIds, calledNumbers } =
    useRoomStore()

  const { announceNumber, announceMessage } = useVoiceAnnouncer({
    enabled: true,
    rate: 0.8,
    volume: 0.7,
    onAnnounce: (message: string) => {
      console.log("Number Called:", message)
    },
  })

  const intervalRef = useRef<NodeJS.Timeout>()
  const numbersPoolRef = useRef<number[]>([])

  const isPracticeRoom = roomId === "test-room-1"

  // Initialize simulation
  useEffect(() => {
    if (!enabled || !isPracticeRoom) return

    console.log("[v0] Starting game simulation for practice room")

    console.log("Practice Game Starting: Practice game ready. Numbers will be called manually by admin.")

    setGame({
      id: "practice-game-1",
      roomId,
      status: "active",
      startedAt: new Date().toISOString(),
      currentRound: 1,
      totalRounds: 1,
    })

    const patterns = Object.values(BINGO_PATTERNS)
    const randomPattern = patterns[Math.floor(Math.random() * patterns.length)]
    setPattern(randomPattern)

    if (selectedCardIds.length > 0) {
      const userCards = selectedCardIds.map((cardId) => ({
        id: cardId,
        numbers: generateBingoCard(),
        marked: Array(5)
          .fill(null)
          .map(() => Array(5).fill(false)),
      }))
      userCards.forEach((card) => {
        card.marked[2][2] = true
      })
      setUserCards(userCards)
    }

    numbersPoolRef.current = Array.from({ length: 75 }, (_, i) => i + 1)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [enabled, isPracticeRoom, selectedCardIds, setGame, setPattern, setUserCards])

  useEffect(() => {
    if (!enabled || isPracticeRoom || !autoStart) return
    if (calledNumbers.length >= 75) return

    const startCalling = () => {
      intervalRef.current = setInterval(async () => {
        try {
          const response = await apiClient.callNumber(roomId)
          const calledNumber = response.number

          console.log("[v0] Calling number:", calledNumber)

          announceNumber(calledNumber)

          setCurrentNumber(calledNumber)
          setCalledNumbers([...calledNumbers, calledNumber])
        } catch (error) {
          console.error("[v0] Error calling number:", error)
          const remainingNumbers = numbersPoolRef.current.filter((num) => !calledNumbers.includes(num))

          if (remainingNumbers.length === 0) {
            console.log("[v0] All numbers called, stopping simulation")
            announceMessage("All numbers have been called!")
            console.log("Game Complete: All numbers have been called!")
            if (intervalRef.current) {
              clearInterval(intervalRef.current)
            }
            return
          }

          const randomIndex = Math.floor(Math.random() * remainingNumbers.length)
          const calledNumber = remainingNumbers[randomIndex]

          console.log("[v0] Calling number (fallback):", calledNumber)

          announceNumber(calledNumber)

          setCurrentNumber(calledNumber)
          setCalledNumbers([...calledNumbers, calledNumber])
        }
      }, numberCallInterval)
    }

    const startTimeout = setTimeout(() => {
      announceMessage("Game starting! Good luck!")
      startCalling()
    }, 2000)

    return () => {
      clearTimeout(startTimeout)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [
    enabled,
    isPracticeRoom,
    autoStart,
    calledNumbers,
    numberCallInterval,
    setCurrentNumber,
    setCalledNumbers,
    roomId,
    announceNumber,
    announceMessage,
  ])

  return {
    isSimulating: enabled && isPracticeRoom,
    numbersRemaining: 75 - calledNumbers.length,
  }
}
