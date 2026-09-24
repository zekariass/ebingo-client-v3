"use client"

import { useEffect, useMemo, useState } from "react"
import { useGameStore } from "@/lib/stores/game-store"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronsLeftIcon, ChevronsRightIcon, LayoutGrid, RefreshCwIcon, Trophy, Users } from "lucide-react"
// import { useWebSocketEvents } from "@/lib/hooks/websockets/use-websocket-events"
import { userStore } from "@/lib/stores/user-store"
import { CardInfo, GameStatus } from "@/lib/types"
import { CountdownTimer } from "../common/countdown-timer"
import { useRoomStore } from "@/lib/stores/room-store"
import { Badge } from "../ui/badge"
import { GameControls } from "./game-controls"
import { currency } from "@/lib/constant"
// import { useMusicPlayer } from "@/lib/contexts/music-player-context"

interface CardSelectionGridProps {
  roomId: number
  capacity: number
  disabled: boolean
}

export function CardSelectionGrid({ roomId, capacity, disabled }: CardSelectionGridProps) {


  // const allCardIds = useGameStore(state => state.game.allCardIds)
  const allCardIds = useRoomStore(state => state.room?.allCardIds)
  const commissionRate = useRoomStore(state => state.room?.commissionRate || 0)
  const entryFee = useRoomStore(state => state.room?.entryFee || 0)
  const getSelectedCard = useRoomStore(state => state.getSelectedCard)
  const maxCards = useRoomStore(state => state.room?.maxCards || 1)
  // const gameId = useGameStore(state => state.game.gameId)
  const status = useGameStore(state => state.game.status)
  const joinedPlayers = useGameStore(state => state.game.joinedPlayers)
    const userSelectedCardsIds = useGameStore(state => state.game.userSelectedCardsIds)
  const allSelectedCardsIds = useGameStore(state => state.game.allSelectedCardsIds)
  const selectCardOptimistically  = useGameStore(state => state.selectCardOptimistically)
  const deselectCardOptimistically  = useGameStore(state => state.releaseCardOptimistically)

  // const { toggle, isPlaying } = useMusicPlayer();

  // const {enterRoom, connected} =  useWebSocketEvents({roomId: roomId, enabled: true});
  // const {joinGame, connected} =  useRoomSocket({roomId: roomId, enabled: true});

  const user = userStore(state => state.user)

  const takenCards = new Set(allSelectedCardsIds)
  // const maxCards = 2

  const [currentPage, setCurrentPage] = useState(1)
  const cardsPerPage = 100
  const totalCards = allCardIds?.length || 0
  const totalPages = Math.ceil(totalCards / cardsPerPage)
  // const joinNotAllowed = countdownDuration > 0 && countdownDuration < 10


  const [rotating, setRotating] = useState(false)

  const handleRefreshClick = () => {
    setRotating(true)
    handleRefresh?.()
    // Stop rotation after 1 second
    setTimeout(() => setRotating(false), 1000)
  }

  // useEffect(() => {
  //     // enterRoom();
  // }, [enterRoom, connected]);

  // Slice the cards for the current page
  const paginatedCards = useMemo(() => {
    const startIndex = (currentPage - 1) * cardsPerPage
    const endIndex = Math.min(startIndex + cardsPerPage, totalCards)
    return allCardIds?.slice(startIndex, endIndex)
  }, [allCardIds, currentPage, cardsPerPage, totalCards])

  // const handleCardClick = (cardId: string) => {

  //   if (userSelectedCardsIds.includes(cardId) && user?.telegramId) {
  //     releaseCardBackend(gameId, cardId)
  //   } else if (!takenCards.has(cardId) && userSelectedCardsIds.length < maxCards && user?.telegramId) {
  //     selectCardBackend(gameId, cardId)
  //   }
  // }

  const handleCardClick = (cardId: string) => {
    if (userSelectedCardsIds.includes(cardId) && user?.telegramId) {
      deselectCardOptimistically(cardId)
    } else if (!takenCards.has(cardId) && userSelectedCardsIds.length < maxCards && user?.telegramId) {
      const card: CardInfo | null | undefined = getSelectedCard(cardId)
      if (card){
        selectCardOptimistically(card)
      }
    }
  }

  const getCardStatus = (cardId: string) => {
    if (userSelectedCardsIds.includes(cardId)) return "selected"
    if (takenCards.has(cardId)) return "taken"
    return "available"
  }


  const handleRefresh = () => {
      // enterRoom();
  }


  useEffect(() => {
  // Run this only when component mounts or when `paginatedCards` updates
  if (paginatedCards?.length === 0) {
    const timeout = setTimeout(() => {
      handleRefresh()
    }, 1000) // 1 seconds

    // Cleanup if the component unmounts early
    return () => clearTimeout(timeout)
  }
}, [paginatedCards, handleRefresh])

  

  const prize = allSelectedCardsIds.length * entryFee * (1 - commissionRate)

  return (
    <Card>
      <CardHeader className="space-y-2.5 pb-3">
        {/* Title + live status */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <LayoutGrid className="h-4 w-4 text-muted-foreground shrink-0" />
            <h2 className="text-sm sm:text-base font-semibold truncate">Select Your Cards</h2>
            <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5">
              {userSelectedCardsIds.length}/{maxCards}
            </Badge>
          </div>

          <div className="shrink-0">
            {status === GameStatus.COUNTDOWN ? (
              // <CountdownTimerAllGames activeGame={game} gamePage={false} />
              <CountdownTimer gamePage={false} />
            ) : status === GameStatus.PLAYING ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-[11px] sm:text-xs font-semibold text-red-500">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                LIVE
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-2.5 py-1 text-[11px] sm:text-xs font-semibold text-yellow-600 dark:text-yellow-400">
                <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 animate-pulse" />
                Waiting
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center gap-2">
          <div
            style={{ background: "var(--game-stat-4-bg)" }}
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[var(--game-stat-fg)]"
          >
            <Users className="h-3.5 w-3.5" />
            <span className="text-[11px] sm:text-xs font-medium">
              {joinedPlayers.length}{capacity > 0 ? `/${capacity}` : ""} Players
            </span>
          </div>
          <div
            style={{ background: "var(--game-stat-3-bg)" }}
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[var(--game-stat-fg)]"
          >
            <Trophy className="h-3.5 w-3.5" />
            <span className="text-[11px] sm:text-xs font-medium">
              {prize.toFixed(2)} {currency} Prize
            </span>
          </div>
        </div>

        {/* Status Legend - matches actual card colors */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] sm:text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-[var(--bingo-key-bg-free)] ring-1 ring-inset ring-white/20" />
            Available
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-[var(--bingo-key-bg-selected)] ring-1 ring-inset ring-white/20" />
            Selected
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-[var(--bingo-key-bg-taken)] opacity-70 ring-1 ring-inset ring-white/20" />
            Taken
          </span>
          <span className="text-muted-foreground/70">
            · up to {maxCards} card{maxCards > 1 ? "s" : ""}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-1 sm:p-1">
        <div className="grid grid-cols-10 xs:grid-cols-10 sm:grid-cols-10 md:grid-cols-20 lg:grid-cols-20 xl:grid-cols-20 gap-0.5 sm:gap-0.5 max-h-[60vh] overflow-y-auto ">
          {paginatedCards?.map((cardId, index) => {
            const status = getCardStatus(cardId)
            const absoluteIndex = (currentPage - 1) * cardsPerPage + index + 1


          const isSelected = userSelectedCardsIds.includes(cardId)
          const hasReachedMax = userSelectedCardsIds.length >= maxCards
          const isUnavailable = status === "taken"
          const isAvailable = status === "available"

          const isCardDisabled =
            disabled ||
            (!isSelected && (isUnavailable || (isAvailable && hasReachedMax)))

            return (
              <Button
                key={cardId}
                variant="outline"
                className={`
                  aspect-square w-full relative transition-all duration-200 text-[14px] xs:text-xs font-semibold h-6 xs:h-7 sm:h-8 min-h-0 p-0 rounded-xs cursor-pointer
                  ${
                    status === "selected"
                      ? "border border-[var(--bingo-key-bg-selected)] !bg-[var(--bingo-key-bg-selected)] ring-1 sm:ring-2 ring-[var(--bingo-key-ring-selected)] text-[var(--bingo-key-fg-selected)] hover:!bg-[var(--bingo-key-bg-selected-hover)] transition-colors"
                      : status === "taken"
                      ? "border-2 border-[var(--bingo-key-bg-taken)] !bg-[var(--bingo-key-bg-taken)] cursor-not-allowed opacity-50 text-[var(--bingo-key-fg-taken)]"
                      : "border border-[var(--bingo-key-bg-free)] !bg-[var(--bingo-key-bg-free)] text-[var(--bingo-key-fg-free)] hover:text-muted-foreground hover:bg-[var(--bingo-key-bg-free-hover)] transition-colors"

                  }
                  ${userSelectedCardsIds.length >= maxCards && status === "available" ? "opacity-50" : ""}
                `}
                onClick={() => handleCardClick(cardId)}
                disabled={isCardDisabled}
              >
                {absoluteIndex}
                {status === "selected" && (
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-[8px] sm:text-[10px]">✓</span>
                  </div>
                )}
              </Button>
            )
          })}
         
        </div>
            {!paginatedCards?.length && (
              <div className="flex flex-col items-center justify-center py-6">
                <RefreshCwIcon
                  onClick={handleRefreshClick}
                  size={48} // bigger icon
                  className={`cursor-pointer text-green-700 transition-transform duration-700 ${
                    rotating ? "rotate-[360deg]" : ""
                  }`}
                />
                <p className="text-center text-green-700 mt-2 text-sm sm:text-base">
                  Refresh to see cards
                </p>
              </div>
            )}
          

        {/* {userSelectedCardsIds.length >= maxCards && (
          <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-blue-800 rounded-lg flex flex-row">
            <Info size="16"></Info>
            <p className="text-xs sm:text-sm text-white ms-1">
              Max {maxCards} cards selected. To choose another deselect one.
            </p>
          </div>
        )} */}

        {/* {totalPages > 1 && (
          <div className="flex items-center gap-2 justify-end mt-1">
                <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
          </div>
        )} */}


        <div className="flex flex-col items-center mt-1 w-full space-y-2">
          {/* GameControls: always centered */}
          <div className="flex justify-center w-full">
            <GameControls disabled={disabled} />
          </div>

          {/* Pagination: only show if multiple pages */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronsLeftIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>

              <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronsRightIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          )}
        </div>



      </CardContent>
    </Card>
  )
}




