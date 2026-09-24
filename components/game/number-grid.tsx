"use client"

import { useGameStore } from "@/lib/stores/game-store"
import { cn } from "@/lib/utils"
import { ConnectionStatus } from "../room/connection-status"
import { Badge } from "../ui/badge"
import { LayoutGrid } from "lucide-react"

const BINGO_LETTERS = ["B", "I", "N", "G", "O"]

const generateNumberGrid = () => {
  const grid: number[][] = [[], [], [], [], []]

  // B: 1-15, I: 16-30, N: 31-45, G: 46-60, O: 61-75
  for (let col = 0; col < 5; col++) {
    const start = col * 15 + 1
    const end = start + 14

    for (let num = start; num <= end; num++) {
      grid[col].push(num)
    }
  }

  return grid
}

export function NumberGrid() {
  const {
    game: { drawnNumbers: calledNumbers, roomId, currentDrawnNumber },
  } = useGameStore()
  const numberGrid = generateNumberGrid()


  const headerBgClasses = [
      "!bg-[var(--bingo-card-header-key1-bg)]",
      "!bg-[var(--bingo-card-header-key2-bg)]",
      "!bg-[var(--bingo-card-header-key3-bg)]",
      "!bg-[var(--bingo-card-header-key4-bg)]",
      "!bg-[var(--bingo-card-header-key5-bg)]",
    ];

  return (
    <div className="bg-card rounded-lg border p-2 sm:p-4 w-full">
      
      {/* <h2 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-center text-primary">
        75 Number Grid
      </h2> */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <LayoutGrid className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
          <h2 className="text-xs sm:text-sm font-semibold truncate">Called Numbers</h2>
          <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5">
            {calledNumbers.length}/75
          </Badge>
        </div>
        <ConnectionStatus roomId={roomId} />
      </div>

      <div className="flex items-center justify-center w-full">
        <div className="w-full max-w-3xl">
          {/* Header row: B I N G O */}
          <div className="grid grid-cols-5 gap-0.5 sm:gap-1 mb-3 w-full">
            {BINGO_LETTERS.map((letter, index) => (
              <div
                key={letter}
                className={`h-4 md:h-8 text-primary-foreground flex items-center justify-center rounded-xs font-bold text-xs sm:text-lg shadow-sm ${headerBgClasses[index]}`}
              >
                {letter}
              </div>
            ))}
          </div>

          {/* Number cells */}
          <div className="grid grid-cols-5 gap-0.5 sm:gap-1 w-full">
            {Array.from({ length: 15 }).map((_, row) =>
              BINGO_LETTERS.map((_, col) => {
                const number = numberGrid[col][row]
                const isCalled = calledNumbers.includes(number)

                return (
                  <div
                    key={number}
                    className={cn(
                      "h-7 md:h-10 flex items-center justify-center rounded-xs border-1 transition-all duration-300",
                      isCalled && currentDrawnNumber !== number
                        ? "bg-[var(--bingo-75-number-after-call-bg)] text-[var(--bingo-75-number-after-call-fg)] border-[var(--bingo-75-number-after-call-border)] shadow-md"
                        : isCalled && number === currentDrawnNumber
                          ? "bg-[var(--bingo-75-number-called-current-bg)] text-[var(--bingo-75-number-called-current-fg)] border-[var(--bingo-75-number-called-current-border)]"
                          : "bg-[var(--bingo-75-number-before-call-bg)] text-[var(--bingo-75-number-before-call-fg)] border-[var(--bingo-75-number-before-call-border)] hover:border-primary/50"
                    )}
                  >
                    {number}
                  </div>
                );

              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
