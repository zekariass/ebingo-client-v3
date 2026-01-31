import i18n from "@/i18n"
import { create } from "zustand"

export type DailyAccounting = {
  id: number;
  accountingDate: string; // LocalDate (YYYY-MM-DD)
  dailyDepositAmount: number;
  dailyWithdrawalAmount: number;
  dailyBetAmount: number;
  dailyPrizeAmount: number;
  dailyCommissionAmount: number;
  dailyBotWinAmount: number;
  dailyBotLossAmount: number;
  netIncome: number;
  dailyPromotionalBonusAmount: number;
  dailyWelcomeBonusAmount: number;
  agentId: number;
  settledAt: string; // LocalDateTime (ISO string)
  settledAmount: number;
  createdAt: string; // LocalDateTime (ISO string)
  updatedAt: string; // LocalDateTime (ISO string)
};

export type TotalAccounting = {
  id: number;
  agentId: number;
  totalDepositAmount: number;
  totalWithdrawalAmount: number;
  totalBetAmount: number;
  totalPrizeAmount: number;
  totalCommissionAmount: number;
  totalBotWinAmount: number;
  totalBotLossAmount: number;
  totalNetIncome: number;
  totalPromotionalBonusAmount: number;
  totalWelcomeBonusAmount: number;
  settledAt: string; // LocalDateTime (ISO string)
  settledAmount: number;
  createdAt: string; // LocalDateTime (ISO string)
  updatedAt: string; // LocalDateTime (ISO string)
};

export interface Agent {
  id: number
  name: string
  code: string
  phoneNumber: string
  email: string
  contactName: string | null
  isMaster: boolean
  isActive: boolean
  commissionRate: number
  botToken: string | null
  botUsername: string | null
  contactAddress: string | null
  createdAt: string
  updatedAt: string
}

interface AgentStore {
  activeAgentId: number | null
  loading: boolean
  error: string | null
  agentDetails: Agent | null
  
  // Agents list management
  agents: Agent[]
  agentsLoading: boolean
  agentsError: string | null
  currentPage: number
  totalPages: number
  totalElements: number
  searchTerm: string
  
  // Daily accounting management
  dailyAccountings: DailyAccounting[]
  dailyAccountingLoading: boolean
  dailyAccountingError: string | null
  dailyAccountingPage: number
  dailyAccountingTotalPages: number
  dailyAccountingTotalElements: number
  dailyAccountingStartDate: string | null
  dailyAccountingEndDate: string | null
  
  // Total accounting management
  totalAccountings: TotalAccounting[]
  totalAccountingLoading: boolean
  totalAccountingError: string | null
  totalAccountingPage: number
  totalAccountingTotalPages: number
  totalAccountingTotalElements: number
  
  setActiveAgentId: (agentId: number | null) => void
  resetActiveAgentId: () => void
  fetchAgentDetails: (agentId: number) => Promise<any>
  
  // Agents list actions
  fetchAgents: (page?: number, search?: string, size?: number) => Promise<void>
  searchAgents: (searchTerm: string) => Promise<void>
  updateAgent: (id: number, updates: Partial<Agent>) => Promise<void>
  setSearchTerm: (term: string) => void
  setCurrentPage: (page: number) => void
  resetAgents: () => void
  
  // Daily accounting actions
  fetchDailyAccountings: (agentId: number, page?: number, size?: number, startDate?: string, endDate?: string) => Promise<void>
  fetchAllDailyAccountings: (page?: number, size?: number) => Promise<void>
  fetchTodayDailyAccountings: (page?: number, size?: number) => Promise<void>
  fetchTodayDailyAccountingForAgent: (agentId: number) => Promise<void>
  fetchTodayDailyAccountingsForAllAgents: (page?: number, size?: number) => Promise<void>
  settleDailyAccounting: (id: number) => Promise<any>
  setDailyAccountingPage: (page: number) => void
  setDailyAccountingDateRange: (startDate: string | null, endDate: string | null) => void
  resetDailyAccountings: () => void
  
  // Total accounting actions
  fetchTotalAccountings: (agentId: number, page?: number, size?: number) => Promise<void>
  fetchAllTotalAccountings: (page?: number, size?: number, sortBy?: string) => Promise<void>
  fetchTotalAccountingForAgent: (agentId: number) => Promise<TotalAccounting | null>
  fetchTotalAccountingById: (id: number) => Promise<TotalAccounting | null>
  settleTotalAccounting: (id: number) => Promise<any>
  setTotalAccountingPage: (page: number) => void
  resetTotalAccountings: () => void
}

export const useAgentStore = create<AgentStore>((set, get) => ({
    activeAgentId: null,
    loading: false,
    error: null,
    agentDetails: null,
    
    // Agents list state
    agents: [],
    agentsLoading: false,
    agentsError: null,
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    searchTerm: "",
    
    // Daily accounting state
    dailyAccountings: [],
    dailyAccountingLoading: false,
    dailyAccountingError: null,
    dailyAccountingPage: 0,
    dailyAccountingTotalPages: 0,
    dailyAccountingTotalElements: 0,
    dailyAccountingStartDate: null,
    dailyAccountingEndDate: null,
    
    // Total accounting state
    totalAccountings: [],
    totalAccountingLoading: false,
    totalAccountingError: null,
    totalAccountingPage: 0,
    totalAccountingTotalPages: 0,
    totalAccountingTotalElements: 0,
    
  setActiveAgentId: (agentId: number | null) => set({ activeAgentId: agentId }),
  resetActiveAgentId: () => set({ activeAgentId: null }),
  
  fetchAgentDetails: async (agentId: number) => {
    const urlPath = `/${i18n.language}/api/agents/${agentId}`

    set({ loading: true, error: null })

    try {
        const response = await fetch(urlPath)
        const { success, data, error } = await response.json()

        if (!success) {
        throw new Error(error || "Failed to fetch agent details")
        }

        set({
        agentDetails: data,
        loading: false,
        })
    } catch (error) {
        set({
        error: error instanceof Error ? error.message : "Unknown error",
        loading: false,
        })
    }
  },
  
  fetchAgents: async (page = 0, search = "", size = 10) => {
    set({ agentsLoading: true, agentsError: null })

    try {
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
            sortBy: "id",
        })

        if (search) {
            params.append("search", search)
        }

        const response = await fetch(`/${i18n.language}/api/admin/agents?${params.toString()}`)
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
        }

        const result = await response.json()

        if (result.success) {
            const data = result.data
            set({
                agents: data.content || [],
                currentPage: data.page || 0,
                totalPages: data.totalPages || 0,
                totalElements: data.totalElements || 0,
                agentsLoading: false,
            })
        } else {
            throw new Error(result.error || "Failed to fetch agents")
        }
    } catch (error) {
        set({
            agentsError: error instanceof Error ? error.message : "Failed to fetch agents",
            agentsLoading: false,
        })
    }
  },
  
  updateAgent: async (id: number, updates: Partial<Agent>) => {
    try {
        const response = await fetch(`/${i18n.language}/api/admin/agents/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updates),
        })

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
        }

        const result = await response.json()

        if (result.success) {
            // Refresh the agents list
            const { currentPage, searchTerm } = get()
            get().fetchAgents(currentPage, searchTerm)
        } else {
            throw new Error(result.error || "Failed to update agent")
        }
    } catch (error) {
        set({
            agentsError: error instanceof Error ? error.message : "Failed to update agent",
        })
        throw error
    }
  },
  
  searchAgents: async (searchTerm: string) => {
    set({ agentsLoading: true, agentsError: null })

    try {
      const response = await fetch(`/${i18n.language}/api/admin/agents/search?searchTerm=${encodeURIComponent(searchTerm)}`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        set({
          agents: result.data || [],
          agentsLoading: false,
          searchTerm: searchTerm,
          // Since search results don't have pagination info from backend
          totalElements: result.data.length || 0,
          totalPages: 1,
          currentPage: 0,
        })
      } else {
        throw new Error(result.error || "Failed to search agents")
      }
    } catch (error) {
      set({
        agentsError: error instanceof Error ? error.message : "Failed to search agents",
        agentsLoading: false,
      })
    }
  },
  
  setSearchTerm: (term: string) => {
    set({ searchTerm: term, currentPage: 0 })
  },
  
  setCurrentPage: (page: number) => {
    set({ currentPage: page })
  },
  
  resetAgents: () => {
    set({
        agents: [],
        agentsLoading: false,
        agentsError: null,
        currentPage: 0,
        totalPages: 0,
        totalElements: 0,
        searchTerm: "",
    })
  },

  // Daily accounting actions
  fetchDailyAccountings: async (agentId: number, page = 0, size = 10, startDate?: string, endDate?: string) => {
    set({ dailyAccountingLoading: true, dailyAccountingError: null })

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      })

      let url: string
      
      // If both start and end dates are provided, use the date-range endpoint
      if (startDate && endDate) {
        url = `/${i18n.language}/api/accounting/daily/agent/${agentId}/date-range`
        params.append("startDate", startDate)
        params.append("endDate", endDate)
      } else {
        url = `/${i18n.language}/api/accounting/daily/agent/${agentId}`
      }

      const response = await fetch(`${url}?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        const data = result.data
        set({
          dailyAccountings: data.content || [],
          dailyAccountingPage: data.page || 0,
          dailyAccountingTotalPages: data.totalPages || 0,
          dailyAccountingTotalElements: data.totalElements || 0,
          dailyAccountingLoading: false,
        })
      } else {
        throw new Error(result.error || "Failed to fetch daily accountings")
      }
    } catch (error) {
      set({
        dailyAccountingError: error instanceof Error ? error.message : "Failed to fetch daily accountings",
        dailyAccountingLoading: false,
      })
    }
  },

  fetchAllDailyAccountings: async (page = 0, size = 10) => {
    set({ dailyAccountingLoading: true, dailyAccountingError: null })

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      })

      const response = await fetch(`/${i18n.language}/api/v1/accounting/daily?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        const data = result.data
        set({
          dailyAccountings: data.content || [],
          dailyAccountingPage: data.page || 0,
          dailyAccountingTotalPages: data.totalPages || 0,
          dailyAccountingTotalElements: data.totalElements || 0,
          dailyAccountingLoading: false,
        })
      } else {
        throw new Error(result.error || "Failed to fetch all daily accountings")
      }
    } catch (error) {
      set({
        dailyAccountingError: error instanceof Error ? error.message : "Failed to fetch all daily accountings",
        dailyAccountingLoading: false,
      })
    }
  },

  fetchTodayDailyAccountings: async (page = 0, size = 10) => {
    set({ dailyAccountingLoading: true, dailyAccountingError: null })

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      })

      const response = await fetch(`/${i18n.language}/api/v1/accounting/daily/today?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        const data = result.data
        set({
          dailyAccountings: data.content || [],
          dailyAccountingPage: data.page || 0,
          dailyAccountingTotalPages: data.totalPages || 0,
          dailyAccountingTotalElements: data.totalElements || 0,
          dailyAccountingLoading: false,
        })
      } else {
        throw new Error(result.error || "Failed to fetch today's daily accountings")
      }
    } catch (error) {
      set({
        dailyAccountingError: error instanceof Error ? error.message : "Failed to fetch today's daily accountings",
        dailyAccountingLoading: false,
      })
    }
  },

  fetchTodayDailyAccountingForAgent: async (agentId: number) => {
    set({ dailyAccountingLoading: true, dailyAccountingError: null })

    try {
      const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
      
      const response = await fetch(`/${i18n.language}/api/accounting/daily/agent/${agentId}/today`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        // Store today's record separately or add to the beginning of the list
        const todayRecord = result.data
        if (todayRecord) {
          set((state) => ({
            // Add today's record to the beginning if it doesn't already exist
            dailyAccountings: state.dailyAccountings.some(r => r.accountingDate === todayRecord.accountingDate) 
              ? state.dailyAccountings 
              : [todayRecord, ...state.dailyAccountings],
            dailyAccountingLoading: false,
          }))
        } else {
          set({ dailyAccountingLoading: false })
        }
      } else {
        throw new Error(result.error || "Failed to fetch today's daily accounting")
      }
    } catch (error) {
      set({
        dailyAccountingError: error instanceof Error ? error.message : "Failed to fetch today's daily accounting",
        dailyAccountingLoading: false,
      })
    }
  },

  fetchTodayDailyAccountingsForAllAgents: async (page = 0, size = 10) => {
    set({ dailyAccountingLoading: true, dailyAccountingError: null })

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      })

      const response = await fetch(`/${i18n.language}/api/accounting/daily/today?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        const data = result.data
        set({
          dailyAccountings: data.content || [],
          dailyAccountingPage: data.page || 0,
          dailyAccountingTotalPages: data.totalPages || 0,
          dailyAccountingTotalElements: data.totalElements || 0,
          dailyAccountingLoading: false,
        })
      } else {
        throw new Error(result.error || "Failed to fetch today's daily accounting for all agents")
      }
    } catch (error) {
      set({
        dailyAccountingError: error instanceof Error ? error.message : "Failed to fetch today's daily accounting for all agents",
        dailyAccountingLoading: false,
      })
    }
  },

  settleDailyAccounting: async (id: number) => {
    set({ dailyAccountingLoading: true, dailyAccountingError: null })

    try {
      const response = await fetch(`/${i18n.language}/api/accounting/daily/${id}/settle`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to settle daily accounting")
      }

      // Refresh the current list after settlement
      const { dailyAccountingPage } = get()
      get().fetchDailyAccountings(get().activeAgentId || 0, dailyAccountingPage)
      
      set({ dailyAccountingLoading: false })
      return result.data
    } catch (error) {
      set({
        dailyAccountingError: error instanceof Error ? error.message : "Failed to settle daily accounting",
        dailyAccountingLoading: false,
      })
      throw error
    }
  },

  setDailyAccountingPage: (page: number) => {
    set({ dailyAccountingPage: page })
  },

  setDailyAccountingDateRange: (startDate: string | null, endDate: string | null) => {
    set({ 
      dailyAccountingStartDate: startDate,
      dailyAccountingEndDate: endDate,
    })
  },

  resetDailyAccountings: () => {
    set({
      dailyAccountings: [],
      dailyAccountingLoading: false,
      dailyAccountingError: null,
      dailyAccountingPage: 0,
      dailyAccountingTotalPages: 0,
      dailyAccountingTotalElements: 0,
      dailyAccountingStartDate: null,
      dailyAccountingEndDate: null,
    })
  },

  // Total accounting actions
  fetchTotalAccountings: async (agentId: number, page = 0, size = 10) => {
    set({ totalAccountingLoading: true, totalAccountingError: null })

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      })

      const response = await fetch(`/${i18n.language}/api/v1/accounting/total/agent/${agentId}?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        const data = result.data
        set({
          totalAccountings: data.content || [],
          totalAccountingPage: data.page || 0,
          totalAccountingTotalPages: data.totalPages || 0,
          totalAccountingTotalElements: data.totalElements || 0,
          totalAccountingLoading: false,
        })
      } else {
        throw new Error(result.error || "Failed to fetch total accountings")
      }
    } catch (error) {
      set({
        totalAccountingError: error instanceof Error ? error.message : "Failed to fetch total accountings",
        totalAccountingLoading: false,
      })
    }
  },

  fetchTotalAccountingForAgent: async (agentId: number) => {
    try {
      const response = await fetch(`/${i18n.language}/api/v1/accounting/total/agent/${agentId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch total accounting")
      }

      return result.data
    } catch (error) {
      console.error("Error fetching total accounting for agent:", error)
      throw error
    }
  },

  fetchAllTotalAccountings: async (page = 0, size = 10, sortBy = "id") => {
    set({ totalAccountingLoading: true, totalAccountingError: null })

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sortBy: sortBy,
      })

      const response = await fetch(`/${i18n.language}/api/v1/accounting/total?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        const data = result.data
        set({
          totalAccountings: data.content || [],
          totalAccountingPage: data.page || 0,
          totalAccountingTotalPages: data.totalPages || 0,
          totalAccountingTotalElements: data.totalElements || 0,
          totalAccountingLoading: false,
        })
      } else {
        throw new Error(result.error || "Failed to fetch all total accountings")
      }
    } catch (error) {
      set({
        totalAccountingError: error instanceof Error ? error.message : "Failed to fetch all total accountings",
        totalAccountingLoading: false,
      })
    }
  },

  fetchTotalAccountingById: async (id: number) => {
    try {
      const response = await fetch(`/${i18n.language}/api/v1/accounting/total/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch total accounting")
      }

      return result.data
    } catch (error) {
      console.error("Error fetching total accounting by ID:", error)
      throw error
    }
  },

  settleTotalAccounting: async (id: number) => {
    try {
      const response = await fetch(`/${i18n.language}/api/v1/accounting/total/${id}/settle`, {
        method: "PUT",
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to settle total accounting")
      }

      // Refresh the list after settlement
      const { totalAccountingPage } = get()
      get().fetchAllTotalAccountings(totalAccountingPage)
      
      return result.data
    } catch (error) {
      set({
        totalAccountingError: error instanceof Error ? error.message : "Failed to settle total accounting",
      })
      throw error
    }
  },

  setTotalAccountingPage: (page: number) => {
    set({ totalAccountingPage: page })
  },

  resetTotalAccountings: () => {
    set({
      totalAccountings: [],
      totalAccountingLoading: false,
      totalAccountingError: null,
      totalAccountingPage: 0,
      totalAccountingTotalPages: 0,
      totalAccountingTotalElements: 0,
    })
  },
}))