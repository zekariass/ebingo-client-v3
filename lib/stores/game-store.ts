import { create } from "zustand"
import { GamePattern, GameStatus as Status } from "@/lib/types"
import type { GameState, GameStatus, CardInfo, GameWinner, ClaimError } from "@/lib/types"

interface GameStore {
  game: GameState // current game state
  activeGames: Record<number, GameState> // list of active games
  winner: GameWinner
  error: string | null
  joinError: string | null
  claimError: ClaimError | null
  claiming: boolean
  isJoining: boolean

  setJoining: (value: boolean) => void

  // Actions
  setGameState: (game: Partial<GameState>) => void
  resetGameState: () => void
  // getGameState: () => Promise<GameState | null>
  syncCurrentGameState: (game: Partial<GameState>) => Promise<void>
  syncActiveGamesStates: (roomId: number, gameState: Partial<GameState>) => void
  addPlayer: (playerId: string) => void
  setJoinedPlayers: (joinedPlayers: string[]) => void
  removePlayer: (playerId: string) => void
  setPlayersCount: (count: number) => void
  addDrawnNumber: (number: number) => void
  resetDrawnNumbers: () => void
  setCurrentDrawnNumber: (number: number) => void
  selectCardOptimistically: (card: CardInfo) => void
  releaseCard: (cardId: string) => void
  releaseCardOptimistically: (cardId: string) => void
  addPlayerSelectedCards: (cardIds: string[], playerId: number, currentUser: number) => void
  setAllPlayerSelectedCardIds: (cardIds: string[]) => void
  setAllCardIds: (cardIds: string[]) => void
  addMarkedNumberToCard: (cardId: string, number: number) => void
  setMarkedNumbersForACard: (cardId: string, numbers: number[]) => void
  removeMarkedNumberFromCard: (cardId: string, number: number) => void
  getCurrentCardById: (cardId: string) => CardInfo | null
  stopDrawing: () => void
  setStarted: (started: boolean) => void
  setEnded: (ended: boolean) => void
  updateStatus: (status: GameStatus) => void
  setCountdownTime: (endTime: string, duration: number, epochMillis: number, status: GameStatus) => void
  setBackendEpochMillis: (epochMillis: number) => void
  setWinner: (winner: GameWinner) => void
  resetWinner: () => void
  setClaimError: (error: ClaimError) => void
  setError: (error: string | null) => void
  setJoinError: (error: string | null) => void
  resetClaimError: () => void
  setClaiming: (value: boolean) => void
}

const initialGameState: GameState = {
  gameId: 0,
  roomId: 0,
  agentId: 0,
  joinedPlayers: [],
  playersCount: 0,
  drawnNumbers: [],
  currentDrawnNumber: undefined,
  userSelectedCardsIds: [],
  userSelectedCards: [],
  allSelectedCardsIds: [],
  started: false,
  ended: false,
  status: Status.READY,
  stopNumberDrawing: false,
  countdownEndTime: "",
  countdownDurationSeconds: -1,
  backendEpochMillis: -1,
  loading: false,
}

const initialWinnerState: GameWinner = {
  gameId: -1,
  playerId: 0,
  playerName: "",
  cardId: "",
  pattern: GamePattern.LINE_AND_CORNERS,
  prizeAmount: 0,
  winAt: "",
  hasWinner: false,
}

const maxCards = 2

export const useGameStore = create<GameStore>((set, get) => ({
  game: initialGameState,
  activeGames: {},
  winner: initialWinnerState,
  error: null,
  joinError: null,
  claimError: null,
  claiming: false,
  isJoining: false,

  setJoining: (value: boolean) => set((state: GameStore) => ({ ...state, isJoining: value })),

  setGameState: (incoming: Partial<GameState>) =>
    set((state: GameStore) => ({
      game: {
        ...state.game,
        ...incoming,
        userSelectedCards: incoming.userSelectedCards?.length
          ? incoming.userSelectedCards
          : state.game.userSelectedCards,
        userSelectedCardsIds: incoming.userSelectedCardsIds?.length
          ? incoming.userSelectedCardsIds
          : state.game.userSelectedCardsIds,
        drawnNumbers: incoming.drawnNumbers ?? state.game.drawnNumbers
          
      },
    })),

  resetGameState: () => set({ game: { ...initialGameState } }),

  // getGameState: async () => {
  //   try {
  //     const response = await fetch(`/api/game/${get().game.roomId}/state`)
  //     if (!response.ok) throw new Error(`Error fetching game state: ${response.statusText}`)
  //     const data = await response.json()
  //     set((state: GameStore) => ({ ...state, game: data }))
  //     return data
  //   } catch (error) {
  //     console.error("Failed to fetch game state:", error)
  //     return null
  //   }
  // },

  syncCurrentGameState: async (newState: Partial<GameState>) => {
    set((state: GameStore) => ({
      game: { 
        ...newState,
        ...state.game, // ensures old state fields like userSelectedCards are preserved
        userSelectedCards: state.game.userSelectedCards,
        userSelectedCardsIds: state.game.userSelectedCardsIds,
        countdownDurationSeconds: state.game.countdownDurationSeconds,
      },
    }))
  },

  syncActiveGamesStates: (roomId: number, gameState: Partial<GameState>) =>
  set((state: GameStore) => ({
    activeGames: {
      ...state.activeGames,
      [roomId]: {
        ...state.activeGames[roomId], // spreads existing fields if any
        ...gameState,                 // fully overwrites with new values
      },
    },
  })),

  addPlayer: (playerId: string) =>
    set((state: GameStore) => ({
      game: state.game.joinedPlayers.includes(playerId)
        ? state.game
        : { ...state.game, joinedPlayers: [...state.game.joinedPlayers, playerId] },
    })),

  setJoinedPlayers: (joinedPlayers: string[]) =>
    set((state: GameStore) => ({
      game: { ...state.game, joinedPlayers },
    })),

  removePlayer: (playerId: string) =>
    set((state: GameStore) => ({
      game: { ...state.game, joinedPlayers: state.game.joinedPlayers.filter((id) => id !== playerId) },
    })),

  setPlayersCount: (count: number) =>
    set((state: GameStore) => ({ game: { ...state.game, playersCount: count } })),

  addDrawnNumber: (number: number) => {
    const { game } = get()
    if (game.drawnNumbers.includes(number)) return

    set((state) => ({
      game: {
        ...state.game,
        drawnNumbers: [...state.game.drawnNumbers, number],
      },
    }))
  },

  resetDrawnNumbers: () => set((state: GameStore) => ({ game: { ...state.game, drawnNumbers: [] } })),

  setCurrentDrawnNumber: (number: number) =>
    set((state: GameStore) => ({ game: { ...state.game, currentDrawnNumber: number } })),

  selectCardOptimistically: (card: CardInfo) =>
    set((state: GameStore) => {
      const g = state.game
      if (g.userSelectedCardsIds.includes(card.cardId)) return state
      if (g.userSelectedCardsIds.length >= maxCards) return state

      return {
        game: {
          ...g,
          userSelectedCardsIds: [...g.userSelectedCardsIds, card.cardId],
          userSelectedCards: [...g.userSelectedCards, card],
        },
      }
    }),

  releaseCard: (cardId: string) =>
    set((state: GameStore) => ({
      game: {
        ...state.game,
        userSelectedCardsIds: state.game.userSelectedCardsIds.filter((id) => id !== cardId),
        allSelectedCardsIds: state.game.allSelectedCardsIds.filter((id) => id !== cardId),
        userSelectedCards: state.game.userSelectedCards.filter((c) => c.cardId !== cardId),
      },
    })),

  releaseCardOptimistically: (cardId: string) =>
    set((state: GameStore) => ({
      game: {
        ...state.game,
        userSelectedCardsIds: state.game.userSelectedCardsIds.filter((id) => id !== cardId),
        userSelectedCards: state.game.userSelectedCards.filter((c) => c.cardId !== cardId),
      },
    })),

  // setAllPlayerSelectedCardIds: (cardIds: string[]) =>
  //   set((state: GameStore) => ({ game: { ...state.game, allSelectedCardsIds: [...new Set(cardIds)] } })),

  // addPlayerSelectedCards: (cardIds: string[], playerId: number, currentUser: number) => {
  //   const g = get().game

  //   if (playerId === currentUser) {
  //     const newUserCards = cardIds.filter((id) => !g.userSelectedCardsIds.includes(id))
  //     if (newUserCards.length)
  //       set((state: GameStore) => ({
  //         game: { ...state.game, userSelectedCardsIds: [...state.game.userSelectedCardsIds, ...newUserCards] },
  //       }))
  //   } else {
  //       const filteredUserCardsIds = g.userSelectedCardsIds.filter((id) => {
  //       const takenByOther = cardIds.includes(id)
  //       const notYetInGlobal = !g.allSelectedCardsIds.includes(id)
  //       return !(takenByOther && notYetInGlobal)
  //     })
  //     if (filteredUserCardsIds.length !== g.userSelectedCardsIds.length)
  //       set((state: GameStore) => ({ game: { ...state.game, userSelectedCardsIds: filteredUserCardsIds } }))
  //   }

  //   const newSelectedCards = cardIds.filter((id) => !g.allSelectedCardsIds.includes(id))
  //   if (newSelectedCards.length)
  //     set((state: GameStore) => ({ game: { ...state.game, allSelectedCardsIds: [...state.game.allSelectedCardsIds, ...newSelectedCards] } }))
  // },

  setAllPlayerSelectedCardIds: (cardIds: string[]) =>
    set((state) => ({
      game: {
        ...state.game,
        allSelectedCardsIds: [...new Set(cardIds)],
      },
    })),

  addPlayerSelectedCards: (
    cardIds: string[],
    playerId: number,
    currentUserId: number
  ) => {
    if (playerId !== currentUserId) return

    set((state) => ({
      game: {
        ...state.game,
        userSelectedCardsIds: cardIds,
      },
    }))
  },


  setAllCardIds: (cardIds: string[]) =>
    set((state: GameStore) => ({ game: { ...state.game, allCardIds: [...new Set(cardIds)] } })),

  addMarkedNumberToCard: (cardId: string, number: number) =>
    set((state: GameStore) => ({
      game: {
        ...state.game,
        userSelectedCards: state.game.userSelectedCards.map((card) =>
          card.cardId === cardId && !(card.marked ?? []).includes(number)
            ? { ...card, marked: [...(card.marked ?? []), number] }
            : card
        ),
      },
    })),

  setMarkedNumbersForACard: (cardId: string, numbers: number[] = []) =>
    set((state: GameStore) => ({
      game: {
        ...state.game,
        userSelectedCards: state.game.userSelectedCards.map((card) =>
          card.cardId === cardId
            ? { ...card, marked: Array.from(new Set([...(card.marked ?? []), ...numbers])) }
            : card
        ),
      },
    })),

  removeMarkedNumberFromCard: (cardId: string, number: number) =>
    set((state: GameStore) => ({
      game: {
        ...state.game,
        userSelectedCards: state.game.userSelectedCards.map((card) =>
          card.cardId === cardId ? { ...card, marked: (card.marked ?? []).filter((n) => n !== number) } : card
        ),
      },
    })),

  getCurrentCardById: (cardId: string) => get().game.userSelectedCards.find((c) => c.cardId === cardId) || null,

  setWinner: (winner: GameWinner) => set((state: GameStore) => ({ ...state, winner })),

  resetWinner: () => set((state: GameStore) => ({ ...state, winner: { ...initialWinnerState } })),

  setStarted: (started: boolean) => set((state: GameStore) => ({
    game: { ...state.game, started, status: started ? Status.PLAYING : state.game.status },
  })),

  setEnded: (ended: boolean) => set((state: GameStore) => ({
    game: { ...state.game, ended, status: ended ? Status.COMPLETED : state.game.status },
  })),

  setCountdownTime: (countdownEndTime: string, duration: number, epochMillis: number, status: GameStatus) =>
    set((state: GameStore) => ({
      game: { ...state.game, countdownEndTime, countdownDurationSeconds: duration, status, backendEpochMillis: epochMillis },
    })),

  setBackendEpochMillis: (epochMillis: number) =>
    set((state: GameStore) => ({
      game: { ...state.game, backendEpochMillis: epochMillis },
    })),

  setClaimError: (error: ClaimError) => set((state: GameStore) => ({ claimError: error ? { ...error } : null })),

  resetClaimError: () => set((state: GameStore) => ({ claimError: null })),

  setError: (error: string | null) => set((state: GameStore) => ({ error })),

  setJoinError: (joinError: string | null) => set((state: GameStore) => ({ joinError })),

  setClaiming: (value: boolean) => set((state: GameStore) => ({ claiming: value })),

  updateStatus: (status: GameStatus) => set((state: GameStore) => ({ game: { ...state.game, status } })),

  stopDrawing: () => set((state: GameStore) => ({ game: { ...state.game, stopNumberDrawing: true } })),
}))
