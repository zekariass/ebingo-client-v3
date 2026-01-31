// "use client"

// import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog"
// import { useEffect, useState } from "react"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent } from "@/components/ui/card"
// import { Trophy, DollarSign, X, Info } from "lucide-react"
// import { motion, AnimatePresence } from "framer-motion"
// import { userStore } from "@/lib/stores/user-store"
// import type { GameWinner } from "@/lib/types"
// import { WinnerCardView } from "./winner-card-view"

// interface WinnerDialogProps {
//   showResult: boolean
//   onClose: () => void
//   winner: GameWinner
// }

// export function WinnerDialog({ showResult, onClose, winner }: WinnerDialogProps) {
//   const [open, setOpen] = useState(false)
//   const [isVisible, setIsVisible] = useState(true)
//   const user = userStore(state => state.user)

//   useEffect(() => {
//     if (showResult) {
//       setOpen(true)
//       setIsVisible(true)

//       const timer = setTimeout(() => {
//         setOpen(false)
//         onClose?.()
//       }, 5000)

//       return () => clearTimeout(timer)
//     }
//   }, [showResult, onClose])

//   if (!winner || !isVisible) return null

//   // Determine scenario
//   const isSelfWinner = winner.hasWinner && user?.supabaseId === winner.playerId
//   const isOtherWinner = winner.hasWinner && user?.supabaseId !== winner.playerId
//   const isNoWinner = !winner.hasWinner

//   // Dynamic styling
//   const bgGradient = isSelfWinner
//     ? "bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950"
//     : isOtherWinner
//     ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-950"
//     : "border-2 bg-gradient-to-r from-[#A0522D] to-[#8B4513] dark:from-[#5C3A21] dark:to-[#3E2615]"

//   const iconBg = isSelfWinner
//     ? "bg-yellow-500"
//     : isOtherWinner
//     ? "bg-blue-500"
//     : "bg-gray-400"

//   const titleText = isSelfWinner
//     ? "🎉 BINGO! YOU ARE A WINNER! 🎉"
//     : isOtherWinner
//     ? `WINNER: ${winner.playerName}`
//     : "No winner this round"

//   const titleColor = isSelfWinner
//     ? "text-yellow-800 dark:text-yellow-200"
//     : isOtherWinner
//     ? "text-blue-800 dark:text-blue-200"
//     : "text-gray-800 dark:text-gray-200"

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogContent className="fixed inset-0 z-50 flex items-center justify-center p-4">
//         <AnimatePresence>
//           <motion.div
//             initial={{ opacity: 0, y: 50 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: 50 }}
//             className=
//              {`relative
//               w-full max-w-lg sm:max-w-xl
//               max-h-[90vh] overflow-auto
//               rounded-2xl shadow-lg
//               p-6 sm:p-8
//               ${bgGradient}`}
            
//           >
//             {/* Close button */}
//             <button
//               className="
//                 absolute top-4 right-4
//                 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200
//                 focus:outline-none
//               "
//               onClick={() => setIsVisible(false)}
//             >
//               <X className="h-5 w-5" />
//             </button>

//             {/* Dialog Title */}
//             <DialogTitle className="text-xl sm:text-2xl font-bold mb-4 text-primary dark:text-primary-foreground">
//               Game Result
//             </DialogTitle>

//             {/* Winner Card */}
//             <Card className={`border-2 ${bgGradient}`}>
//               <CardContent className="p-3">
//                 <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
//                   <div className={`flex items-center justify-center w-16 h-16 rounded-full ${iconBg}`}>
//                     {isNoWinner ? <Info className="h-7 w-7 text-white" /> : <Trophy className="h-7 w-7 text-white" />}
//                   </div>

//                   <div className="flex-1">
//                     <h5 className={`text-lg sm:text-xl font-bold ${titleColor}`}>{titleText}</h5>

//                     {winner.hasWinner && (
//                       <div className="flex flex-wrap items-center gap-2 text-sm mt-2">
//                         <div className="flex items-center justify-center">
//                             <WinnerCardView
//                               card={winner?.card?.numbers}
//                               markedNumbers={winner?.markedNumbers}
//                               pattern={winner.pattern}
//                             />
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </motion.div>
//         </AnimatePresence>
//       </DialogContent>
//     </Dialog>
//   )
// }


"use client"

import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog"
import { useEffect, useState } from "react"
import { Trophy, Info, X, DollarSign } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { userStore } from "@/lib/stores/user-store"
import type { GameWinner, GamePattern, BingoColumn } from "@/lib/types"
import { WinnerCardView } from "./winner-card-view"

interface WinnerDialogProps {
  showResult: boolean
  onClose: () => void
  winner: GameWinner
}

export function WinnerDialog({ showResult, onClose, winner }: WinnerDialogProps) {
  const [open, setOpen] = useState(false)
  const user = userStore(state => state.user)

  useEffect(() => {
    if (showResult) {
      setOpen(true)
      const timer = setTimeout(() => {
        setOpen(false)
        onClose?.()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [showResult, onClose, winner])

  const handleWinnerDialogClose = () => {
    setOpen(false)
    onClose?.()
  }

  if (!winner || !open) return null

  const isSelfWinner = winner.hasWinner && user?.telegramId === winner.playerId
  const isOtherWinner = winner.hasWinner && user?.telegramId !== winner.playerId
  const isNoWinner = !winner.hasWinner

  const titleText = isSelfWinner
    ? "🎉 BINGO! YOU ARE A WINNER! 🎉"
    : isOtherWinner
    ? `WINNER: ${winner.playerName}`
    : "No winner this round"

  const iconBg = isSelfWinner
    ? "bg-yellow-500"
    : isOtherWinner
    ? "bg-blue-500"
    : "bg-gray-500"

  const titleColor = isSelfWinner
    ? "text-yellow-700 dark:text-yellow-300"
    : isOtherWinner
    ? "text-blue-700 dark:text-blue-300"
    : "text-gray-700 dark:text-gray-300"

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="relative w-full max-w-md bg-[var(--card)] rounded-2xl shadow-lg p-6 sm:p-8 flex flex-col items-center text-center border-1 border-[var(--border)]"
          >
            {/* Close button */}
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200 focus:outline-none"
              onClick={handleWinnerDialogClose}
            >
              <X className="h-5 w-5" />
            </button>

            <DialogTitle></DialogTitle>

            {/* Icon */}
            <div className={`flex items-center justify-center w-16 h-16 rounded-full mb-4 ${iconBg}`}>
              {isNoWinner ? <Info className="h-8 w-8 text-white" /> : <Trophy className="h-8 w-8 text-white" />}
            </div>

            {/* Title */}
            <h2 className={`text-xl sm:text-2xl font-bold mb-2 ${titleColor}`}>
              {titleText}
            </h2>

            {/* Winner info */}
            {winner.hasWinner && (
              <p className="text-sm sm:text-base mb-4">
                Player: <span className="font-semibold">{winner.playerName}</span> 
                {/* &nbsp;
                | Card #{winner.cardId} &nbsp;
                | Prize: <span className="font-bold text-green-600 dark:text-green-400">{winner.prizeAmount.toFixed(2)} <DollarSign className="inline h-4 w-4" /></span> */}
              </p>
            )}

            {/* Winning Card */}
            {winner.hasWinner && winner.card?.numbers && winner.markedNumbers && (
              <WinnerCardView
                card={winner.card.numbers}
                markedNumbers={winner.markedNumbers}
                pattern={winner.pattern}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}

