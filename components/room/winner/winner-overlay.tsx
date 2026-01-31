"use client"

import { useGameStore } from "@/lib/stores/game-store"
import { WinnerDialog } from "./winner-dialog"

export function WinnerOverlay() {
  const winner = useGameStore(state => state.winner)
  const resetWinner = useGameStore(state => state.resetWinner)

  const onClose = () => resetWinner()

  if (!winner.playerName) return null

  return (
    <WinnerDialog
      showResult={true}
      winner={winner}
      onClose={onClose}
    />
  )
}
