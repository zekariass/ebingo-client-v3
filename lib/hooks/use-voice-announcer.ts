"use client"

import { useEffect, useRef } from "react"

interface VoiceAnnouncerOptions {
  enabled: boolean
  voice?: string
  rate?: number
  pitch?: number
  volume?: number
  onAnnounce?: (message: string) => void
}

export function useVoiceAnnouncer({
  enabled = true,
  voice = "default",
  rate = 0.8,
  pitch = 1.0,
  volume = 0.7,
  onAnnounce,
}: VoiceAnnouncerOptions = {}) {
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const voicesRef = useRef<SpeechSynthesisVoice[]>([])

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis

      const loadVoices = () => {
        voicesRef.current = synthRef.current?.getVoices() || []
      }

      loadVoices()
      synthRef.current?.addEventListener("voiceschanged", loadVoices)

      return () => {
        synthRef.current?.removeEventListener("voiceschanged", loadVoices)
      }
    }
  }, [])

  const announceNumber = (number: number) => {
    if (!enabled || !synthRef.current) return

    const utterance = new SpeechSynthesisUtterance()

    // Format the number announcement
    const letter = number <= 15 ? "B" : number <= 30 ? "I" : number <= 45 ? "N" : number <= 60 ? "G" : "O"
    const announcement = `${letter} ${number}`
    utterance.text = announcement

    // Set voice properties
    utterance.rate = rate
    utterance.pitch = pitch
    utterance.volume = volume

    // Try to use a specific voice if available
    if (voicesRef.current.length > 0) {
      const selectedVoice =
        voicesRef.current.find((v) => v.name.toLowerCase().includes(voice.toLowerCase()) || v.lang.includes("en")) ||
        voicesRef.current[0]
      utterance.voice = selectedVoice
    }

    console.log("[v0] Announcing number:", utterance.text)

    onAnnounce?.(announcement)

    synthRef.current.speak(utterance)
  }

  const announceMessage = (message: string) => {
    if (!enabled || !synthRef.current) return

    const utterance = new SpeechSynthesisUtterance(message)
    utterance.rate = rate
    utterance.pitch = pitch
    utterance.volume = volume

    if (voicesRef.current.length > 0) {
      const selectedVoice =
        voicesRef.current.find((v) => v.name.toLowerCase().includes(voice.toLowerCase()) || v.lang.includes("en")) ||
        voicesRef.current[0]
      utterance.voice = selectedVoice
    }

    onAnnounce?.(message)

    synthRef.current.speak(utterance)
  }

  const stopSpeaking = () => {
    synthRef.current?.cancel()
  }

  return {
    announceNumber,
    announceMessage,
    stopSpeaking,
    isSupported: !!synthRef.current,
    voices: voicesRef.current,
  }
}
