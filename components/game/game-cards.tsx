"use client"

import { GameBingoCard } from "./game-bingo-card"
import { useGameStore } from "@/lib/stores/game-store"

interface GameCardsProps {
  selectedCardIds: string[]
}

export function GameCards({ selectedCardIds }: GameCardsProps) {
  const { game: {userSelectedCards: userCards}} = useGameStore()

  if (!userCards || userCards.length === 0) {
    return (
      <div className="space-y-3 sm:space-y-4">
        <div className="text-center">
          <h2 className="text-base sm:text-lg font-bold mb-3 text-primary">Your Selected Cards</h2>
          <p className="text-muted-foreground">No cards selected</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="text-center">
        {/* <h2 className="text-base sm:text-lg font-bold mb-3 text-primary">Your Selected Cards</h2> */}

        {/* <div className="grid grid-cols-5 gap-0.5 sm:gap-1 mb-3">
          {["B", "I", "N", "G", "O"].map((letter) => (
            <div
              key={letter}
              className="bg-primary text-primary-foreground text-center py-2 sm:py-3 rounded-md font-bold text-sm sm:text-lg shadow-sm"
            >
              {letter}
            </div>
          ))}
        </div> */}
      </div>

      <div className="space-y-2 sm:space-y-2">
        {userCards.map((card, index) => (
          <GameBingoCard key={card.cardId} cardInfoId={card.cardId} index={index} />
        ))}
      </div>
    </div>
  )
}
