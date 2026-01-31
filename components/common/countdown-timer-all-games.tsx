"use client"

import { useEffect, useState } from "react"
import { GameState, GameStatus } from "@/lib/types"

interface CountdownTimerProps {
  label?: string
  gamePage?: boolean
  activeGame?: GameState
}

export function CountdownTimerAllGames({
  activeGame,
  label,
  gamePage = true,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0)

  if (!activeGame) return null

  const { status, countdownDurationSeconds: duration, backendEpochMillis, } = activeGame

  // -------------------------------------------
  // Countdown timer logic
  // -------------------------------------------
  useEffect(() => {
    if (status !== GameStatus.COUNTDOWN) return
    if (!duration || duration <= 0) return

    const timeLeft = Math.max(0, Math.floor((backendEpochMillis - Date.now()) / 1000))
    setTimeLeft(duration - timeLeft)
    // setTimeLeft(duration)

    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0))
    }, 1000)

    return () => clearInterval(interval)
  }, [status, duration])

  // -------------------------------------------
  // Helpers
  // -------------------------------------------
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  const countdownColor = () => {
    if (timeLeft < 10) return "text-red-500"
    if (timeLeft <= 30) return "text-yellow-700"
    return "text-white"
  }

  // -------------------------------------------
  // Rendering
  // -------------------------------------------
  if (status === GameStatus.COUNTDOWN) {
    return (
      <div className="">
        {timeLeft > 0 ? (
          <div className={`font-bold text-sm px-2  ${countdownColor()}`}>
            {formatTime(timeLeft)}
          </div>
        ) : (
          <div className="font-bold text-yellow-500 text-sm px-2 py-1">
            Starting...
          </div>
        )}
      </div>
    )
  }

  if (status === GameStatus.READY && gamePage) {
    return (
      <div className="">
        {label && <div className="text-xs text-white">{label}</div>}
        <div className="text-yellow-500 font-mono text-sm px-2 py-1">
          Starting...
        </div>
      </div>
    )
  }

  return null
}
