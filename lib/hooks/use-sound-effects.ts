"use client"

import { useCallback, useRef, useState } from "react"

interface SoundEffects {
  numberCalled: () => void
  bingoClaimed: () => void
  gameWon: () => void
  gameStarted: () => void
  cardMarked: () => void
  error: () => void
  enabled: boolean
  setEnabled: (enabled: boolean) => void
  volume: number
  setVolume: (volume: number) => void
}

export function useSoundEffects(): SoundEffects {
  const [enabled, setEnabled] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const audioContextRef = useRef<AudioContext | null>(null)

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return audioContextRef.current
  }, [])

  const playTone = useCallback(
    (frequency: number, duration: number, type: OscillatorType = "sine") => {
      if (!enabled) return

      try {
        const ctx = getAudioContext()
        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(ctx.destination)

        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)
        oscillator.type = type

        gainNode.gain.setValueAtTime(0, ctx.currentTime)
        gainNode.gain.linearRampToValueAtTime(volume * 0.3, ctx.currentTime + 0.01)
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

        oscillator.start(ctx.currentTime)
        oscillator.stop(ctx.currentTime + duration)
      } catch (error) {
        console.warn("Sound effect failed:", error)
      }
    },
    [enabled, volume, getAudioContext],
  )

  const playChord = useCallback(
    (frequencies: number[], duration: number) => {
      frequencies.forEach((freq) => playTone(freq, duration))
    },
    [playTone],
  )

  const numberCalled = useCallback(() => {
    playTone(800, 0.2)
    setTimeout(() => playTone(600, 0.2), 100)
  }, [playTone])

  const bingoClaimed = useCallback(() => {
    playChord([523, 659, 784], 0.5) // C major chord
  }, [playChord])

  const gameWon = useCallback(() => {
    // Victory fanfare
    const notes = [523, 659, 784, 1047] // C, E, G, C
    notes.forEach((note, i) => {
      setTimeout(() => playTone(note, 0.3), i * 150)
    })
  }, [playTone])

  const gameStarted = useCallback(() => {
    playTone(440, 0.3) // A note
    setTimeout(() => playTone(554, 0.3), 200) // C# note
  }, [playTone])

  const cardMarked = useCallback(() => {
    playTone(1000, 0.1, "square")
  }, [playTone])

  const error = useCallback(() => {
    playTone(200, 0.5, "sawtooth")
  }, [playTone])

  return {
    numberCalled,
    bingoClaimed,
    gameWon,
    gameStarted,
    cardMarked,
    error,
    enabled,
    setEnabled,
    volume,
    setVolume,
  }
}
