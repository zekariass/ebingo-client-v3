// "use client"

// import { useEffect, useState } from "react"
// import { Badge } from "@/components/ui/badge"
// import { useGameStore } from "@/lib/stores/game-store"
// import { GameStatus } from "@/lib/types"
// import { useSystemStore } from "@/lib/stores/system-store"
// import i18n from "@/i18n"
// import { motion } from "framer-motion"

// interface CountdownTimerProps {
//   label?: string
//   gamePage?: boolean
// }

// export function CountdownTimer({ label, gamePage = true }: CountdownTimerProps) {
//   const [timeLeft, setTimeLeft] = useState<number>(0)
//   const setCountdownTime = useGameStore(state => state.setCountdownTime)
//   const duration = useGameStore(state => state.game.countdownDurationSeconds)
//   const backendEpochMillis = useGameStore(state => state.game.backendEpochMillis)
//   const status = useGameStore(state => state.game.status)
//   const currentDrawnNumber = useGameStore(state => state.game.currentDrawnNumber)
//   const [currentLetter, setCurrentLetter] = useState<string>("")
//   const voiceOn = useSystemStore(state => state.voiceOn)
//   const localeChanged = useSystemStore(state => state.localeChanged)
//   const setLocaleChanged = useSystemStore(state => state.setLocaleChanged)

//   // Helper to map number → BINGO letter
//   const getCurrentLetter = (number: number): string => {
//     if (number < 1 || number > 75) return ""
//     const letters = ["B", "I", "N", "G", "O"]
//     const index = Math.floor((number - 1) / 15)
//     return letters[index]
//   }

//   // Countdown logic
//   useEffect(() => {
//     if (status !== GameStatus.COUNTDOWN) return

//     if (duration == null || duration < 0) {
//       console.warn("CountdownTimer: missing or invalid duration")
//       return
//     }

//     const timeLeft = Math.max(0, Math.floor((backendEpochMillis - Date.now()) / 1000))
//     setTimeLeft(duration - timeLeft)

//     // setTimeLeft(duration)

//     const interval = setInterval(() => {
//       setTimeLeft(prev => {
//         const next = prev - 1
//         if (next <= 0) {
//           clearInterval(interval)
//           setCountdownTime("", 0, 0, GameStatus.READY)
//           return 0
//         } else {
//           setCountdownTime("", next, 0, GameStatus.COUNTDOWN)
//           return next
//         }
//       })
//     }, 1000)

//     return () => clearInterval(interval)
//   }, [duration, status, setCountdownTime])

//   // Play number sound when playing
//   const playNumberSound = (number: number | undefined) => {
//     if (!number) return
//     if (localeChanged) {
//       setLocaleChanged(false)
//       return
//     }
//     const audio = new Audio(`/audio/${i18n.language}/${number}.mp3`)
//     audio.play().catch(err => console.warn("Audio blocked:", err))
//   }

//   // Handle drawn number updates
//   useEffect(() => {
//     if (status === GameStatus.PLAYING && currentDrawnNumber) {
//       setCurrentLetter(getCurrentLetter(Number(currentDrawnNumber)))
//       if (voiceOn) playNumberSound(currentDrawnNumber)
//     }
//   }, [currentDrawnNumber, status, voiceOn])

//   const formatTime = (secs: number) => {
//     const mins = Math.floor(secs / 60)
//     const remSecs = secs % 60
//     return `${mins.toString().padStart(2, "0")}:${remSecs.toString().padStart(2, "0")}`
//   }

//   const getBadgeBg = () => {
//     if (timeLeft < 10) return "text-red-500"
//     if (timeLeft <= 30) return "text-yellow-500"
//     return "text-blue-500"
//   }

//   // Render logic
//   if (status === GameStatus.COUNTDOWN) {
//     return (
//       <div className="text-center space-y-1">
//         {label && <div className="text-xs text-white">{label}</div>}
//         {timeLeft >= 0 ? (
//           <div className={`font-bold text-md px-3 py-1 ${getBadgeBg()}`}>
//             Starts In: {formatTime(timeLeft)}
//           </div>
//         ) : (
//           <div className="text-green-500 font-bold text-md px-3 py-1">
//             Starting...
//           </div>
//         )}
//       </div>
//     )
//   }

//   if (status === GameStatus.PLAYING) {
//     return (
//       <div className="text-center">
//         {currentDrawnNumber ? (
//           <motion.div
//             key={currentDrawnNumber}
//             initial={{ scale: 3, opacity: 0 }}
//             animate={{ scale: 1.3, opacity: 1 }}
//             transition={{
//               duration: 2,
//               ease: "easeOut",
//             }}
//             className="text-xl font-extrabold text-yellow-400 drop-shadow-2xl"
//           >
//             <span className="text-green-500">{currentLetter}</span>
//             <span className="text-red-500">-</span>
//             {currentDrawnNumber}
//           </motion.div>
//         ) : (
//           <div className="font-bold text-green-500 text-md px-3 py-1">
//             Calling...
//           </div>
//         )}
//       </div>
//     )
//   }

//   // Default fallback
//   if (status === GameStatus.READY && gamePage) {
//     return (
//       <div className="text-center space-y-1">
//         {label && <div className="text-xs text-white">{label}</div>}
//         <div className="text-yellow-500 font-bold text-md px-3 py-1">
//           Starting Soon...
//         </div>
//       </div>
//     )
//   }

//   return null
// }


"use client"

import { useEffect, useState } from "react"
import { useGameStore } from "@/lib/stores/game-store"
import { GameStatus } from "@/lib/types"
import { useSystemStore } from "@/lib/stores/system-store"
import i18n from "@/i18n"
import { motion } from "framer-motion"
import { useAgentStore } from "@/lib/stores/agent-store"

interface CountdownTimerProps {
  label?: string
  gamePage?: boolean
}

export function CountdownTimer({ label, gamePage = true }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const setCountdownTime = useGameStore(state => state.setCountdownTime)
  const duration = useGameStore(state => state.game.countdownDurationSeconds)
  const backendEpochMillis = useGameStore(state => state.game.backendEpochMillis)
  const status = useGameStore(state => state.game.status)
  const currentDrawnNumber = useGameStore(state => state.game.currentDrawnNumber)
  const [currentLetter, setCurrentLetter] = useState<string>("")
  const voiceOn = useSystemStore(state => state.voiceOn)
  const localeChanged = useSystemStore(state => state.localeChanged)
  const setLocaleChanged = useSystemStore(state => state.setLocaleChanged)
  const { agentDetails } = useAgentStore();

  // Helper to map number → BINGO letter
  const getCurrentLetter = (number: number): string => {
    if (number < 1 || number > 75) return ""
    const letters = ["B", "I", "N", "G", "O"]
    const index = Math.floor((number - 1) / 15)
    return letters[index]
  }

  // Countdown logic
  useEffect(() => {
    if (status !== GameStatus.COUNTDOWN) return

    if (duration == null || duration < 0) {
      console.warn("CountdownTimer: missing or invalid duration")
      return
    }

    const timeLeft = Math.max(0, Math.floor((backendEpochMillis - Date.now()) / 1000))
    setTimeLeft(duration - timeLeft)

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        const next = prev - 1
        if (next <= 0) {
          clearInterval(interval)
          setCountdownTime("", 0, 0, GameStatus.READY)
          return 0
        } else {
          setCountdownTime("", next, 0, GameStatus.COUNTDOWN)
          return next
        }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [duration, status, setCountdownTime, backendEpochMillis])

  // Play number sound when playing
  const playNumberSound = (number: number | undefined) => {
    if (!number) return
    if (localeChanged) {
      setLocaleChanged(false)
      return
    }
    const audio = new Audio(`/audio/${i18n.language}/${number}.mp3`)
    audio.play().catch(err => console.warn("Audio blocked:", err))
  }

  // Handle drawn number updates
  useEffect(() => {
    if (status === GameStatus.PLAYING && currentDrawnNumber) {
      setCurrentLetter(getCurrentLetter(Number(currentDrawnNumber)))
      if (voiceOn && agentDetails?.isMaster) playNumberSound(currentDrawnNumber)
    }
  }, [currentDrawnNumber, status, voiceOn])

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const remSecs = secs % 60
    return `${mins.toString().padStart(2, "0")}:${remSecs.toString().padStart(2, "0")}`
  }

  const getBadgeTextClass = () => {
    if (timeLeft < 10) return "text-[var(--countdown-text-danger)]"
    if (timeLeft <= 30) return "text-[var(--countdown-text-warning)]"
    return "text-[var(--countdown-text-normal)]"
  }

  // Render logic
  if (status === GameStatus.COUNTDOWN) {
    return (
      <div className="text-center space-y-1">
        {label && (
          <div className="text-xs text-[var(--countdown-label-fg)]">
            {label}
          </div>
        )}

        {timeLeft >= 0 ? (
          <div className={`font-bold text-md px-3 py-1 ${getBadgeTextClass()}`}>
            Starts In: {formatTime(timeLeft)}
          </div>
        ) : (
          <div className="font-bold text-md px-3 py-1 text-[var(--countdown-text-starting)]">
            Starting...
          </div>
        )}
      </div>
    )
  }

  if (status === GameStatus.PLAYING) {
    return (
      <div className="text-center">
        {currentDrawnNumber ? (
          <motion.div
            key={currentDrawnNumber}
            initial={{ scale: 3, opacity: 0 }}
            animate={{ scale: 1.3, opacity: 1 }}
            transition={{
              duration: 2,
              ease: "easeOut",
            }}
            className="text-xl font-extrabold drop-shadow-2xl playing-number-glow text-[var(--playing-number-fg)]"
          >
            <span className="text-[var(--playing-letter-fg)]">{currentLetter}</span>
            <span className="text-[var(--playing-separator-fg)]">-</span>
            {currentDrawnNumber}
          </motion.div>
        ) : (
          <div className="font-bold text-md px-3 py-1 text-[var(--countdown-text-starting)]">
            Calling...
          </div>
        )}
      </div>
    )
  }

  // Default fallback
  if (status === GameStatus.READY && gamePage) {
    return (
      <div className="text-center space-y-1">
        {label && (
          <div className="text-xs text-[var(--countdown-label-fg)]">
            {label}
          </div>
        )}
        <div className="font-bold text-md px-3 py-1 text-[var(--countdown-text-warning)]">
          Starting Soon...
        </div>
      </div>
    )
  }

  return null
}
