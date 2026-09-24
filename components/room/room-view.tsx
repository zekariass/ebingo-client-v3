"use client"

import { useEffect } from "react"
import { useRoomStore } from "@/lib/stores/room-store"
import { useGameStore } from "@/lib/stores/game-store"
import { usePaymentStore } from "@/lib/stores/payment-store"
import { useSystemStore } from "@/lib/stores/system-store"
import { GameStatus } from "@/lib/types"
import { AlertCircle } from "lucide-react"
import { RoomHeader } from "./room-header"
import { CardSelectionGrid } from "./card-selection-grid"
import { SelectedCardsPanel } from "./selected-cards-panel"
import { useTelegramInit } from "@/lib/hooks/use-telegram-init"
import { useRoomSocket } from "@/lib/hooks/websockets/use-room-socket"
import { useAgentStore } from "@/lib/stores/agent-store"

interface RoomViewProps {
  roomId: number,
  agentId?: number
}

export function RoomView({ roomId, agentId }: RoomViewProps) {
  useTelegramInit()

  const { setActiveAgentId, fetchAgentDetails } = useAgentStore();
  useEffect(() => {
    if (agentId !== undefined) {
      fetchAgentDetails(agentId)
      setActiveAgentId(agentId);
    } else {
      setActiveAgentId(null);
    }
  }, [agentId]);

  const { room, loading, fetchRoom, resetRoom } = useRoomStore()
  const {
    game: { userSelectedCardsIds, countdownDurationSeconds, status },
    isJoining,
    setJoining,
    joinError,
    setJoinError,
  } = useGameStore()
  const { fetchWallet } = usePaymentStore()
  const fetchSystemConfigs = useSystemStore(state => state.fetchSystemConfigs)

  // const { connected, enterRoom } = useWebSocketEvents({ roomId, enabled: true })
  const { connected, enterRoom } = useRoomSocket({ roomId, enabled: true })

  const disableCardSelection = (countdownDurationSeconds < 10 && countdownDurationSeconds > 0) || status === GameStatus.PLAYING

  // -------------------- Fetch room data once --------------------
  useEffect(() => {
    resetRoom()
    fetchRoom(roomId)
  }, [roomId, fetchRoom, resetRoom])

  // -------------------- Init system configs --------------------
  useEffect(() => {
    setJoining(false)
    setJoinError(null)
    fetchSystemConfigs(agentId!)
  }, [fetchSystemConfigs, setJoining, setJoinError])

  // -------------------- Clear join errors --------------------
  useEffect(() => {
    if (!joinError) return
    const timeoutId = setTimeout(() => {
      setJoinError(null)
      setJoining(false)
    }, 5000)
    return () => clearTimeout(timeoutId)
  }, [joinError, setJoinError, setJoining])

  // Turn off isJoining automatically after 5 minutes
  useEffect(() => {
    if (!isJoining) return;

    const timeoutId = setTimeout(() => {
      setJoining(false);
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearTimeout(timeoutId);
  }, [isJoining, setJoining]);


  // -------------------- Enter room + fetch wallet after connected --------------------
  useEffect(() => {
    if (!connected) return

    const init = async () => {
      try {
        await enterRoom()
        await fetchWallet(true, agentId!)
      } catch (err) {
        console.error("Failed to initialize room/payment data:", err)
      }
    }

    init()
  }, [connected, fetchWallet])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
        <div className="text-sm text-muted-foreground">Loading room...</div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-background">
      {isJoining && !joinError && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-4 bg-black/60 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white"></div>
          <span className="text-white text-lg font-semibold">Joining room...</span>
        </div>
      )}

      <RoomHeader room={room} />

      <main className="container mx-auto px-2 sm:px-4 py-3 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6 items-start">
          {/* Left Column - Card Selection */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            <CardSelectionGrid
              roomId={roomId}
              capacity={room?.capacity ?? 0}
              disabled={disableCardSelection}
            />

            {joinError && (
              <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{joinError}</span>
              </div>
            )}
          </div>

          {/* Right Column - Selected Cards */}
          {userSelectedCardsIds.length > 0 && (
            <div className="lg:sticky lg:top-20">
              <SelectedCardsPanel />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
