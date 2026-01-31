"use client"

// import { useRoomStore } from "@/lib/stores/room-store"
import { useGameStore } from "@/lib/stores/game-store"
import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { BingoColumn } from "@/lib/types"
import { Star } from "lucide-react"
// import { useRoomSocket } from "@/lib/hooks/websockets/use-room-socket"

function transformCardData(card?: Partial<Record<BingoColumn, number[]>>) {
  if (!card) return Array(5).fill(null).map(() => Array(5).fill(null))

  const columns = [BingoColumn.B, BingoColumn.I, BingoColumn.N, BingoColumn.G, BingoColumn.O]

  const grid = Array.from({ length: 5 }, (_, rowIndex) =>
    columns.map((col) => card[col]?.[rowIndex] ?? null)
  )

  // Free space in the middle = 0
  grid[2][2] = 0
  return grid
}

interface InteractiveBingoCardProps {
  cardInfoId: string
  index: number
}

export function SelectedCardsView({ cardInfoId, index }: InteractiveBingoCardProps) {
  // const { room } = useRoomStore()

  // const {
  //   game: { drawnNumbers },
  //   getCurrentCardById,
  // } = useGameStore()

  // const { connected: isConnected } = useRoomSocket({
  //   roomId: room?.id ?? -1,
  //   enabled: true,
  // })

  // Directly select card from store
  const currentCard = useGameStore((state) => state.getCurrentCardById(cardInfoId))

  // console.log("==================currentCard=================================>>>>: ", currentCard)

  if (!currentCard) return null

  const cardNumbers = transformCardData(currentCard.numbers)
  const COLUMN_HEADERS = ["B", "I", "N", "G", "O"]

  // const isNumberDrawn = (num: number) => drawnNumbers.includes(num)
  // const isMarked = (num: number) => currentCard.marked?.includes(num)

    const headerBgClasses = [
    "!bg-[var(--bingo-card-header-key1-bg)]",
    "!bg-[var(--bingo-card-header-key2-bg)]",
    "!bg-[var(--bingo-card-header-key3-bg)]",
    "!bg-[var(--bingo-card-header-key4-bg)]",
    "!bg-[var(--bingo-card-header-key5-bg)]",
  ];
  return (
    <div className="border rounded-lg p-1 w-full max-w-xs mx-auto">
      {/* Card Header */}
      {/* <div className="flex items-center justify-center mb-2">
        <Badge variant="outline" className="font-mono text-xs">
          Card #{index + 1}
        </Badge>
      </div> */}

      {/* Column Headers */}
      <div className="grid grid-cols-5 gap-0.5 mb-2 rounded-xs">
        {COLUMN_HEADERS.map((letter, index) => (
          <Button
            key={letter}
            disabled={true}
            
            className={`h-6 md:h-8 flex items-center justify-center font-bold text-white rounded ${headerBgClasses[index]}`}
          >
            {letter}
          </Button>
        ))}
      </div>

      {/* Numbers Grid */}
      <div className="grid grid-cols-5 gap-0.5">
        {cardNumbers.map((row, rowIndex) =>
          row.map((number, colIndex) => {
            const free = rowIndex === 2 && colIndex === 2
            // const marked = (number !== null && isMarked(number)) || free
            // const clickable = isConnected && !free && number !== null && isNumberDrawn(number)

            return (
              <Button
                key={`${rowIndex}-${colIndex}`}
                // variant="outline"
                size="sm"
                className={cn(
                  "h-6 md:h-10 w-full text-sm font-semibold relative rounded-xs text-white !bg-[var(--bingo-key-bg-free)]",
                  free && "bg-yellow-500 border-yellow-400 cursor-default",
                )}
                disabled
              >
                {/* {free ? "⭐" : number} */}
                {free ? <Star fill="currentColor" strokeWidth="0" className="text-white" /> : number}
                
              </Button>
            )
          })
        )}
      </div>
    </div>
  )
}


