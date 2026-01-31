import { create } from "zustand"
import type { Room } from "@/lib/types"
import i18n from "@/i18n"

interface LobbyState {
  rooms: Room[]
  loading: boolean
  error: string | null
  filters: {
    fee?: number
    status?: Room["status"]
    search?: string
  }

  // Actions
  setRooms: (rooms: Room[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setFilters: (filters: Partial<LobbyState["filters"]>) => void
  fetchRooms: (agentId: number) => Promise<void>
  sendInitData: (initData: string) => Promise<void>
  clearFilters: () => void
}


// const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL!;  


export const useLobbyStore = create<LobbyState>((set, get) => ({
  rooms: [],
  loading: false,
  error: null,
  filters: {},

  setRooms: (rooms) => set({ rooms }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),


  fetchRooms: async (agentId) => {
    // if (get().rooms.length) return
    const urlPath = `/${i18n.language}/api/rooms?agentId=${agentId}`

    set({ loading: true, error: null })
    try {
      // const rooms = await apiClient.getRooms()

      const response = await fetch(`${urlPath}`);

      const { success, data, error } = await response.json();

      set({ rooms: data, loading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unknown error",
        loading: false,
      })
    }
  },

  sendInitData: async (initData) => {
    const urlPath = `/${i18n.language}/api/telegram`

    try {
      const response = await fetch(urlPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData: initData }),
      });

      const result = await response.json();

      if (!response.ok) {
        set({
          error: result?.error || "Backend error",
        })
      }

      console.log("Init data sent successfully:", result);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  },

  clearFilters: () => set({ filters: {} }),
}))
