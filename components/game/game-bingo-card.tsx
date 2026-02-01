"use client"

import { useEffect } from "react"
import { useRoomStore } from "@/lib/stores/room-store"
import { useGameStore } from "@/lib/stores/game-store"
import { Button } from "@/components/ui/button"
import { BingoColumn, GamePattern, BingoClaimRequestPayloadType } from "@/lib/types"
// import { useWebSocketEvents } from "@/lib/hooks/websockets/use-websocket-events"
import { userStore } from "@/lib/stores/user-store"
import { cn } from "@/lib/utils"
import { Star } from "lucide-react"
import { useRoomSocket } from "@/lib/hooks/websockets/use-room-socket"

const COLUMN_HEADERS = ["B", "I", "N", "G", "O"]

// Utility: normalize card into 5x5 grid
function transformCardData(card?: Partial<Record<BingoColumn, number[]>>) {
  const columns = [BingoColumn.B, BingoColumn.I, BingoColumn.N, BingoColumn.G, BingoColumn.O]

  if (!card) {
    return Array.from({ length: 5 }, () => Array(5).fill(0))
  }

  const grid = Array.from({ length: 5 }, (_, row) =>
    columns.map((col) => card[col]?.[row] ?? 0)
  )

  // Force free space in the middle
  grid[2][2] = 0
  return grid
}

interface GameBingoCardProps {
  cardInfoId: string
  index: number
}

export function GameBingoCard({ cardInfoId, index }: GameBingoCardProps) {
  // useTelegramInit()

  const { room } = useRoomStore()
  const {
    game: { gameId, drawnNumbers, roomId, started },
    claimError,
    claiming,
    addMarkedNumberToCard,
    removeMarkedNumberFromCard,
    resetClaimError
  } = useGameStore()

  // const { markNumber: markNumberInBackend, unmarkNumber: unMarkNumberInBackend, claimBingo } =
  //   useWebSocketEvents({ roomId, enabled: true })

  const {markNumber: markNumberInBackend, unmarkNumber: unMarkNumberInBackend, claimBingo, connected: isConnected} = useRoomSocket({roomId, enabled: !!roomId})

  const currentCard = useGameStore((state) =>
    state.game.userSelectedCards?.find((card) => card.cardId === cardInfoId)
  )

  const userId = userStore((state) => state.user?.telegramId)
  const userDbId = userStore((state) => state.user?.id)
  let userName = userStore(
    (state) => `${state.user?.nickname ?? state.user?.firstName}`.trim()
  )

  if (!currentCard) return null

  const cardNumbers = transformCardData(currentCard.numbers)

  const isNumberDrawn = (num: number) => drawnNumbers.includes(num)
  const isMarked = (num: number) => currentCard.marked?.includes(num)

  const handleCellClick = (num: number, row: number, col: number) => {
    const free = row === 2 && col === 2
    if (free || num === 0) return
    if (!isNumberDrawn(num)) return

    if (isMarked(num)) {
      removeMarkedNumberFromCard(currentCard.cardId, num)
      unMarkNumberInBackend(gameId, cardInfoId, num)
    } else {
      addMarkedNumberToCard(currentCard.cardId, num)
      markNumberInBackend(gameId, cardInfoId, num)
    }
  }

  // Auto clear claim error after 5s
  useEffect(() => {
    if (!claimError) return
    const timer = setTimeout(() => resetClaimError(), 5000)
    return () => clearTimeout(timer)
  }, [claimError, resetClaimError])

  const claimPayload: BingoClaimRequestPayloadType = {
    gameId,
    cardId: cardInfoId,
    pattern: room?.pattern ?? GamePattern.LINE_AND_CORNERS,
    playerId: userId?.toString() ?? "",
    userProfileId: userDbId, 
    playerName: userName,
    markedNumbers: currentCard.marked ?? [],
    card: currentCard
  }

  const handleBingoClaim = () => {
    if (!isConnected || !started || !userId) return
    claimBingo(claimPayload)
  }

  const headerBgClasses = [
    "!bg-[var(--bingo-card-header-key1-bg)]",
    "!bg-[var(--bingo-card-header-key2-bg)]",
    "!bg-[var(--bingo-card-header-key3-bg)]",
    "!bg-[var(--bingo-card-header-key4-bg)]",
    "!bg-[var(--bingo-card-header-key5-bg)]",
  ];

  return (
      <div className="border rounded-lg p-1 w-full max-w-xs mx-auto bg-[var(--card)]">
        {/* Header */}
        <div className="mb-2">
          {/* <div className="flex items-center justify-center gap-2">
            <Badge variant="outline" className="font-mono text-xs">
              Card #{index + 1}
            </Badge>
          </div> */}
          {claimError && cardInfoId === claimError?.cardId && (
            <div className="text-center text-xs text-red-500 mt-1">
              {claimError?.message}
            </div>
          )}
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-5 gap-0.5 mb-1">
          {COLUMN_HEADERS.map((letter, index) => (
            <div
              key={letter}
              className={`h-4 md:h-8 flex items-center justify-center font-bold text-primary-foreground rounded ${headerBgClasses[index]}`}
            >
              {letter}
            </div>
          ))}
        </div>

        {/* Card numbers */}
        <div className="grid grid-cols-5 gap-0.5">
          {cardNumbers.map((row, rowIndex) =>
            row.map((num, colIndex) => {
              const free = rowIndex === 2 && colIndex === 2
              const marked = isMarked(num) || free
              const clickable = isConnected && !free && isNumberDrawn(num)

              return (
                <Button
                  key={`${rowIndex}-${colIndex}`}
                  size="sm"
                  disabled={free || !clickable}
                  onClick={!free ? () => handleCellClick(num, rowIndex, colIndex) : undefined}
                  className={cn(
                    "h-7 md:h-10 w-full text-xs sm:text-sm font-semibold relative rounded-xs text-white transition-colors",

                    /* FREE cell */
                    free &&
                      "!bg-[var(--playing-card-key-free-bg)] border-1 border-[var(--playing-card-key-free-border)] cursor-default",

                    /* BEFORE CALL (unmarked, clickable) */
                    !free &&
                      !marked &&
                      clickable &&
                      "!bg-[var(--playing-card-key-before-call-bg)] border-1 border-[var(--playing-card-key-before-call-border)] text-[var(--playing-card-key-before-call-fg)]",

                    /* AFTER CALL (unmarked, not clickable) */
                    !free &&
                      !marked &&
                      !clickable &&
                      "!bg-[var(--playing-card-key-after-call-unmarked-bg)] text-[var(--playing-card-key-after-call-unmarked-fg)] opacity-50 cursor-not-allowed",

                    /* MARKED */
                    marked &&
                      !free &&
                      "!bg-[var(--playing-card-key-after-call-marked-bg)] border-1 border-[var(--playing-card-key-after-call-marked-border)] text-[var(--playing-card-key-after-call-marked-fg)]"
                  )}
                >
                  {free ? (
                    <Star fill="currentColor" strokeWidth="0" className="text-white" />
                  ) : (
                    num
                  )}
                </Button>
              );
            })
          )}
        </div>

        {/* Claim button */}
        <div className="mt-2">
          <Button
            onClick={handleBingoClaim}
            disabled={!isConnected || !started || !userId}
            className="h-7 w-full font-mono text-lg sm:text-base bg-yellow-700 hover:bg-yellow-900 text-white cursor-pointer"
          >
            {!claiming ? "BINGO" : "CLAIMING..."}
          </Button>
        </div>
      </div>
  )
}
