"use client"

import { useRoomStore } from "@/lib/stores/room-store"
import { Card, CardContent } from "@/components/ui/card"
import { StartGameButton } from "./start-game-button"
import { useGameStore } from "@/lib/stores/game-store"
import { GameStatus, RoomStatus } from "@/lib/types"

export interface GameControlsProps{
  disabled: boolean
}
export function GameControls({disabled}: GameControlsProps) {
  const { game: {userSelectedCards, userSelectedCardsIds, status }} = useGameStore()
  const {room} = useRoomStore()

  const canStartGame = userSelectedCardsIds?.length > 0 && room?.status === RoomStatus.OPEN
  const gameInProgress = status === GameStatus.PLAYING && room?.status === RoomStatus.OPEN


  return (
    <StartGameButton disabled={!canStartGame || disabled} selectedCards={userSelectedCards?.length} fee={room?.entryFee || 0} />
  )
}
