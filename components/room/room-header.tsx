// "use client"

// import type { GameState, Room } from "@/lib/types"
// import { Button } from "@/components/ui/button"
// import { ArrowLeft, RefreshCcw } from "lucide-react"
// import Link from "next/link"
// import { ConnectionStatus } from "./connection-status"
// import { useGameStore } from "@/lib/stores/game-store"
// import { useWebSocketEvents } from "@/lib/hooks/websockets/use-websocket-events"
// import { useRouter } from "next/navigation"
// import { currency } from "@/lib/constant"
// import { usePaymentStore } from "@/lib/stores/payment-store"

// interface RoomHeaderProps {
//   room?: Room | null 
// }

// export function RoomHeader({ room }: RoomHeaderProps) {
//   // useTelegramInit();

//   // const { connected, latencyMs } = useRoomStore()
//   // const {game: {gameId, status, joinedPlayers, playersCount}} = useGameStore()

//   // const {resetPlayerStateInBackend} = useWebSocketEvents({roomId: room?.id, enabled: true});
//   const { resetGameState } = useGameStore();
//   const {balance: {totalAvailableBalance}} = usePaymentStore()

//   const router = useRouter()

//   const getStatusColor = (status: GameState["status"]) => {
//     switch (status) {
//       case "READY":
//         return "bg-green-500"
//       case "COUNTDOWN":
//         return "bg-yellow-500"
//       case "PLAYING":
//         return "bg-blue-500"
//       case "COMPLETED":
//         return "bg-red-500"
//       default:
//         return "bg-gray-500"
//     }
//   }

//   const getStatusText = (status: GameState["status"]) => {
//     switch (status) {
//       case "READY":
//         return "Open for Players"
//       case "COUNTDOWN":
//         return "Starting Soon"
//       case "PLAYING":
//         return "Game in Progress"
//       case "COMPLETED":
//         return "Game Ended"
//       default:
//         return "Unknown"
//     }
//   }

//   const handleBackArrowClick = () => {
//     // resetPlayerStateInBackend(gameId);
//     resetGameState();
//   }

//   return (
//     <header className="border-b bg-card">
//       <div className="container mx-auto px-4 py-4">
//         <div className="flex items-center justify-between gap-4">
//           <div className="flex items-center gap-4 min-w-0 flex-1">
//             <Button variant="ghost" size="sm" asChild>
//               <Link href="/" onClick={()=> handleBackArrowClick()}>
//                 <ArrowLeft className="h-4 w-4 mr-2" />
//                 <span className="hidden sm:inline">Home</span>
//                 <span className="sm:hidden">Home</span>
//               </Link>
//             </Button>

//             <div className="space-y-1 min-w-0">
//               {/* <h1 className="text-sm sm:text-lg lg:text-xl font-bold truncate">{room?.name}</h1> */}
//               <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-muted-foreground">
//                 <span className="truncate">Room Id: {room?.id}</span>
//                 <span>Bet: {room?.entryFee} {currency}</span>
//               </div>
//             </div>
//           </div>

//           <div className="space-y-1 min-w-0">
//               {/* <h1 className="text-sm sm:text-lg lg:text-xl font-bold truncate">{room?.name}</h1> */}
//               <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-muted-foreground">
//                 <span className="truncate">Balance: {totalAvailableBalance}</span>
//                 <ConnectionStatus roomId={room?.id} />
//               </div>
//             </div>

//           <div className="flex flex-col items-end gap-2 text-right shrink-0">
//             <div className="flex items-center gap-2">
//             </div>
//             <span className="flex flex-row">
              
//               <RefreshCcw onClick={()=>window.location.reload()} className="ms-3 cursor-pointer pt-1 text-white" size="20"></RefreshCcw>
//             </span>
//           </div>
//         </div>
//       </div>
//     </header>
//   )
// }


"use client"

import type { Room } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RefreshCcw } from "lucide-react"
import Link from "next/link"
import { ConnectionStatus } from "./connection-status"
import { useGameStore } from "@/lib/stores/game-store"
import { useRouter } from "next/navigation"
import { currency } from "@/lib/constant"
import { usePaymentStore } from "@/lib/stores/payment-store"
import { motion } from "framer-motion"
import { useRoomStore } from "@/lib/stores/room-store"
import { useAgentStore } from "@/lib/stores/agent-store"

interface RoomHeaderProps {
  room?: Room | null
}

export function RoomHeader({ room }: RoomHeaderProps) {
  const {activeAgentId} = useAgentStore();
  const { resetGameState } = useGameStore()
  const {resetRoom} = useRoomStore();
  const {
    balance: { totalAvailableBalance },
  } = usePaymentStore()
  const router = useRouter()

  const handleBackArrowClick = () => {
    resetGameState()
    resetRoom();
  }

  return (
    <header className="border-b bg-card/90 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Left Section: Back & Room Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/?agentId=${activeAgentId}`} onClick={() => handleBackArrowClick()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline font-medium">Back</span>
              </Link>
            </Button>

            <motion.div
              className="min-w-0 space-y-0.5"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* <h1 className="text-sm sm:text-base font-semibold truncate text-foreground/90">
                {room?.name ?? "Game Room"}
              </h1> */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-[var(--foreground)]">
                <span className="truncate">Room ID: {room?.id}</span>
                <span>
                  Bet: {room?.entryFee && room.entryFee > 0 ? `${room.entryFee} ${currency}` : "Free"}
                </span>
              </div>
            </motion.div>
          </div>

          {/* Center Section: Connection + Balance */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-[var(--foreground)] font-bold">Balance:</span>
              <span className="text-[var(--foreground)] font-bold">{totalAvailableBalance} {currency}</span>
            </div>
            <div className="font-bold"><ConnectionStatus roomId={room?.id} /></div>
          </div>

          {/* Right Section: Refresh */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground/70 hover:text-foreground transition-colors"
              onClick={() => window.location.reload()}
              title="Refresh"
            >
              <RefreshCcw className="h-4 w-4 text-white"/>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
