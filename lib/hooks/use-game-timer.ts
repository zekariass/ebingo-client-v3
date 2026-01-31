"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRoomStore } from "@/lib/stores/room-store"

interface GameTimer {
  timeRemaining: number
  isActive: boolean
  phase: "waiting" | "starting" | "active" | "finished"
  progress: number // 0-1 for progress bars
}

export function useGameTimer() {
  const { game, room, serverTimeOffset } = useRoomStore()
  const [timer, setTimer] = useState<GameTimer>({
    timeRemaining: 0,
    isActive: false,
    phase: "waiting",
    progress: 0,
  })

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const calculateTimeRemaining = useCallback(
    (targetTime: string) => {
      const target = new Date(targetTime).getTime()
      const now = Date.now() + serverTimeOffset
      return Math.max(0, Math.floor((target - now) / 1000))
    },
    [serverTimeOffset],
  )

  const updateTimer = useCallback(() => {
    if (!room && !game) {
      setTimer({
        timeRemaining: 0,
        isActive: false,
        phase: "waiting",
        progress: 0,
      })
      return
    }

    // Game is active
    if (game?.status === "active") {
      setTimer({
        timeRemaining: 0,
        isActive: true,
        phase: "active",
        progress: 1,
      })
      return
    }

    // Game is finished
    if (game?.status === "finished") {
      setTimer({
        timeRemaining: 0,
        isActive: false,
        phase: "finished",
        progress: 1,
      })
      return
    }

    // Room has next start time
    if (room?.nextStartAt) {
      const remaining = calculateTimeRemaining(room.nextStartAt)
      const isStartingSoon = remaining <= 30

      setTimer({
        timeRemaining: remaining,
        isActive: remaining > 0,
        phase: isStartingSoon ? "starting" : "waiting",
        progress: isStartingSoon ? (30 - remaining) / 30 : 0,
      })
      return
    }

    // Default waiting state
    setTimer({
      timeRemaining: 0,
      isActive: false,
      phase: "waiting",
      progress: 0,
    })
  }, [room, game, calculateTimeRemaining])

  useEffect(() => {
    updateTimer()

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    intervalRef.current = setInterval(updateTimer, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [updateTimer])

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }, [])

  return {
    ...timer,
    formatTime: (seconds?: number) => formatTime(seconds ?? timer.timeRemaining),
  }
}
