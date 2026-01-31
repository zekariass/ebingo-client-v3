// "use client"

// import { useRoomStore } from "@/lib/stores/room-store"
// import { useGameStore } from "@/lib/stores/game-store"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
// import { cn } from "@/lib/utils"
// import { useEffect, useState } from "react"
// import { CardInfo, BingoColumn } from "@/lib/types"

// function transformCardData(card?: Partial<Record<BingoColumn, number[]>>) {
//   if (!card) return Array(5).fill(null).map(() => Array(5).fill(0))

//   const columns = [BingoColumn.B, BingoColumn.I, BingoColumn.N, BingoColumn.G, BingoColumn.O]

//   const grid = Array.from({ length: 5 }, (_, rowIndex) =>
//     columns.map((col) => card[col]?.[rowIndex] ?? 0)
//   )

//   // Free space in the middle
//   grid[2][2] = 0
//   return grid
// }

// interface InteractiveBingoCardProps {
//   cardInfoId: string
//   index: number
// }

// export function InteractiveBingoCard({ cardInfoId, index }: InteractiveBingoCardProps) {
//   const { room, connected } = useRoomStore()
//   const {
//     game: { drawnNumbers },
//     getCurrentCardById,
//     addMarkedNumberToCard,
//     removeMarkedNumberFromCard,
//   } = useGameStore()


//   const [currentCard, setCurrentCard] = useState<CardInfo | null>(null)

//   useEffect(() => {
//     setCurrentCard(getCurrentCardById(cardInfoId))
//   }, [cardInfoId, getCurrentCardById])

//   if (!currentCard) return null

//   const cardNumbers = transformCardData(currentCard.numbers)
//   const COLUMN_HEADERS = ["B", "I", "N", "G", "O"]

//   const isNumberDrawn = (num: number) => drawnNumbers.includes(num)
//   const isMarked = (num: number) => currentCard?.markedNumbers?.includes(num)

//   const handleCellClick = (number: number, row: number, col: number) => {
//     const isFree = row === 2 && col === 2
//     if (isFree || number === 0) return
//     if (!isNumberDrawn(number)) return

//     if (isMarked(number)) {
//       removeMarkedNumberFromCard(currentCard.cardId, number)
//     } else {
//       addMarkedNumberToCard(currentCard.cardId, number)
//     }
//   }


//   const handleBingoClaim = () => {
//     if (!connected) return
//     // ✅ Send claim to backend (validation happens server-side)
//     console.log(`Claiming Bingo for card ${currentCard.cardId}`)
//     // TODO: integrate with WebSocket or API
//   }

//   return (
//     <div className="border rounded-lg p-3 w-full max-w-xs mx-auto">
//       {/* Card Header */}
//       <div className="flex items-center justify-center mb-2">
//         <Badge variant="outline" className="font-mono text-xs">
//           Card #{index + 1}
//         </Badge>
//         {!connected && (
//           <Badge variant="destructive" className="text-xs">
//             Offline
//           </Badge>
//         )}
//       </div>

//       {/* Column Headers */}
//       <div className="grid grid-cols-5 gap-1 mb-2">
//         {COLUMN_HEADERS.map((letter) => (
//           <div
//             key={letter}
//             className="h-8 flex items-center justify-center font-bold bg-primary text-primary-foreground rounded"
//           >
//             {letter}
//           </div>
//         ))}
//       </div>

//       {/* Numbers Grid */}
//       <div className="grid grid-cols-5 gap-1">
//         {cardNumbers.map((row, rowIndex) =>
//           row.map((number, colIndex) => {
//             const free = rowIndex === 2 && colIndex === 2
//             const marked = isMarked(number) || free
//             const clickable = connected && !free && isNumberDrawn(number)

//             return (
//               <TooltipProvider key={`${rowIndex}-${colIndex}`}>
//                 <Tooltip>
//                   <TooltipTrigger asChild>
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       className={cn(
//                         "h-10 w-full text-sm font-semibold relative",
//                         free && "bg-yellow-200 dark:bg-yellow-800 border-yellow-400 cursor-default",
//                         marked && !free && "bg-blue-500 text-white border-blue-600",
//                         !marked && clickable && "hover:bg-green-100 dark:hover:bg-green-900 border-green-300",
//                         !marked && !clickable && "opacity-50 cursor-not-allowed"
//                       )}
//                       onClick={() => clickable && handleCellClick(number, rowIndex, colIndex)}
//                       disabled={free || !clickable}
//                     >
//                       {free ? "⭐" : number}
//                       {marked && !free && (
//                         <span className="absolute inset-0 flex items-center justify-center text-white">
//                           ✓
//                         </span>
//                       )}
//                     </Button>
//                   </TooltipTrigger>
//                   <TooltipContent>
//                     {free
//                       ? "Free space"
//                       : marked
//                       ? "Marked"
//                       : !connected
//                       ? "Not connected"
//                       : isNumberDrawn(number)
//                       ? "Click to mark"
//                       : "Not called yet"}
//                   </TooltipContent>
//                 </Tooltip>
//               </TooltipProvider>
//             )
//           })
//         )}
//       </div>

//       {/* Claim Bingo Button */}
//       <div className="mt-3">
//         <Button
//           onClick={handleBingoClaim}
//           disabled={!connected}
//           className="w-full font-bold text-sm bg-green-500 hover:bg-green-600 text-white"
//         >
//           CLAIM BINGO
//         </Button>
//       </div>
//     </div>
//   )
// }

