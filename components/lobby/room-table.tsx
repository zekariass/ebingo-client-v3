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

import { GameStatus, RoomStatus, type Room } from "@/lib/types"
import { useRouter } from "next/navigation"
import i18n from "@/i18n"
import { currency } from "@/lib/constant"
import { useGameStore } from "@/lib/stores/game-store"
import { ConnectionStatus } from "../room/connection-status"
import { CountdownTimerAllGames } from "../common/countdown-timer-all-games"
import { Badge } from "../ui/badge"
import { useAgentStore } from "@/lib/stores/agent-store"
import { Card } from "../ui/card"

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
      <div className="flex items-center justify-center py-16">
        <div className="text-lg text-muted-foreground animate-pulse">
          Loading rooms...
        </div>
      </div>
    )
  }

  // Empty State
  if (!sortedRooms.length) {
    return (
      <div className="text-center py-16">
        <h3 className="text-lg font-semibold text-muted-foreground">
          No rooms found
        </h3>
        <p className="text-sm text-muted-foreground mt-2">
          Check your connection or filters.
        </p>
      </div>
    )
  }


  const statusColorMap: Record<GameStatus, string> = {
    [GameStatus.READY]: "text-blue-500 font-bold",
    [GameStatus.COUNTDOWN]: "text-yellow-500 font-bold",
    [GameStatus.PLAYING]: "text-red-500 fond-bold",
    [GameStatus.COMPLETED]: "text-green-500",
    [GameStatus.CANCELLED_ADMIN]: "text-red-500",
    [GameStatus.CANCELLED_NO_MIN_PLAYERS]: "text-red-500",
  }


  return (
    <Card>
    <div className="w-full overflow-x-auto shadow-xl rounded-xl p-4">
      <div className="flex items-center justify-center">
        <Badge variant="outline">
          <ConnectionStatus roomId={rooms[0].id} />
        </Badge>
      </div>
      <table className="w-full text-left border-separate border-spacing-y-3 text-sm sm:text-base">
        <thead>
          <tr className="text-[var(--foreground)] uppercase tracking-wider text-xs sm:text-sm text-center">
            <th className="px-3 py-2">Bet</th>
            {/* <th className="px-3 py-2">Players</th> */}
            <th className="px-3 py-2">Prize</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2 text-center">Action</th>
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
                className="[&>td]:bg-[var(--card-table-row)] [&>td:hover]:bg-[var(--card-table-row-hover)] rounded-xl shadow-md hover:shadow-lg text-white text-center text-xs md:text-lg"
              >

                {/* Bet */}
                <td className="px-1 py-3 font-semibold rounded-l-xl">
                  {room.entryFee === 0 ? "Free" : `${room.entryFee} Br`}
                </td>

                {/* Active Players */}
                {/* <td className="px-1 py-3 font-semibold text-green-400">
                  {activePlayers}
                </td> */}

                {/* Prize */}
                <td className="px-1 py-3 font-semibold text-yellow-400">
                  {prize.toFixed(2)} Br
                </td>

                {/* Status */}
                <td className={`px-1 py-3 font-medium ${statusColorMap[status]}`}>
                  {status === GameStatus.COUNTDOWN ? <CountdownTimerAllGames activeGame={activeGame} /> : `${status === GameStatus.PLAYING ? "PLAYING..." : status}`}
                </td>

                {/* Action */}
                <td className="px-1 py-3 rounded-r-xl text-center">
                  <button
                    onClick={() => handleJoinClick(room.id.toString())}
                    disabled={room.status !== RoomStatus.OPEN}
                    className={`px-3 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-colors duration-200 ${
                      room.status === RoomStatus.OPEN
                        ? "cursor-pointer bg-[var(--btn-game-join-bg)] hover:bg-[var(--btn-game-join-bg-hover)] text-white shadow-sm"
                        : "bg-gray-700 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {room.status === RoomStatus.OPEN ? "Join" : "___"}
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
