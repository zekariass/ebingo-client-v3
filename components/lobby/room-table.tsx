// "use client"

// import { RoomStatus, type Room } from "@/lib/types"
// import { useRouter } from "next/navigation"
// import i18n from "@/i18n"
// import { currency } from "@/lib/constant"
// import { useGameStore } from "@/lib/stores/game-store"

// interface RoomTableProps {
//   rooms: Room[]
//   loading: boolean
// }

// export function RoomTable({ rooms, loading }: RoomTableProps) {
//   const router = useRouter()
//   const {activeGames} = useGameStore()

//   const handleJoinClick = (room: Room) => {
//     router.push(`/${i18n.language}/rooms/${room.id}`)
//   }

//   const sortedRooms = rooms.sort((r1, r2) => r1.entryFee - r2.entryFee)

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center py-16">
//         <div className="text-lg text-muted-foreground animate-pulse">
//           Loading rooms...
//         </div>
//       </div>
//     )
//   }

//   if (!sortedRooms || sortedRooms.length === 0) {
//     return (
//       <div className="text-center py-16">
//         <h3 className="text-lg font-semibold text-muted-foreground">
//           No rooms found
//         </h3>
//         <p className="text-sm text-muted-foreground mt-2">
//           Check your connection or filters.
//         </p>
//       </div>
//     )
//   }

//   return (
//     <div className="w-full overflow-x-auto">
//       <table className="w-full text-left border-separate border-spacing-y-3 text-sm sm:text-base">
//         <thead>
//           <tr className="text-gray-400 uppercase tracking-wider text-xs sm:text-sm">
//             <th className="px-3 py-2">Room Name</th>
//             <th className="px-3 py-2">Bet</th>
//             {/* <th className="px-3 py-2">Status</th> */}
//             <th className="px-3 py-2">Capacity</th>
//             <th className="px-3 py-2 text-center">Action</th>
//           </tr>
//         </thead>

//         <tbody>
//           {(Array.isArray(sortedRooms) ? sortedRooms : []).map((room) => (
//             <tr
//               key={room.id}
//               className="bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 transition-all duration-200 rounded-xl shadow-md hover:shadow-lg cursor-pointer text-white"
//             >
//               {/* Room Name */}
//               <td className="px-3 py-3 font-semibold rounded-l-xl">
//                 {room.name}
//               </td>

//               {/* Entry Fee */}
//               <td className="px-3 py-3 font-semibold text-yellow-400">
//                 {room.entryFee} {currency}
//               </td>

//               {/* Status */}
//               {/* <td className="px-3 py-3">
//                 <Badge
//                   className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
//                     room.status === RoomStatus.OPEN
//                       ? "bg-green-600 text-white"
//                       : room.status === RoomStatus.CLOSED
//                       ? "bg-red-600 text-white"
//                       : "bg-yellow-600 text-white"
//                   }`}
//                 >
//                   {room.status}
//                 </Badge>
//               </td> */}

//               {/* Capacity */}
//               <td className="px-3 py-3 text-gray-200 font-medium">
//                 {room.capacity} Players
//               </td>

//               {/* Action */}
//               <td className="px-3 py-3 rounded-r-xl text-center">
//                 <button
//                   onClick={() => handleJoinClick(room)}
//                   disabled={room.status !== RoomStatus.OPEN}
//                   className={`px-3 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-colors duration-200 ${
//                     room.status === RoomStatus.OPEN
//                       ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm cursor-pointer"
//                       : "bg-gray-700 text-gray-400 cursor-not-allowed"
//                   }`}
//                 >
//                   {room.status === RoomStatus.OPEN ? "Enter" : "___"}
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   )
// }




"use client"

import { GameState, GameStatus, RoomStatus, type Room } from "@/lib/types"
import { useRouter } from "next/navigation"
import i18n from "@/i18n"
import { currency } from "@/lib/constant"
import { useGameStore } from "@/lib/stores/game-store"
import { ConnectionStatus } from "../room/connection-status"
import { CountdownTimerAllGames } from "../common/countdown-timer-all-games"
import { Badge } from "../ui/badge"
import { useAgentStore } from "@/lib/stores/agent-store"
import { Card } from "../ui/card"
import { Coins, Gamepad2, Trophy, Users } from "lucide-react"

interface RoomTableProps {
  rooms: Room[]
  loading: boolean
}

export function RoomTable({ rooms, loading }: RoomTableProps) {
  const {activeAgentId} = useAgentStore();
  const router = useRouter()
  const { activeGames } = useGameStore()

  const handleJoinClick = (roomId: string) => {
    router.push(`/${i18n.language}/rooms/${roomId}?agentId=${activeAgentId}`)
  }

  // Clone before sorting to avoid mutating props
  const sortedRooms = [...rooms].sort((a, b) => a.entryFee - b.entryFee)


  // Loading State
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
        <div className="text-sm text-muted-foreground">Loading rooms...</div>
      </div>
    )
  }

  // Empty State
  if (!sortedRooms.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 border-2 border-dashed border-muted rounded-xl">
        <Gamepad2 className="h-10 w-10 text-muted-foreground/50" />
        <h3 className="text-lg font-semibold text-muted-foreground">
          No rooms found
        </h3>
        <p className="text-sm text-muted-foreground">
          Check your connection or filters.
        </p>
      </div>
    )
  }


  const renderStatus = (status: GameStatus, activeGame?: GameState) => {
    switch (status) {
      case GameStatus.COUNTDOWN:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 px-2 py-0.5 text-[11px] sm:text-xs font-semibold text-yellow-600 dark:text-yellow-400">
            <CountdownTimerAllGames activeGame={activeGame} />
          </span>
        )
      case GameStatus.PLAYING:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-[11px] sm:text-xs font-semibold text-red-500">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            LIVE
          </span>
        )
      case GameStatus.COMPLETED:
        return (
          <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-[11px] sm:text-xs font-semibold text-muted-foreground">
            Ended
          </span>
        )
      case GameStatus.CANCELLED_ADMIN:
      case GameStatus.CANCELLED_NO_MIN_PLAYERS:
        return (
          <span className="inline-flex items-center rounded-full bg-destructive/10 px-2.5 py-1 text-[11px] sm:text-xs font-semibold text-destructive">
            Cancelled
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-1 text-[11px] sm:text-xs font-semibold text-green-600 dark:text-green-400">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Open
          </span>
        )
    }
  }


  return (
    <Card className="p-0 overflow-hidden">
      {/* Table header */}
      <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2.5 border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          <Gamepad2 className="h-4 w-4 text-muted-foreground shrink-0" />
          <h2 className="text-sm sm:text-base font-semibold truncate">Bingo Rooms</h2>
          <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5">
            {sortedRooms.length}
          </Badge>
        </div>
        <ConnectionStatus roomId={rooms[0].id} />
      </div>

      <div className="w-full overflow-x-auto p-2 sm:p-4">
      <table className="w-full text-left border-separate border-spacing-y-3 text-sm sm:text-base">
        <thead>
          <tr className="text-muted-foreground uppercase tracking-wider text-[10px] sm:text-xs text-center">
            <th className="px-2 py-2">
              <span className="inline-flex items-center gap-1"><Coins className="h-3 w-3" />Bet</span>
            </th>
            <th className="px-2 py-2">
              <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" />Players</span>
            </th>
            <th className="px-2 py-2">
              <span className="inline-flex items-center gap-1"><Trophy className="h-3 w-3" />Prize</span>
            </th>
            <th className="px-2 py-2">Status</th>
            <th className="px-2 py-2 text-center">Action</th>
          </tr>
        </thead>

        <tbody>
          {sortedRooms.map((room) => {
            const activeGame = activeGames[room.id]
            const activePlayers = activeGame?.joinedPlayers?.length ?? 0
            const selectedCardsIds = activeGame?.allSelectedCardsIds ?? []

            const prize = selectedCardsIds.length * room.entryFee * (1.0 - (room.commissionRate ?? 0.20))
            const status = activeGame?.status ?? GameStatus.READY

            return (
              <tr
                key={room.id}
                className="[&>td]:bg-[var(--card-table-row)] [&>td:hover]:bg-[var(--card-table-row-hover)] [&>td]:border-y [&>td]:border-[var(--line)] [&>td:first-child]:border-l [&>td:first-child]:rounded-l-xl [&>td:last-child]:border-r [&>td:last-child]:rounded-r-xl shadow-sm hover:shadow-md text-[var(--ink)] text-center text-xs md:text-base transition-colors"
              >

                {/* Bet */}
                <td className="px-2 py-3 font-semibold">
                  {room.entryFee === 0 ? "Free" : `${room.entryFee} ${currency}`}
                </td>

                {/* Active Players */}
                <td className="px-2 py-3 font-medium">
                  {activePlayers}
                </td>

                {/* Prize */}
                <td className="px-2 py-3 font-semibold text-[var(--voice)]">
                  {prize.toFixed(2)} {currency}
                </td>

                {/* Status */}
                <td className="px-2 py-3">
                  {renderStatus(status, activeGame)}
                </td>

                {/* Action */}
                <td className="px-2 py-3 text-center">
                  <button
                    onClick={() => handleJoinClick(room.id.toString())}
                    disabled={room.status !== RoomStatus.OPEN}
                    className={`px-3 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-colors duration-200 ${
                      room.status === RoomStatus.OPEN
                        ? "cursor-pointer bg-[var(--btn-game-join-bg)] hover:bg-[var(--btn-game-join-bg-hover)] text-[var(--on-signal)] shadow-sm"
                        : "bg-[var(--soft)] text-[var(--soft-ink)] cursor-not-allowed"
                    }`}
                  >
                    {room.status === RoomStatus.OPEN ? "Join" : "Closed"}
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      </div>
    </Card>
  )
}
