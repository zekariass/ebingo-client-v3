// "use client"

// import { BingoColumn, GamePattern } from "@/lib/types"

// interface WinnerCardViewProps {
//   card: Partial<Record<BingoColumn, number[]>> | undefined
//   markedNumbers: number[] | undefined
//   pattern: GamePattern
// }

// export function WinnerCardView({ card, markedNumbers, pattern }: WinnerCardViewProps) {
//   if (!card || !markedNumbers) return null

//   const columns = Object.values(BingoColumn)
//   const size = 5

//   // Build 5x5 grid
//   const grid: (number | "FREE")[][] = []
//   for (let row = 0; row < size; row++) {
//     grid[row] = []
//     for (let col = 0; col < size; col++) {
//       const columnKey = columns[col]
//       const columnNumbers = card[columnKey] || []
//       const value = columnNumbers[row] ?? null
//       grid[row][col] = row === 2 && col === 2 ? "FREE" : value
//     }
//   }

//   const isMarked = (num: number | "FREE") => num === "FREE" || (num != null && markedNumbers.includes(num))

//   // Compute winning positions dynamically
//   const winningPositions = new Set<string>()

//   const markRow = (r: number) => grid[r].forEach((_, c) => winningPositions.add(`${r}-${c}`))
//   const markCol = (c: number) => grid.forEach((row, r) => winningPositions.add(`${r}-${c}`))
//   const markDiagonal = (dir: "tl-br" | "tr-bl") => {
//     for (let i = 0; i < size; i++) {
//       const r = i
//       const c = dir === "tl-br" ? i : size - 1 - i
//       winningPositions.add(`${r}-${c}`)
//     }
//   }

//   if (pattern === GamePattern.FULL_HOUSE) {
//     grid.forEach((row, r) => row.forEach((_, c) => winningPositions.add(`${r}-${c}`)))
//   } else if (pattern === GamePattern.CORNERS) {
//     winningPositions.add("0-0")
//     winningPositions.add("0-4")
//     winningPositions.add("4-0")
//     winningPositions.add("4-4")
//   } else if (pattern === GamePattern.LINE || pattern === GamePattern.LINE_AND_CORNERS) {
//     // Horizontal
//     for (let r = 0; r < size; r++) if (grid[r].every(n => isMarked(n))) { markRow(r); break }
//     // Vertical
//     for (let c = 0; c < size; c++) if (grid.every(row => isMarked(row[c]))) { markCol(c); break }
//     // Diagonal TL-BR
//     if (grid.every((row, i) => isMarked(row[i]))) markDiagonal("tl-br")
//     // Diagonal TR-BL
//     if (grid.every((row, i) => isMarked(row[size - 1 - i]))) markDiagonal("tr-bl")
//     // Add corners if LINE_AND_CORNERS
//     if (pattern === GamePattern.LINE_AND_CORNERS) {
//       winningPositions.add("0-0")
//       winningPositions.add("0-4")
//       winningPositions.add("4-0")
//       winningPositions.add("4-4")
//     }
//   }

//   return (
//     <div className="w-full max-w-sm mx-auto mt-4">
//       <div className="grid grid-cols-5 gap-1">
//         {/* Column headers */}
//         {columns.map(col => (
//           <div key={col} className="h-6 flex items-center justify-center font-bold text-sm bg-gray-200 dark:bg-gray-700 rounded">
//             {col}
//           </div>
//         ))}

//         {/* Grid numbers */}
//         {grid.map((row, r) =>
//           row.map((num, c) => {
//             const key = `${r}-${c}`
//             const marked = isMarked(num)
//             const isWinning = winningPositions.has(key)

//             return (
//               <div
//                 key={key}
//                 className={`
//                   flex items-center justify-center
//                   aspect-square w-full
//                   rounded text-sm font-semibold
//                   ${isWinning ? "bg-green-500 text-white" :
//                     marked ? "bg-violet-600 text-white" :
//                     "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"}
//                 `}
//               >
//                 {num ?? ""}
//               </div>
//             )
//           })
//         )}
//       </div>
//     </div>
//   )
// }


"use client"

import { BingoColumn, GamePattern } from "@/lib/types"

interface WinnerCardViewProps {
  card: Partial<Record<BingoColumn, number[]>> | undefined
  markedNumbers: number[] | undefined
  pattern: GamePattern
}

export function WinnerCardView({ card, markedNumbers, pattern }: WinnerCardViewProps) {
  if (!card || !markedNumbers) return null

  const columns = Object.values(BingoColumn)
  const size = 5

  // Build 5x5 grid
  const grid: (number | "FREE")[][] = []
  for (let row = 0; row < size; row++) {
    grid[row] = []
    for (let col = 0; col < size; col++) {
      const columnKey = columns[col]
      const columnNumbers = card[columnKey] || []
      const value = columnNumbers[row] ?? null
      grid[row][col] = row === 2 && col === 2 ? "FREE" : value
    }
  }

  const isMarked = (num: number | "FREE") => num === "FREE" || (num != null && markedNumbers.includes(num))

  // Compute winning positions dynamically
  const winningPositions = new Set<string>()

  const markRow = (r: number) => grid[r].forEach((_, c) => winningPositions.add(`${r}-${c}`))
  const markCol = (c: number) => grid.forEach((row, r) => winningPositions.add(`${r}-${c}`))
  const markDiagonal = (dir: "tl-br" | "tr-bl") => {
    for (let i = 0; i < size; i++) {
      const r = i
      const c = dir === "tl-br" ? i : size - 1 - i
      winningPositions.add(`${r}-${c}`)
    }
  }

  if (pattern === GamePattern.FULL_HOUSE) {
    grid.forEach((row, r) => row.forEach((_, c) => winningPositions.add(`${r}-${c}`)))
  } else if (pattern === GamePattern.CORNERS) {
    winningPositions.add("0-0")
    winningPositions.add("0-4")
    winningPositions.add("4-0")
    winningPositions.add("4-4")
  } else if (pattern === GamePattern.LINE || pattern === GamePattern.LINE_AND_CORNERS) {
      // Check horizontal lines
      for (let r = 0; r < size; r++) {
        if (grid[r].every(n => isMarked(n))) {
          markRow(r)
          break // stop after first winning row
        }
      }

      // Check vertical lines
      for (let c = 0; c < size; c++) {
        if (grid.every(row => isMarked(row[c]))) {
          markCol(c)
          break // stop after first winning column
        }
      }

      // Check diagonals
      if (grid.every((row, i) => isMarked(row[i]))) markDiagonal("tl-br")
      if (grid.every((row, i) => isMarked(row[size - 1 - i]))) markDiagonal("tr-bl")

      // If pattern includes corners, add only the marked corners
      if (pattern === GamePattern.LINE_AND_CORNERS) {
        const corners: [number, number][] = [
          [0, 0],
          [0, size - 1],
          [size - 1, 0],
          [size - 1, size - 1],
        ]

        // Check if all corners are marked
        const allCornersMarked = corners.every(([r, c]) => isMarked(grid[r][c]))

        if (allCornersMarked) {
          corners.forEach(([r, c]) => {
            winningPositions.add(`${r}-${c}`)
          })
        }
      }

    }



  return (
    <div className="w-full max-w-sm mx-auto mt-4">
      <div className="grid grid-cols-5 gap-1">
        {/* Column headers */}
        {columns.map(col => (
          <div key={col} className="h-6 flex items-center justify-center font-bold text-sm bg-gray-200 dark:bg-gray-700 rounded">
            {col}
          </div>
        ))}

        {/* Grid numbers */}
        {grid.map((row, r) =>
          row.map((num, c) => {
            const key = `${r}-${c}`
            const marked = isMarked(num)
            const isWinning = winningPositions.has(key)

            return (
              <div
                key={key}
                className={`
                  flex items-center justify-center
                  aspect-square w-full
                  rounded text-sm font-semibold
                  ${isWinning ? "bg-green-500 text-white" :
                    marked ? "bg-violet-600 text-white" :
                    "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"}
                `}
              >
                {num ?? ""}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}