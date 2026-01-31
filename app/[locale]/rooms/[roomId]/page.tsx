import { RoomView } from "@/components/room/room-view"
import { WinnerOverlay } from "@/components/room/winner/winner-overlay";

interface RoomPageProps {
  params: { roomId: string; locale: string },
  searchParams: Promise<{ agentId?: number }>
}

export default async function RoomPage({ params, searchParams }: RoomPageProps) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const roomId = Number(resolvedParams.roomId)
  const agentId = resolvedSearchParams.agentId
  return <>
      <RoomView roomId={roomId} agentId={agentId} />
      <WinnerOverlay />
  </>
}
