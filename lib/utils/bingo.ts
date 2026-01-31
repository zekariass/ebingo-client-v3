import type { BingoCard, BingoPattern } from "@/lib/types"

// Generate a standard 75-ball bingo card
export function generateBingoCard(id: number): BingoCard {
  const numbers: number[][] = []
  const marked: boolean[][] = []

  // B: 1-15, I: 16-30, N: 31-45, G: 46-60, O: 61-75
  const ranges = [
    [1, 15], // B
    [16, 30], // I
    [31, 45], // N
    [46, 60], // G
    [61, 75], // O
  ]

  for (let col = 0; col < 5; col++) {
    const colNumbers: number[] = []
    const colMarked: boolean[] = []
    const [min, max] = ranges[col]

    // Generate 5 unique numbers for this column
    const availableNumbers = Array.from({ length: max - min + 1 }, (_, i) => min + i)

    for (let row = 0; row < 5; row++) {
      if (col === 2 && row === 2) {
        // Center square is FREE
        colNumbers.push(0)
        colMarked.push(true)
      } else {
        const randomIndex = Math.floor(Math.random() * availableNumbers.length)
        const number = availableNumbers.splice(randomIndex, 1)[0]
        colNumbers.push(number)
        colMarked.push(false)
      }
    }

    numbers.push(colNumbers)
    marked.push(colMarked)
  }

  // Transpose to get row-major order
  const transposedNumbers = Array.from({ length: 5 }, (_, row) =>
    Array.from({ length: 5 }, (_, col) => numbers[col][row]),
  )

  const transposedMarked = Array.from({ length: 5 }, (_, row) =>
    Array.from({ length: 5 }, (_, col) => marked[col][row]),
  )

  return {
    id,
    numbers: transposedNumbers,
    marked: transposedMarked,
  }
}

// Check if a card has a winning pattern
export function checkWinningPattern(card: BingoCard, pattern: BingoPattern): boolean {
  const { marked } = card

  switch (pattern) {
    case "line":
      return checkLines(marked)
    case "four-corners":
      return checkFourCorners(marked)
    case "full-house":
      return checkFullHouse(marked)
    case "x-pattern":
      return checkXPattern(marked)
    default:
      return false
  }
}

function checkLines(marked: boolean[][]): boolean {
  // Check rows
  for (let row = 0; row < 5; row++) {
    if (marked[row].every((cell) => cell)) return true
  }

  // Check columns
  for (let col = 0; col < 5; col++) {
    if (marked.every((row) => row[col])) return true
  }

  // Check diagonals
  if (marked.every((row, i) => row[i])) return true
  if (marked.every((row, i) => row[4 - i])) return true

  return false
}

function checkFourCorners(marked: boolean[][]): boolean {
  return marked[0][0] && marked[0][4] && marked[4][0] && marked[4][4]
}

function checkFullHouse(marked: boolean[][]): boolean {
  return marked.every((row) => row.every((cell) => cell))
}

function checkXPattern(marked: boolean[][]): boolean {
  // Check both diagonals
  const mainDiagonal = marked.every((row, i) => row[i])
  const antiDiagonal = marked.every((row, i) => row[4 - i])
  return mainDiagonal && antiDiagonal
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
