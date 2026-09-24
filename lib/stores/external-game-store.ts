import { create } from "zustand"
import type {
  GoldenEggsTotalAccounting,
  GoldenEggsDailyAccounting,
  AgentGameResponse,
  CreateAgentGameRequest,
  AgentGameSettingDto,
  UpdateAgentGameModesRequest,
} from "@/lib/types"

export interface IconsUrls {
  url: string
  url_200_200?: string
  url_240_360?: string
  url_408_544?: string
  url_574_386?: string
  url_600_600?: string
  url_752_480?: string
  url_800_600?: string
}

export interface GameModeDto {
  gameMode: string
  title: string
  description: string
  category: string
  iconsUrls: IconsUrls
  multiplayer: boolean
  rtp: string
  bonusTypes: string[]
}

export interface LaunchRequest {
  agentId: number
  gameMode: string
  currency: string
  initData: string
  subId?: string
  lobbyUrl?: string
  brandName?: string
  lang?: string
  adaptive?: boolean
  isDemoPlay?: boolean
}

interface ExternalGameStore {
  gameModes: GameModeDto[]
  loading: boolean
  error: string | null
  selectedGameMode: GameModeDto | null
  gameUrl: string | null
  launching: boolean

  fetchGameModes: () => Promise<void>
  launchGame: (request: LaunchRequest) => Promise<string | null>
  setSelectedGameMode: (gameMode: GameModeDto | null) => void
  setGameUrl: (url: string | null) => void
  resetStore: () => void

  goldenEggsTotalAccounting: GoldenEggsTotalAccounting | null
  goldenEggsDailyAccountingList: GoldenEggsDailyAccounting[]
  goldenEggsSelectedDaily: GoldenEggsDailyAccounting | null
  agentGamesList: AgentGameResponse[]
  selectedAgentGame: AgentGameResponse | null
  accountingLoading: boolean
  gamesLoading: boolean
  accountingError: string | null
  gamesError: string | null

  agentGameSettings: AgentGameSettingDto | null
  gameSettingsLoading: boolean
  gameSettingsError: string | null

  getGoldenEggsTotalAccounting: (agentId: number) => Promise<void>
  getGoldenEggsDailyAccounting: (agentId: number) => Promise<void>
  getGoldenEggsDailyAccountingById: (id: number, agentId: number) => Promise<void>
  getGoldenEggsDailyAccountingByDate: (agentId: number, date: string) => Promise<void>
  getGoldenEggsDailyAccountingByRange: (agentId: number, startDate: string, endDate: string) => Promise<void>
  getGoldenEggsUnsettledDailyAccounting: (agentId: number) => Promise<void>
  settleGoldenEggsDailyAccounting: (id: number, agentId: number) => Promise<void>
  unsettleGoldenEggsDailyAccounting: (id: number, agentId: number) => Promise<void>
  getAgentGames: (agentId: number, enabledOnly?: boolean) => Promise<void>
  getAgentGameById: (id: number) => Promise<void>
  createAgentGame: (payload: CreateAgentGameRequest) => Promise<void>
  updateAgentGameStatus: (id: number, isEnabled: boolean) => Promise<void>
  deleteAgentGame: (id: number) => Promise<void>
  clearGoldenEggsErrors: () => void

  getAgentGameSettings: (agentId: number) => Promise<void>
  updateAgentGameSettings: (request: UpdateAgentGameModesRequest) => Promise<void>
  checkGameModeEnabled: (agentId: number, gameMode: string) => Promise<boolean>
  clearGameSettingsError: () => void
}

const initialState = {
  gameModes: [],
  loading: false,
  error: null,
  selectedGameMode: null,
  gameUrl: null,
  launching: false,
  goldenEggsTotalAccounting: null,
  goldenEggsDailyAccountingList: [],
  goldenEggsSelectedDaily: null,
  agentGamesList: [],
  selectedAgentGame: null,
  accountingLoading: false,
  gamesLoading: false,
  accountingError: null,
  gamesError: null,
  agentGameSettings: null,
  gameSettingsLoading: false,
  gameSettingsError: null,
}

export const useExternalGameStore = create<ExternalGameStore>((set) => ({
  ...initialState,

  fetchGameModes: async () => {
    set({ loading: true, error: null })
    
    try {
      const initData = typeof window !== "undefined" && window.Telegram?.WebApp?.initData
        ? window.Telegram.WebApp.initData
        : ""

      const lang = typeof window !== "undefined" 
        ? (localStorage.getItem("i18nextLng") || "en")
        : "en"

      const response = await fetch(`/${lang}/api/external-games/game-modes`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-init-data": initData,
        },
        cache: "no-store",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch game modes")
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        set({ gameModes: result.data, loading: false, error: null })
      } else {
        throw new Error(result.message || "Invalid response format")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch game modes"
      console.error("Error fetching game modes:", err)
      set({ error: errorMessage, loading: false, gameModes: [] })
    }
  },

  launchGame: async (request: LaunchRequest) => {
    set({ launching: true, error: null, gameUrl: null })
    
    try {
      const lang = typeof window !== "undefined" 
        ? (localStorage.getItem("i18nextLng") || "en")
        : "en"

      const response = await fetch(`/${lang}/api/external-games/launch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
        cache: "no-store",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to launch game")
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        // Extract URL from response - backend returns { url: '...' }
        const gameUrl = typeof result.data === 'string' ? result.data : result.data.url
        set({ gameUrl, launching: false, error: null })
        return gameUrl
      } else {
        throw new Error(result.message || "Invalid response format")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to launch game"
      console.error("Error launching game:", err)
      set({ error: errorMessage, launching: false, gameUrl: null })
      return null
    }
  },

  setSelectedGameMode: (gameMode: GameModeDto | null) => {
    set({ selectedGameMode: gameMode })
  },

  setGameUrl: (url: string | null) => {
    set({ gameUrl: url })
  },

  getGoldenEggsTotalAccounting: async (agentId: number) => {
    set({ accountingLoading: true, accountingError: null })
    
    try {
      const initData = typeof window !== "undefined" && window.Telegram?.WebApp?.initData
        ? window.Telegram.WebApp.initData
        : ""

      const lang = typeof window !== "undefined" 
        ? (localStorage.getItem("i18nextLng") || "en")
        : "en"

      const response = await fetch(`/${lang}/api/external-games/golden-eggs/accounting/total?agentId=${agentId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-init-data": initData,
        },
        cache: "no-store",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch total accounting")
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        set({ goldenEggsTotalAccounting: result.data, accountingLoading: false, accountingError: null })
      } else {
        throw new Error(result.message || "Invalid response format")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch total accounting"
      console.error("Error fetching total accounting:", err)
      set({ accountingError: errorMessage, accountingLoading: false })
    }
  },

  getGoldenEggsDailyAccounting: async (agentId: number) => {
    set({ accountingLoading: true, accountingError: null })
    
    try {
      const initData = typeof window !== "undefined" && window.Telegram?.WebApp?.initData
        ? window.Telegram.WebApp.initData
        : ""

      const lang = typeof window !== "undefined" 
        ? (localStorage.getItem("i18nextLng") || "en")
        : "en"

      const response = await fetch(`/${lang}/api/external-games/golden-eggs/accounting/daily?agentId=${agentId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-init-data": initData,
        },
        cache: "no-store",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch daily accounting")
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        set({ goldenEggsDailyAccountingList: result.data, accountingLoading: false, accountingError: null })
      } else {
        throw new Error(result.message || "Invalid response format")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch daily accounting"
      console.error("Error fetching daily accounting:", err)
      set({ accountingError: errorMessage, accountingLoading: false })
    }
  },

  getGoldenEggsDailyAccountingById: async (id: number, agentId: number) => {
    set({ accountingLoading: true, accountingError: null })
    
    try {
      const initData = typeof window !== "undefined" && window.Telegram?.WebApp?.initData
        ? window.Telegram.WebApp.initData
        : ""

      const lang = typeof window !== "undefined" 
        ? (localStorage.getItem("i18nextLng") || "en")
        : "en"

      const response = await fetch(`/${lang}/api/external-games/golden-eggs/accounting/daily/by-id/${id}?agentId=${agentId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-init-data": initData,
        },
        cache: "no-store",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch daily accounting by ID")
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        set({ goldenEggsSelectedDaily: result.data, accountingLoading: false, accountingError: null })
      } else {
        throw new Error(result.message || "Invalid response format")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch daily accounting by ID"
      console.error("Error fetching daily accounting by ID:", err)
      set({ accountingError: errorMessage, accountingLoading: false })
    }
  },

  getGoldenEggsDailyAccountingByDate: async (agentId: number, date: string) => {
    set({ accountingLoading: true, accountingError: null })
    
    try {
      const initData = typeof window !== "undefined" && window.Telegram?.WebApp?.initData
        ? window.Telegram.WebApp.initData
        : ""

      const lang = typeof window !== "undefined" 
        ? (localStorage.getItem("i18nextLng") || "en")
        : "en"

      const response = await fetch(`/${lang}/api/external-games/golden-eggs/accounting/daily/by-date/${date}?agentId=${agentId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-init-data": initData,
        },
        cache: "no-store",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch daily accounting by date")
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        set({ goldenEggsSelectedDaily: result.data, accountingLoading: false, accountingError: null })
      } else {
        throw new Error(result.message || "Invalid response format")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch daily accounting by date"
      console.error("Error fetching daily accounting by date:", err)
      set({ accountingError: errorMessage, accountingLoading: false })
    }
  },

  getGoldenEggsDailyAccountingByRange: async (agentId: number, startDate: string, endDate: string) => {
    set({ accountingLoading: true, accountingError: null })
    
    try {
      const initData = typeof window !== "undefined" && window.Telegram?.WebApp?.initData
        ? window.Telegram.WebApp.initData
        : ""

      const lang = typeof window !== "undefined" 
        ? (localStorage.getItem("i18nextLng") || "en")
        : "en"

      const response = await fetch(`/${lang}/api/external-games/golden-eggs/accounting/daily/range?agentId=${agentId}&startDate=${startDate}&endDate=${endDate}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-init-data": initData,
        },
        cache: "no-store",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch daily accounting by range")
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        set({ goldenEggsDailyAccountingList: result.data, accountingLoading: false, accountingError: null })
      } else {
        throw new Error(result.message || "Invalid response format")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch daily accounting by range"
      console.error("Error fetching daily accounting by range:", err)
      set({ accountingError: errorMessage, accountingLoading: false })
    }
  },

  getGoldenEggsUnsettledDailyAccounting: async (agentId: number) => {
    set({ accountingLoading: true, accountingError: null })
    
    try {
      const initData = typeof window !== "undefined" && window.Telegram?.WebApp?.initData
        ? window.Telegram.WebApp.initData
        : ""

      const lang = typeof window !== "undefined" 
        ? (localStorage.getItem("i18nextLng") || "en")
        : "en"

      const response = await fetch(`/${lang}/api/external-games/golden-eggs/accounting/daily/unsettled?agentId=${agentId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-init-data": initData,
        },
        cache: "no-store",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch unsettled daily accounting")
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        set({ goldenEggsDailyAccountingList: result.data, accountingLoading: false, accountingError: null })
      } else {
        throw new Error(result.message || "Invalid response format")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch unsettled daily accounting"
      console.error("Error fetching unsettled daily accounting:", err)
      set({ accountingError: errorMessage, accountingLoading: false })
    }
  },

  settleGoldenEggsDailyAccounting: async (id: number, agentId: number) => {
    set({ accountingLoading: true, accountingError: null })
    
    try {
      const initData = typeof window !== "undefined" && window.Telegram?.WebApp?.initData
        ? window.Telegram.WebApp.initData
        : ""

      const lang = typeof window !== "undefined" 
        ? (localStorage.getItem("i18nextLng") || "en")
        : "en"

      const response = await fetch(`/${lang}/api/external-games/golden-eggs/accounting/daily/settle/${id}?agentId=${agentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-init-data": initData,
        },
        cache: "no-store",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to settle daily accounting")
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        set((state) => ({
          goldenEggsDailyAccountingList: state.goldenEggsDailyAccountingList.map((item) =>
            item.id === id ? result.data : item
          ),
          goldenEggsSelectedDaily: state.goldenEggsSelectedDaily?.id === id ? result.data : state.goldenEggsSelectedDaily,
          accountingLoading: false,
          accountingError: null,
        }))
      } else {
        throw new Error(result.message || "Invalid response format")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to settle daily accounting"
      console.error("Error settling daily accounting:", err)
      set({ accountingError: errorMessage, accountingLoading: false })
      throw err
    }
  },

  unsettleGoldenEggsDailyAccounting: async (id: number, agentId: number) => {
    set({ accountingLoading: true, accountingError: null })
    
    try {
      const initData = typeof window !== "undefined" && window.Telegram?.WebApp?.initData
        ? window.Telegram.WebApp.initData
        : ""

      const lang = typeof window !== "undefined" 
        ? (localStorage.getItem("i18nextLng") || "en")
        : "en"

      const response = await fetch(`/${lang}/api/external-games/golden-eggs/accounting/daily/unsettle/${id}?agentId=${agentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-init-data": initData,
        },
        cache: "no-store",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to unsettle daily accounting")
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        set((state) => ({
          goldenEggsDailyAccountingList: state.goldenEggsDailyAccountingList.map((item) =>
            item.id === id ? result.data : item
          ),
          goldenEggsSelectedDaily: state.goldenEggsSelectedDaily?.id === id ? result.data : state.goldenEggsSelectedDaily,
          accountingLoading: false,
          accountingError: null,
        }))
      } else {
        throw new Error(result.message || "Invalid response format")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to unsettle daily accounting"
      console.error("Error unsettling daily accounting:", err)
      set({ accountingError: errorMessage, accountingLoading: false })
      throw err
    }
  },

  getAgentGames: async (agentId: number, enabledOnly?: boolean) => {
    set({ gamesLoading: true, gamesError: null })
    
    try {
      const initData = typeof window !== "undefined" && window.Telegram?.WebApp?.initData
        ? window.Telegram.WebApp.initData
        : ""

      const lang = typeof window !== "undefined" 
        ? (localStorage.getItem("i18nextLng") || "en")
        : "en"

      const enabledParam = enabledOnly !== undefined ? `&enabledOnly=${enabledOnly}` : ""
      const response = await fetch(`/${lang}/api/agent-games?agentId=${agentId}${enabledParam}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-init-data": initData,
        },
        cache: "no-store",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch agent games")
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        set({ agentGamesList: result.data, gamesLoading: false, gamesError: null })
      } else {
        throw new Error(result.message || "Invalid response format")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch agent games"
      console.error("Error fetching agent games:", err)
      set({ gamesError: errorMessage, gamesLoading: false })
    }
  },

  getAgentGameById: async (id: number) => {
    set({ gamesLoading: true, gamesError: null })
    
    try {
      const initData = typeof window !== "undefined" && window.Telegram?.WebApp?.initData
        ? window.Telegram.WebApp.initData
        : ""

      const lang = typeof window !== "undefined" 
        ? (localStorage.getItem("i18nextLng") || "en")
        : "en"

      const response = await fetch(`/${lang}/api/agent-games/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-init-data": initData,
        },
        cache: "no-store",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch agent game")
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        set({ selectedAgentGame: result.data, gamesLoading: false, gamesError: null })
      } else {
        throw new Error(result.message || "Invalid response format")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch agent game"
      console.error("Error fetching agent game:", err)
      set({ gamesError: errorMessage, gamesLoading: false })
    }
  },

  createAgentGame: async (payload: CreateAgentGameRequest) => {
    set({ gamesLoading: true, gamesError: null })
    
    try {
      const initData = typeof window !== "undefined" && window.Telegram?.WebApp?.initData
        ? window.Telegram.WebApp.initData
        : ""

      const lang = typeof window !== "undefined" 
        ? (localStorage.getItem("i18nextLng") || "en")
        : "en"

      const response = await fetch(`/${lang}/api/agent-games`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-init-data": initData,
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create agent game")
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        set((state) => ({
          agentGamesList: [...state.agentGamesList, result.data],
          gamesLoading: false,
          gamesError: null,
        }))
      } else {
        throw new Error(result.message || "Invalid response format")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create agent game"
      console.error("Error creating agent game:", err)
      set({ gamesError: errorMessage, gamesLoading: false })
      throw err
    }
  },

  updateAgentGameStatus: async (id: number, isEnabled: boolean) => {
    set({ gamesLoading: true, gamesError: null })
    
    try {
      const initData = typeof window !== "undefined" && window.Telegram?.WebApp?.initData
        ? window.Telegram.WebApp.initData
        : ""

      const lang = typeof window !== "undefined" 
        ? (localStorage.getItem("i18nextLng") || "en")
        : "en"

      const response = await fetch(`/${lang}/api/agent-games/${id}/status?isEnabled=${isEnabled}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-init-data": initData,
        },
        cache: "no-store",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update agent game status")
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        set((state) => ({
          agentGamesList: state.agentGamesList.map((item) =>
            item.id === id ? result.data : item
          ),
          selectedAgentGame: state.selectedAgentGame?.id === id ? result.data : state.selectedAgentGame,
          gamesLoading: false,
          gamesError: null,
        }))
      } else {
        throw new Error(result.message || "Invalid response format")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update agent game status"
      console.error("Error updating agent game status:", err)
      set({ gamesError: errorMessage, gamesLoading: false })
      throw err
    }
  },

  deleteAgentGame: async (id: number) => {
    set({ gamesLoading: true, gamesError: null })
    
    try {
      const initData = typeof window !== "undefined" && window.Telegram?.WebApp?.initData
        ? window.Telegram.WebApp.initData
        : ""

      const lang = typeof window !== "undefined" 
        ? (localStorage.getItem("i18nextLng") || "en")
        : "en"

      const response = await fetch(`/${lang}/api/agent-games/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-init-data": initData,
        },
        cache: "no-store",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete agent game")
      }

      set((state) => ({
        agentGamesList: state.agentGamesList.filter((item) => item.id !== id),
        selectedAgentGame: state.selectedAgentGame?.id === id ? null : state.selectedAgentGame,
        gamesLoading: false,
        gamesError: null,
      }))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete agent game"
      console.error("Error deleting agent game:", err)
      set({ gamesError: errorMessage, gamesLoading: false })
      throw err
    }
  },

  clearGoldenEggsErrors: () => {
    set({ accountingError: null, gamesError: null })
  },

  getAgentGameSettings: async (agentId: number) => {
    set({ gameSettingsLoading: true, gameSettingsError: null })
    
    try {
      const initData = typeof window !== "undefined" && window.Telegram?.WebApp?.initData
        ? window.Telegram.WebApp.initData
        : ""

      const lang = typeof window !== "undefined" 
        ? (localStorage.getItem("i18nextLng") || "en")
        : "en"

      const response = await fetch(`/${lang}/api/external-games/game-settings?agentId=${agentId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-init-data": initData,
        },
        cache: "no-store",
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch agent game settings")
      }

      // Convert gameModes from comma-separated string to array if needed
      const data = result.data
      if (data && typeof data.gameModes === 'string') {
        data.gameModes = data.gameModes.split(',').map((mode: string) => mode.trim()).filter((mode: string) => mode)
      }

      set({
        agentGameSettings: data,
        gameSettingsLoading: false,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch agent game settings"
      console.error("Error fetching agent game settings:", err)
      set({ gameSettingsError: errorMessage, gameSettingsLoading: false })
      throw err
    }
  },

  updateAgentGameSettings: async (request: UpdateAgentGameModesRequest) => {
    set({ gameSettingsLoading: true, gameSettingsError: null })
    
    try {
      const initData = typeof window !== "undefined" && window.Telegram?.WebApp?.initData
        ? window.Telegram.WebApp.initData
        : ""

      const lang = typeof window !== "undefined" 
        ? (localStorage.getItem("i18nextLng") || "en")
        : "en"

      // Convert gameModes array to comma-separated string for backend
      const payload = {
        ...request,
        gameModes: request.gameModes
      }

      const response = await fetch(`/${lang}/api/external-games/game-settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-init-data": initData,
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update agent game settings")
      }

      // Convert gameModes from comma-separated string to array if needed
      const data = result.data
      if (data && typeof data.gameModes === 'string') {
        data.gameModes = data.gameModes.split(',').map((mode: string) => mode.trim()).filter((mode: string) => mode)
      }

      set({
        agentGameSettings: data,
        gameSettingsLoading: false,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update agent game settings"
      console.error("Error updating agent game settings:", err)
      set({ gameSettingsError: errorMessage, gameSettingsLoading: false })
      throw err
    }
  },

  checkGameModeEnabled: async (agentId: number, gameMode: string) => {
    try {
      const initData = typeof window !== "undefined" && window.Telegram?.WebApp?.initData
        ? window.Telegram.WebApp.initData
        : ""

      const lang = typeof window !== "undefined" 
        ? (localStorage.getItem("i18nextLng") || "en")
        : "en"

      const response = await fetch(`/${lang}/api/external-games/game-settings/check?agentId=${agentId}&gameMode=${gameMode}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-init-data": initData,
        },
        cache: "no-store",
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to check game mode")
      }

      return result.data
    } catch (err) {
      console.error("Error checking game mode:", err)
      return false
    }
  },

  clearGameSettingsError: () => {
    set({ gameSettingsError: null })
  },

  resetStore: () => {
    set(initialState)
  },
}))
