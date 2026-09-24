"use client"

import { GameBingoCard } from "./game-bingo-card"
import { useGameStore } from "@/lib/stores/game-store"
import { Switch } from "@/components/ui/switch"

interface GameCardsProps {
  selectedCardIds: string[]
  autoPlay: boolean
  onAutoPlayChange: (checked: boolean) => void
}

export function GameCards({ selectedCardIds, autoPlay, onAutoPlayChange }: GameCardsProps) {
  const { game: {userSelectedCards: userCards}} = useGameStore()

  if (!userCards || userCards.length === 0) {
    return (
      <div className="space-y-3 sm:space-y-4">
        <div className="text-center">
          <h2 className="text-base sm:text-lg font-bold mb-3 text-primary">Your Cards</h2>
          <p className="text-muted-foreground">No cards selected</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2 sm:space-y-3 mt-2">
      <div className="flex items-center justify-center gap-0.5">
        <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">Auto Play</span>
        <Switch
          checked={autoPlay}
          onCheckedChange={onAutoPlayChange}
          className="scale-[0.6]"
        />
      </div>

      <div className="space-y-2 sm:space-y-2">
        {userCards.map((card, index) => (
          <GameBingoCard key={card.cardId} cardInfoId={card.cardId} index={index} />
        ))}
      </div>
    </div>
  )
}
