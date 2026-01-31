"use client"

import { RoomStatus, type Room } from "@/lib/types"
import { Button } from "@/components/ui/button"
import i18n from "@/i18n"
import { useRouter } from "next/navigation"

interface RoomCardProps {
  room: Room
}

export function RoomCard({ room }: RoomCardProps) {

  // const occupancyPercentage = 0;//(room.players / room.capacity) * 100
  // const isNearlyFull = occupancyPercentage >= 80
  // const isFull = false;//room.players >= room.capacity


  const router =  useRouter();
  // const {enterRoom} =  useWebSocketEvents({roomId: room.id, enabled: true});

  const getStatusColor = (status: Room["status"]) => {
    switch (status) {
      case RoomStatus.OPEN:
        return "bg-green-500"
      case RoomStatus.CLOSED:
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: RoomStatus) => {
    switch (status) {
      case RoomStatus.OPEN:
        return "Open"
      case RoomStatus.CLOSED:
        return "Closed"
      default:
        return "Unknown"
    }
  }

  const handleCardButtonClick = (room: Room) => {
    if (room.status === RoomStatus.OPEN) {
      // Navigate to room

      // enterRoom(room.id);
      router.push(`/${i18n.language}/rooms/${room.id}`);
    } else {
      // View game
      router.push(`/${i18n.language}/rooms/${room.id}`);
    }
  }

  return (
    <Button
      className="w-36 h-36 flex flex-col items-center justify-center text-xl dark:text-white font-bold bg-green-900 hover:bg-green-800 rounded-2xl shadow-lg cursor-pointer"
      onClick={() => handleCardButtonClick(room)}
    >
      {/* <span className="text-sm">Room {room?.id}</span> */}
      <span className="text-sm">Capacity: {room?.capacity}</span>
      <span>Price: ${room.entryFee}</span>
    </Button>
)

}
