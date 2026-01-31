import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CardInfo, Room,} from "@/lib/types"
import i18n from "@/i18n"
import { useLobbyStore } from "./lobby-store"

interface RoomState {
  // Room data
  room: Room | null | undefined

  // UI state
  connected: boolean
  latencyMs: number
  serverTimeOffset: number
  loading: boolean

  // Actions
  setRoom: (room: Room) => void
  fetchRoom: (roomId: number) => Promise<Room | null>
  getRoomFromLobby: (roomId: number) => void
  setConnected: (connected: boolean) => void
  setLatency: (ms: number) => void
  setServerTimeOffset: (offset: number) => void
  // setBalance: (balance: number) => void
  initializeRoom: (roomId: string) => void
  resetRoom: () => void

  getSelectedCard: (cardId: string) => CardInfo | null | undefined
}

export const useRoomStore = create<RoomState>()(
  persist(
    (set, get) => ({
      // Initial state
      room: null,
      connected: false,
      latencyMs: 0,
      serverTimeOffset: 0,
      loading: false,

      // Actions
      setRoom: (room) => set({ room }),

      fetchRoom: async (roomId: number) => {
        const { room } = get();

        if (room && room.id === roomId) return room;

        set({ loading: true });

        try {
          const response = await fetch(`/${i18n.language}/api/rooms/${roomId}`);

          if (!response.ok) {
            throw new Error('Failed to fetch room data');
          }

          const result = await response.json();
          const { data } = result;

          
          set({ room: data, loading: false });
          return data;
        } catch (error: any) {
          console.error('Error fetching room:', error);
          set({ loading: false });
          return null;
        }
      },

      getSelectedCard: (cardId) => {
        return get().room?.cardPool.find((card) => card.cardId === cardId)
      },

      getRoomFromLobby: (roomId: number) => {
        const {rooms} = useLobbyStore.getState()
        const roomState = rooms.find((r) => r.id === roomId)
        set({ room: roomState || null })
        // return roomState
      },
    
      setConnected: (connected) => set({ connected }),
      setLatency: (latencyMs) => set({ latencyMs }),
      setServerTimeOffset: (serverTimeOffset) => set({ serverTimeOffset }),

      initializeRoom: (roomId) => {
        set({
          // selectedCardIds: [],
          // userCards: [],
          // calledNumbers: [],
          // currentNumber: null,
          // pattern: null,
        })

        if (roomId === "test-room-1") {
          set({
            // room: {
            //   id: roomId,
            //   name: "$10 Test Room (Auto-Play)",
            //   fee: 10,
            //   players: 15,
            //   capacity: 100,
            //   status: "in-game",
            // },
            // balance: 100, // Give test balance
          })
        }
      },

      resetRoom: () =>
        set({
          room: null,
          connected: false,
          latencyMs: 0,
          serverTimeOffset: 0,
        }),
    }),
    {
      name: "bingo-room-storage",
      partialize: (state) => ({
        // balance: state.balance,
        // selectedCardIds: state.selectedCardIds,
        // userCards: state.userCards,
      }),
    },
  ),
)
