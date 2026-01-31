
// "use client"

// import { useRoomStore } from "@/lib/stores/room-store"
// import { useSoundEffects } from "@/lib/hooks/use-sound-effects"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
// import { PatternDisplay } from "./pattern-display"
// import { GameTimerDisplay } from "./game-timer-display"
// // import { PatternProgress } from "./pattern-progress"
// import { formatBingoNumber } from "@/lib/utils/bingo"
// import { History, Volume2, VolumeX, Target } from "lucide-react"
// import { useState, useEffect } from "react"
// import { motion, AnimatePresence } from "framer-motion"
// import { GameSettings } from "./game-settings"
// import { useGameStore } from "@/lib/stores/game-store"

// export function NumberCallingArea() {
//   const room = useRoomStore(state => state.room)
//   const {game: {currentDrawnNumber, drawnNumbers} } = useGameStore()
//   const { numberCalled, enabled: soundEnabled } = useSoundEffects()
//   const [previousNumber, setPreviousNumber] = useState<number | null>(null)

//   const currentNumber = currentDrawnNumber
//   const calledNumbers = drawnNumbers

//   useEffect(() => {
//     if (currentNumber && currentNumber !== previousNumber) {
//       numberCalled()
//       setPreviousNumber(currentNumber)

//       const letter =
//         currentNumber <= 15
//           ? "B"
//           : currentNumber <= 30
//             ? "I"
//             : currentNumber <= 45
//               ? "N"
//               : currentNumber <= 60
//                 ? "G"
//                 : "O"
//       console.log("Number Called:", `${letter} ${currentNumber}`)
//     }
//   }, [currentNumber, previousNumber, numberCalled])

//   // useEffect(() => {
//   //   const mockCalledNumbers = [7, 23, 42, 56, 71, 15, 38, 49, 63]
//   //   const { setCalledNumbers, setCurrentNumber, setPattern } = useRoomStore.getState()

//   //   if (calledNumbers.length === 0) {
//   //     setCalledNumbers(mockCalledNumbers)
//   //     setCurrentNumber(mockCalledNumbers[mockCalledNumbers.length - 1])
//   //     setPattern("line")
//   //   }
//   // }, [calledNumbers.length])

//   const lastFiveCalls = calledNumbers.slice(-5).reverse()

//   return (
//     <div className="space-y-4">
//       {/* Game Timer */}
//       {/* <GameTimerDisplay /> */}

//       {/* Current Pattern */}
//       <PatternDisplay pattern={room?.pattern} />

//       {/* Number Calling */}
      

//       {/* Pattern Progress */}
//       {/* <PatternProgress /> */}

//       {/* <Dialog>
//         <DialogTrigger asChild>
//           <Button variant="outline" className="w-full bg-transparent">
//             <Target className="h-4 w-4 mr-2" />
//             Game Settings
//           </Button>
//         </DialogTrigger>
//         <DialogContent className="max-w-md">
//           <DialogHeader>
//             <DialogTitle>Game Settings</DialogTitle>
//           </DialogHeader>
//           <GameSettings />
//         </DialogContent>
//       </Dialog> */}
//     </div>
//   )
// }
