"use client"

import { Coins, EarIcon, EarOffIcon, Hash, Trophy, Users } from "lucide-react"
import { useGameStore } from "@/lib/stores/game-store"
import { useRoomStore } from "@/lib/stores/room-store"
import type { Room } from "@/lib/types"
import { currency } from "@/lib/constant"
import { useSystemStore } from "@/lib/stores/system-store"
import { cn } from "@/lib/utils"
import { useAgentStore } from "@/lib/stores/agent-store"

interface GameHeaderProps {
  room: Room | undefined | null
  connected: boolean
}

export function GameHeader({ room, connected }: GameHeaderProps) {
  const game = useGameStore(state => state.game)
  const currentRoom = useRoomStore(state => state.room)
  const { voiceOn, setVoiceOn } = useSystemStore()
  const {agentDetails} = useAgentStore();

  const commisionRate = room?.commissionRate || "0.20"

  const stats = [
    {
      label: "Game Id",
      value: `# ${game.gameId}`,
      bgVar: "--game-stat-1-bg",
      icon: Hash,
    },
    {
      label: "Bet",
      value: `${currentRoom?.entryFee && currentRoom?.entryFee > 0 ? currentRoom?.entryFee : "Free"}`,
      bgVar: "--game-stat-2-bg",
      icon: Coins,
    },
    {
      label: "Prize",
      value: `${currency} ${
        room ? (game.allSelectedCardsIds.length * room.entryFee * (1.0 - Number(commisionRate))).toFixed(2) : 0
      }`,
      bgVar: "--game-stat-3-bg",
      icon: Trophy,
    },
    {
      label: "Players",
      value: game.joinedPlayers.length,
      bgVar: "--game-stat-4-bg",
      icon: Users,
    },
  ]

  return (
    <header
      className={cn(
        "sticky top-0 z-40 bg-card/90 backdrop-blur-md shadow-sm border-b-2 px-3 sm:px-4 py-2",
        connected
          ? "border-[var(--game-header-border-connected)]"
          : "border-[var(--game-header-border-disconnected)]"
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4 mx-auto max-w-screen-xl">
        {/* Stats */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center sm:justify-start flex-grow">
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div
                key={idx}
                style={{ background: `var(${stat.bgVar})` }}
                className="text-[var(--game-stat-fg)] px-2 sm:px-3 py-1 rounded-md flex flex-col items-center min-w-[60px] sm:min-w-[80px]"
              >
                <div className="flex items-center gap-1 text-[10px] sm:text-xs font-medium opacity-90">
                  <Icon className="h-3 w-3" />
                  {stat.label}
                </div>
                <div className="text-[11px] sm:text-sm font-semibold">{stat.value}</div>
              </div>
            )
          })}
        </div>

        {/* Voice Toggle */}
        {/* {agentDetails?.isMaster &&  */}
              <div className="px-2 sm:px-3 py-1 rounded-md flex items-center justify-center bg-[var(--voice-toggle-bg)]">
                <button
                  onClick={() => setVoiceOn(!voiceOn)}
                  className="cursor-pointer flex flex-col items-center"
                >
                  {voiceOn ? (
                    <div className="flex flex-col items-center text-[var(--voice-toggle-muted-fg)]">
                      <EarIcon className="w-4 h-4" />
                      <p className="text-[10px] sm:text-xs">Mute</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-[var(--voice-toggle-unmuted-fg)]">
                      <EarOffIcon className="w-4 h-4" />
                      <p className="text-[10px] sm:text-xs">Unmute</p>
                    </div>
                  )}
                </button>
            </div>
        {/* } */}
      </div>
    </header>
  )
}
