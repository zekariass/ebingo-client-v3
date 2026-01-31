// import type { BingoCard } from "./types"

// export function generateUniqueCards(count: number): BingoCard[] {
//   const cards: BingoCard[] = []
//   const usedCombinations = new Set<string>()

//   for (let i = 0; i < count; i++) {
//     let card: BingoCard
//     let combination: string

//     do {
//       card = generateSingleCard(`card_${i + 1}`)
//       combination = card.numbers.flat().join(",")
//     } while (usedCombinations.has(combination))

//     usedCombinations.add(combination)
//     cards.push(card)
//   }

//   return cards
// }

// export function generateSingleCard(id: string): BingoCard {
//   const numbers: number[][] = []
//   const marked: boolean[][] = []

//   // Generate numbers for each column
//   for (let col = 0; col < 5; col++) {
//     const columnNumbers: number[] = []
//     const columnMarked: boolean[] = []

//     // Define range for each column
//     const min = col * 15 + 1
//     const max = col * 15 + 15

//     // Generate available numbers for this column
//     const availableNumbers = []
//     for (let num = min; num <= max; num++) {
//       availableNumbers.push(num)
//     }

//     // Select 5 unique numbers for this column
//     for (let row = 0; row < 5; row++) {
//       if (col === 2 && row === 2) {
//         // Center cell is FREE
//         columnNumbers.push(0) // 0 represents FREE space
//         columnMarked.push(true) // FREE space is always marked
//       } else {
//         const randomIndex = Math.floor(Math.random() * availableNumbers.length)
//         const selectedNumber = availableNumbers.splice(randomIndex, 1)[0]
//         columnNumbers.push(selectedNumber)
//         columnMarked.push(false)
//       }
//     }

//     numbers.push(columnNumbers)
//     marked.push(columnMarked)
//   }

//   // Transpose to get row-major order
//   const transposedNumbers: number[][] = []
//   const transposedMarked: boolean[][] = []

//   for (let row = 0; row < 5; row++) {
//     const rowNumbers: number[] = []
//     const rowMarked: boolean[] = []

//     for (let col = 0; col < 5; col++) {
//       rowNumbers.push(numbers[col][row])
//       rowMarked.push(marked[col][row])
//     }

//     transposedNumbers.push(rowNumbers)
//     transposedMarked.push(rowMarked)
//   }

//   return {
//     id,
//     numbers: transposedNumbers,
//     marked: transposedMarked,
//   }
// }

// export function validateBingo(
//   card: BingoCard,
//   markedNumbers: number[],
//   calledNumbers: number[],
//   pattern: string,
// ): boolean {
//   // Create a marked grid based on called numbers
//   const markedGrid: boolean[][] = card.numbers.map((row) => row.map((num) => num === 0 || calledNumbers.includes(num)))

//   switch (pattern) {
//     case "line":
//       return validateLine(markedGrid)
//     case "diagonal":
//       return validateDiagonal(markedGrid)
//     case "corners":
//       return validateCorners(markedGrid)
//     case "full-house":
//       return validateFullHouse(markedGrid)
//     default:
//       return false
//   }
// }

// function validateLine(grid: boolean[][]): boolean {
//   // Check rows
//   for (let row = 0; row < 5; row++) {
//     if (grid[row].every((cell) => cell)) {
//       return true
//     }
//   }

//   // Check columns
//   for (let col = 0; col < 5; col++) {
//     if (grid.every((row) => row[col])) {
//       return true
//     }
//   }

//   return false
// }

// function validateDiagonal(grid: boolean[][]): boolean {
//   // Check main diagonal (top-left to bottom-right)
//   const mainDiagonal = grid.every((row, i) => row[i])

//   // Check anti-diagonal (top-right to bottom-left)
//   const antiDiagonal = grid.every((row, i) => row[4 - i])

//   return mainDiagonal || antiDiagonal
// }

// function validateCorners(grid: boolean[][]): boolean {
//   return grid[0][0] && grid[0][4] && grid[4][0] && grid[4][4]
// }

// function validateFullHouse(grid: boolean[][]): boolean {
//   return grid.every((row) => row.every((cell) => cell))
// }

// export function getRandomNumber(availableNumbers: number[]): number {
//   const randomIndex = Math.floor(Math.random() * availableNumbers.length)
//   return availableNumbers[randomIndex]
// }

// export function calculatePrize(entryFee: number, playerCount: number, position: number): number {
//   const totalPot = entryFee * playerCount * 0.9 // 90% goes to prizes, 10% house edge

//   // Simple prize distribution - winner takes all for now
//   // Can be modified for multiple winners
//   return totalPot
// }

// export function getLetterForNumber(number: number): string {
//   if (number >= 1 && number <= 15) return "B"
//   if (number >= 16 && number <= 30) return "I"
//   if (number >= 31 && number <= 45) return "N"
//   if (number >= 46 && number <= 60) return "G"
//   if (number >= 61 && number <= 75) return "O"
//   return ""
// }
