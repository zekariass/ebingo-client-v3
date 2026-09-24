"use client"

import { Card, CardContent} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SelectedCardsView } from "./selected-cards-view"
import { useGameStore } from "@/lib/stores/game-store"
import { useRoomStore } from "@/lib/stores/room-store"

export function SelectedCardsPanel() {
  const { game: {userSelectedCards} } = useGameStore()
  const maxCards = useRoomStore(state => state.room?.maxCards || 1)

  // useEffect(() => {
  //   computePlayerCardsFromPlayerCardsIds()
  // }, [computePlayerCardsFromPlayerCardsIds, userSelectedCardsIds])

  if (userSelectedCards?.length === 0) {
    return null
  }

  return (
    <Card className="p-0 overflow-hidden">
      <div className="flex items-center justify-between px-3 sm:px-4 pt-3 pb-1">
        <h3 className="text-sm font-semibold">Your Cards</h3>
        <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5">
          {userSelectedCards?.length}/{maxCards}
        </Badge>
      </div>
      <CardContent className="p-2 sm:p-4 sm:pt-2">

        <div
          // className={`grid gap-1 sm:gap-2 md:gap-4 w-full ${userSelectedCards?.length === 1 ? "grid-cols-2 sm:grid-cols-2" : "grid-cols-2"
          //   }`}
          className={`
            w-full gap-2 sm:gap-3 md:gap-4
            ${
              maxCards === 2
                ? "grid grid-cols-2 lg:grid-cols-1"
                : "flex justify-center"
            }
          `}
        >
          {userSelectedCards?.map((cardInfo, index) => (
            <div key={cardInfo.cardId} className="w-full">
              <SelectedCardsView cardInfoId={cardInfo.cardId} index={index} />
            </div>
          ))}
          {(userSelectedCards?.length === 1 && maxCards === 2) && (
            <div className="w-full flex items-center justify-center border-2 border-dashed border-muted rounded-lg min-h-[120px] sm:flex">
              <p className="text-muted-foreground text-xs sm:text-sm text-center px-2">
                Select a second card above to play with two
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
