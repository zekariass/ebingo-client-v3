import { BingoColumn, GamePattern } from "@/lib/types"

// Check if a live game card (column-keyed numbers + flat marked list) satisfies the room pattern
export function checkCardPatternWin(
  numbers: Partial<Record<BingoColumn, number[]>> | undefined,
  markedNumbers: number[] | undefined,
  pattern: GamePattern,
): boolean {
  if (!numbers || !markedNumbers) return false

  const columns = [BingoColumn.B, BingoColumn.I, BingoColumn.N, BingoColumn.G, BingoColumn.O]
  const size = 5

  // Build row-major 5x5 grid; center cell is FREE
  const grid = Array.from({ length: size }, (_, row) =>
    columns.map((col) => numbers[col]?.[row] ?? 0),
  )
  grid[2][2] = 0

  const isMarked = (num: number) => num === 0 || markedNumbers.includes(num)

  const cornersMarked = () =>
    isMarked(grid[0][0]) &&
    isMarked(grid[0][size - 1]) &&
    isMarked(grid[size - 1][0]) &&
    isMarked(grid[size - 1][size - 1])

  const lineMarked = () => {
    // Horizontal
    if (grid.some((row) => row.every(isMarked))) return true
    // Vertical
    for (let c = 0; c < size; c++) {
      if (grid.every((row) => isMarked(row[c]))) return true
    }
    // Diagonals
    return (
      grid.every((row, i) => isMarked(row[i])) ||
      grid.every((row, i) => isMarked(row[size - 1 - i]))
    )
  }

  switch (pattern) {
    case GamePattern.LINE:
      return lineMarked()
    case GamePattern.LINE_AND_CORNERS:
      return lineMarked() || cornersMarked()
    case GamePattern.CORNERS:
      return cornersMarked()
    case GamePattern.FULL_HOUSE:
      return grid.every((row) => row.every(isMarked))
    default:
      return false
  }
}

// Get the column letter for a number (B, I, N, G, O)
export function getColumnLetter(number: number): string {
  if (number >= 1 && number <= 15) return "B"
  if (number >= 16 && number <= 30) return "I"
  if (number >= 31 && number <= 45) return "N"
  if (number >= 46 && number <= 60) return "G"
  if (number >= 61 && number <= 75) return "O"
  return ""
}

// Format number with column letter (e.g., "B7", "N42")
export function formatBingoNumber(number: number): string {
  return `${getColumnLetter(number)}${number}`
}
