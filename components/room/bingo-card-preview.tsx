// import type { BingoCard } from "@/lib/types"
// import { cn } from "@/lib/utils"

// interface BingoCardPreviewProps {
//   card: BingoCard
//   size?: "xs" | "sm" | "md"
// }

// export function BingoCardPreview({ card, size = "sm" }: BingoCardPreviewProps) {
//   const sizeClasses = {
//     xs: "text-[6px] gap-[1px]",
//     sm: "text-[8px] gap-[2px]",
//     md: "text-xs gap-1",
//   }

//   const cellSizeClasses = {
//     xs: "w-2 h-2",
//     sm: "w-3 h-3",
//     md: "w-6 h-6",
//   }

//   return (
//     <div className={cn("grid grid-cols-5", sizeClasses[size])}>
//       {card.numbers.map((row, rowIndex) =>
//         row.map((number, colIndex) => (
//           <div
//             key={`${rowIndex}-${colIndex}`}
//             className={cn(
//               "flex items-center justify-center border border-gray-300 dark:border-gray-600",
//               cellSizeClasses[size],
//               rowIndex === 2 && colIndex === 2 ? "bg-yellow-200 dark:bg-yellow-800" : "bg-white dark:bg-gray-700",
//             )}
//           >
//             {rowIndex === 2 && colIndex === 2 ? (size === "xs" ? "★" : "*") : number}
//           </div>
//         )),
//       )}
//     </div>
//   )
// }


// import type { BingoCard } from "@/lib/types"
// import { cn } from "@/lib/utils"

// interface BingoCardPreviewProps {
//   card: BingoCard
//   size?: "xs" | "sm" | "md"
// }

// export function BingoCardPreview({ card, size = "sm" }: BingoCardPreviewProps) {
//   const sizeClasses = {
//     xs: "text-[6px] gap-[1px]",
//     sm: "text-[8px] gap-[2px]",
//     md: "text-xs gap-1",
//   }

//   const cellSizeClasses = {
//     xs: "w-2 h-2",
//     sm: "w-3 h-3",
//     md: "w-6 h-6",
//   }

//   return (
//     <div className={cn("grid grid-cols-5", sizeClasses[size])}>
//       {card.numbers.map((row, rowIndex) =>
//         row.map((number, colIndex) => (
//           <div
//             key={`${rowIndex}-${colIndex}`}
//             className={cn(
//               "flex items-center justify-center border border-gray-300 dark:border-gray-600",
//               cellSizeClasses[size],
//               rowIndex === 2 && colIndex === 2 ? "bg-yellow-200 dark:bg-yellow-800" : "bg-white dark:bg-gray-700",
//             )}
//           >
//             {rowIndex === 2 && colIndex === 2 ? (size === "xs" ? "★" : "*") : number}
//           </div>
//         )),
//       )}
//     </div>
//   )
// }
