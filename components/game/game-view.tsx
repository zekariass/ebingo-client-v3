"use client"

import { useEffect, useRef, useState } from "react"
import { useRoomStore } from "@/lib/stores/room-store"
// import { useWebSocketEvents } from "@/lib/hooks/websockets/use-websocket-events"
import { GameHeader } from "./game-header"
import { NumberGrid } from "./number-grid"
import { GameCards } from "./game-cards"
import { transformCardData } from "./game-bingo-card"
import { useGameStore } from "@/lib/stores/game-store"
import { Button } from "../ui/button"
import { userStore } from "@/lib/stores/user-store"
import { CountdownTimer } from "../common/countdown-timer"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import i18n from "@/i18n"
// import { useSystemStore } from "@/lib/stores/system-store"
// import { motion } from "framer-motion";
import { useRoomSocket } from "@/lib/hooks/websockets/use-room-socket"
import { useAgentStore } from "@/lib/stores/agent-store"
import { GamePattern } from "@/lib/types"
import { checkCardPatternWin } from "@/lib/utils/bingo"

interface GameViewProps {
  roomId: number
}

export function GameView({ roomId }: GameViewProps) {
  const {activeAgentId} = useAgentStore();
  const gameId = useGameStore(state => state.game.gameId)
  const drawnNumbers = useGameStore(state => state.game.drawnNumbers)
  const userSelectedCards = useGameStore(state => state.game.userSelectedCards)
  const started = useGameStore(state => state.game.started)
  // const [currentLetter, setCurrentLetter] = useState<string>("")
  const selectedCardIds = useGameStore(state => state.game.userSelectedCardsIds)
  // const countdownEndTime = useGameStore(state => state.game.countdownEndTime)
  // const status = useGameStore(state => state.game.status)
  // const currentDrawnNumber = useGameStore(state => state.game.currentDrawnNumber)
  // const voiceOn = useSystemStore(state => state.voiceOn)
  // const setLocaleChanged = useSystemStore(state => state.setLocaleChanged)
  // const localeChanged = useSystemStore(state => state.localeChanged)

  const telegramId = userStore(state => state.user?.telegramId)
  const userDbId = userStore(state => state.user?.id)
  const userName = userStore(state => `${state.user?.nickname ?? state.user?.firstName}`.trim())
  const roomPattern = useRoomStore(state => state.room?.pattern)
  const claiming = useGameStore(state => state.claiming)
  // const { leaveGame, connected, connect } = useWebSocketEvents({ roomId, enabled: true })
  const { leaveGame, connected, connect, markNumber, claimBingo } = useRoomSocket({ roomId, enabled: true })
  const router = useRouter()

  const [autoPlay, setAutoPlay] = useState(false)

  useEffect(() => {
    setAutoPlay(localStorage.getItem("auto-play-enabled") === "true")
  }, [])

  const handleAutoPlayToggle = (checked: boolean) => {
    setAutoPlay(checked)
    localStorage.setItem("auto-play-enabled", String(checked))
  }

  useEffect(() => {
    if (!autoPlay || !connected || !started || !gameId) return

    for (const card of userSelectedCards) {
      const cardNumbers = transformCardData(card.numbers).flat()
      for (const num of cardNumbers) {
        if (num > 0 && drawnNumbers.includes(num) && !(card.marked ?? []).includes(num)) {
          markNumber(gameId, card.cardId, num)
        }
      }
    }
  }, [autoPlay, connected, started, gameId, drawnNumbers, userSelectedCards, markNumber])

  const claimedCardsRef = useRef<Set<string>>(new Set())

  // Reset claimed cards when a new game starts
  useEffect(() => {
    claimedCardsRef.current.clear()
  }, [gameId, started])

  useEffect(() => {
    if (!autoPlay || !connected || !started || !gameId || claiming || !telegramId) return

    const pattern = roomPattern ?? GamePattern.LINE_AND_CORNERS

    for (const card of userSelectedCards) {
      if (claimedCardsRef.current.has(card.cardId)) continue

      // Also count drawn numbers on the card that are still being marked so the
      // claim payload always includes the last called number
      const cardNumbers = transformCardData(card.numbers).flat()
      const markedNumbers = Array.from(new Set([
        ...(card.marked ?? []),
        ...drawnNumbers.filter((n) => cardNumbers.includes(n)),
      ]))

      if (!checkCardPatternWin(card.numbers, markedNumbers, pattern)) continue

      claimedCardsRef.current.add(card.cardId)
      claimBingo({
        gameId,
        cardId: card.cardId,
        pattern,
        playerId: telegramId.toString(),
        userProfileId: userDbId,
        playerName: userName,
        markedNumbers,
        card,
      })
    }
  }, [autoPlay, connected, started, gameId, claiming, telegramId, userDbId, userName, userSelectedCards, drawnNumbers, roomPattern, claimBingo])

  router.prefetch(`/${i18n.language}`)
  //useAutoRefreshGameState(roomId, 3000);

  const [isLeaving, setLeaving] = useState(false)

  const { room, loading, fetchRoom } = useRoomStore()
  const maxCards = room?.maxCards || 1

  // const getCurrentLetter = (number: number): string => {
  //   if (number < 1 || number > 75) throw new Error("Number must be between 1 and 75");

  //   const letters = ["B", "I", "N", "G", "O"];
  //   const index = Math.floor((number - 1) / 15);
  //   return letters[index];
  // };



  //  const playNumberSound = (number: number | undefined) => {
  //   if (!number) return;
  //   if (localeChanged){
  //     setLocaleChanged(false)
  //     return
  //   }
  //   const audio = new Audio(`/audio/${i18n.language}/${number}.mp3`);
  //   audio.play().catch((err) => console.warn("Audio blocked:", err));
  // };


  // useEffect(() => {
  //   setCurrentLetter(getCurrentLetter(Number(currentDrawnNumber)))
  //   if (currentDrawnNumber !== null && currentDrawnNumber !==undefined && status === GameStatus.PLAYING && voiceOn) {
  //     playNumberSound(currentDrawnNumber);
  //   }

  // }, [currentDrawnNumber, status, voiceOn]);

  // Fetch room data once
  useEffect(() => {
    const init = async () => {
      try {
        await fetchRoom(roomId)
      } catch (err) {
        console.error("Failed to initialize room data:", err)
      }
    }
    init()
  }, [fetchRoom, roomId])


  const handleLeaveGame = async () => {
    if (!gameId || !telegramId) {
      router.replace(`/${i18n.language}?agentId=${activeAgentId}`)
      return
    }

    setLeaving(true)
    // router.replace(`/${i18n.language}`)
    try {
      await leaveGame(gameId, telegramId.toString())
    } catch (err) {
      console.error("Failed to leave game:", err)
      setLeaving(false)
    }
  }


  // const handleRefresh = async () => {
  //   setRefreshing(true)
  //   await connect()
  //   setRefreshing(false)
  // }


  if (gameId === null || loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
        <div className="text-sm text-muted-foreground">Loading game...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <GameHeader room={room} connected={connected} />

      {/* Legend + auto-mark bar */}
      <div className="flex flex-wrap items-center justify-center gap-2 px-3 pt-3 text-xs sm:text-sm">

        {/* BEFORE CALL (Disabled / not called) */}
        <div className="flex items-center gap-1.5 rounded-md bg-card px-2.5 py-1.5 border border-border opacity-60">
          <span
            className="
              inline-flex h-3.5 w-3.5 rounded-sm
              bg-[var(--bingo-card-key-legend-before-call-bg)]
              border border-[var(--bingo-card-key-legend-before-call-border)]
            "
          />
          <span className="text-muted-foreground">ያልተጠራ</span>
        </div>

        {/* AFTER CALL (unmarked) */}
        <div className="flex items-center gap-1.5 rounded-md bg-card px-2.5 py-1.5 border border-border">
          <span
            className="
              inline-flex h-3.5 w-3.5 rounded-sm
              bg-[var(--bingo-card-key-legend-after-call-unmarked-bg)]
              border border-white/60
            "
          />
          <span className="text-foreground">የተጠራ</span>
        </div>

        {/* MARKED */}
        <div className="flex items-center gap-1.5 rounded-md bg-card px-2.5 py-1.5 border border-border">
          <span
            className="
              inline-flex h-3.5 w-3.5 rounded-sm
              bg-[var(--bingo-card-key-legend-after-call-marked-bg)]
              border border-white/60
            "
          />
          <span className="text-foreground">ማርክ የተደረገ</span>
        </div>
      </div>

    
      <div className="container mx-auto p-2 sm:p-4">
        <div className="grid grid-cols-2 gap-1 sm:gap-2 lg:gap-2">
          <div className="order-1">
            <NumberGrid />
          </div>

          <div className="order-2 sm:order-2">
            <div
              className="
                rounded-xl h-12 w-full max-w-xs mx-auto p-1
                border
                bg-[var(--game-countdown-and-call-area-bg)]
                border-[var(--game-countdown-and-call-area-border)]
              "
            >
              <div className="flex items-center justify-center h-full">
                <CountdownTimer label="" />
              </div>
            </div>
            
            <GameCards
              selectedCardIds={selectedCardIds}
              autoPlay={autoPlay}
              onAutoPlayChange={handleAutoPlayToggle}
            />
          </div>
        </div>

        <div className="py-4 px-3 flex flex-row items-center justify-center gap-3 w-full">
          {/* <Button
            onClick={handleRefresh}
            disabled={isLeaving || refreshing}
            className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-4 text-lg rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button> */}

          <Button
            onClick={handleLeaveGame}
            disabled={isLeaving}
            className="w-full max-w-md inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-4 text-lg rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            <LogOut className="h-5 w-5" />
            {isLeaving ? "Leaving..." : "Leave Game"}
          </Button>
        </div>


      </div>
    </div>
  )
}

