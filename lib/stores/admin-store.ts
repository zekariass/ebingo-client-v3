import { create } from "zustand"
import { RoomFormData } from "../schemas/admin-schemas"
import i18n from "@/i18n"
import { DailyLeaderboard, PaymentOrder, SystemConfig, TotalLeaderboard, Transaction, TransactionStatus, TransactionType, WalletDetails } from "../types"
import { userStore } from "./user-store"
import axios from "axios"

interface AdminStats {
  depositsToday: number
  withdrawalsToday: number
  betsToday: number
  prizesToday: number
  commissionToday: number
  netIncomeToday: number
  totalDeposits: number
  totalWithdrawals: number
  totalCommission: number
  totalNetIncome: number
  openRooms: number
  totalRooms: number
}


export type Room = {
  id: number;  
  agentId: number;                // Long -> number
  name: string;
  capacity: number;             // Integer -> number
  minPlayers: number;           // Integer -> number
  entryFee: number;             // BigDecimal -> number
  pattern: "LINE" | "LINE_AND_CORNERS" | "CORNERS" | "FULL_HOUSE"; // match RoomPattern enum
  status: "OPEN" | "CLOSED";     // match RoomStatus enum
  botAllowed?: boolean;
  minBots: number;
  maxBots: number;
  minDraws?: number;
  maxDraws?: number;
  fakeWinEnabled?: boolean;
  commissionRate: number;
  maxCards: number;
  createdBy: number;            // Long -> number
  createdAt: string;            // LocalDateTime -> ISO string
  updatedAt: string;            // LocalDateTime -> ISO string
};


interface Game {
  id: string
  roomName: string
  status: "waiting" | "playing" | "finished"
  numbersCalledCount: number
}

interface Player {
  id: string
  name: string
  email: string
  status: "active" | "banned"
  balance: number
  gamesPlayed: number
  winRate: number
}

interface Analytics {
  totalRevenue: number
  revenueGrowth: number
  totalPlayers: number
  playerGrowth: number
  gamesPlayed: number
  gamesDecline: number
  avgPrizePool: number
  prizePoolGrowth: number
  revenueByTier: Array<{
    fee: number
    games: number
    revenue: number
    percentage: number
  }>
  popularPatterns: Array<{
    name: string
    games: number
    percentage: number
  }>
}

interface AdminStore {
  // Dashboard data
  stats: AdminStats
  // deposits: PaymentOrder[]
  // withdrawals: PaymentOrder[]
  systemStatus: "healthy" | "warning" | "error"
  notifications: number

  orders: PaymentOrder[]
  page: number
  totalPages: number

  // Room management
  rooms: Room[]

  // Game control
  activeGames: Game[]

  // Player management
  players: Player[]

  // Analytics
  analytics: Analytics

  // Loading states
  isLoading: boolean
  error: string | null

  orderDetail: PaymentOrder | null
  isDetailLoading: boolean
  detailError: string | null

  dailyLeaderboard: DailyLeaderboard[]
  totalLeaderboard: TotalLeaderboard[]
  dailyLeaderboardLoading: boolean
  totalLeaderboardLoading: boolean
  dailyLeaderboardPage: number
  totalLeaderboardPage: number
  dailyLeaderboardTotalPages: number
  totalLeaderboardTotalPages: number

  WalletDetails: WalletDetails | null

  systemConfigs: SystemConfig[] | []
  sysConfigLoading: boolean

  fetchPaymentOrderDetail: (id: number, agentId: number) => Promise<void>
  updatePaymentOrderStatus: (payload: {
    agentId: number
    orderId: number
    approve: boolean
    reason?: string
  }) => Promise<void>

  fetchDailyLeaderboard: (agentId: number, page: number, size: number, orderBy: string, includeBots: boolean) => Promise<void>
  fetchTotalLeaderboard: (agentId: number, page: number, size: number, orderBy: string, includeBots: boolean) => Promise<void>

  fetchWalletDetails: (phoneNumber: string, agentId: number) => Promise<void>
  addDeposit: (agentId: number, telegramId: number, amount: number, txnRef: string) => Promise<boolean>
  addPromoBonus: (agentId: number, telegramId: number, amount: number) => Promise<boolean>

  // Actions
  loadDashboardData: (agentId: number) => Promise<void>
  refreshData: (agentId: number) => Promise<void>
  createRoom: (room: RoomFormData, agentId: number) => Promise<void>
  updateRoom: (id: string, agentId: number, updates: Partial<Room>) => Promise<void>
  deleteRoom: (id: number, agentId: number) => Promise<void>
  // retrieveRooms: () => Promise<Room[]>
  // controlGame: (gameId: string, action: string, data?: any) => Promise<void>
  banPlayer: (playerId: string) => Promise<void>
  unbanPlayer: (playerId: string) => Promise<void>
  loadRooms: (agentId: number) => Promise<void>
  // loadPlayers: (search?: string) => Promise<void>
  // loadGames: () => Promise<void>
  // loadAnalytics: () => Promise<void>

  // Transactions
  changeTransactionStatus: (txnRef: string, status: TransactionStatus) => Promise<void>
  updateTransaction: (txn: Transaction) => void
  getTransactions: (
    agentId: number,
    staus: TransactionStatus, 
    type: TransactionType, 
    page: number,
    size: number,
    sortBy: string
  ) => Promise<void>


  getPaymentOrders: (
    agentId: number,
    type: TransactionType,
    status: TransactionStatus,
    page: number,
    size: number,
    phoneNumber: string) => Promise<void>
  approveOrRejectPaymentOrder: (orderId: number, agentId: number, approve: boolean, reason?: string) => Promise<void>

  getSystemConfigs: (agentId: number) => Promise<void>
  updateSystemConfig: (id: number, value: string) => Promise<void>
  resetSystemConfigs: () => Promise<void>
  
}

export const useAdminStore = create<AdminStore>((set, get) => ({

  orders: [],
  page: 0,
  totalPages: 1,

  orderDetail: null,
  isDetailLoading: false,
  detailError: null,

  dailyLeaderboard: [],
  totalLeaderboard: [],
  dailyLeaderboardLoading: false,
  totalLeaderboardLoading: false,
  dailyLeaderboardPage: 1,
  totalLeaderboardPage: 1,
  dailyLeaderboardTotalPages: 1,
  totalLeaderboardTotalPages: 1,

  WalletDetails: null,
  systemConfigs: [],
  sysConfigLoading: false,


  // Initial state
  stats: {
    depositsToday: 0,
    withdrawalsToday: 0,
    betsToday: 0,
    prizesToday: 0,
    commissionToday: 0,
    netIncomeToday: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalCommission: 0,
    totalNetIncome: 0,
    openRooms: 0,
    totalRooms: 0,
  },

  withdrawals: [],
  deposits: [],
  systemStatus: "healthy",
  notifications: 3,
  rooms: [],
  activeGames: [],
  players: [],
  analytics: {
    totalRevenue: 125450,
    revenueGrowth: 15.2,
    totalPlayers: 2847,
    playerGrowth: 8.5,
    gamesPlayed: 1256,
    gamesDecline: 2.1,
    avgPrizePool: 450,
    prizePoolGrowth: 12.3,
    revenueByTier: [
      { fee: 10, games: 450, revenue: 4500, percentage: 35 },
      { fee: 20, games: 320, revenue: 6400, percentage: 28 },
      { fee: 50, games: 180, revenue: 9000, percentage: 25 },
      { fee: 100, games: 85, revenue: 8500, percentage: 12 },
    ],
    popularPatterns: [
      { name: "Line", games: 456, percentage: 45 },
      { name: "Full House", games: 234, percentage: 23 },
      { name: "Four Corners", games: 178, percentage: 18 },
      { name: "X Pattern", games: 145, percentage: 14 },
    ],
  },

  // Loading states
  isLoading: false,
  error: null,

  // Actions
  loadDashboardData: async (agentId) => {
    const { user, initData } = userStore.getState()
    const role = user?.role

    if (role !== "ADMIN" && role !== "AGENT") {
      set({ error: "Access denied: Admins and agents only" })
      return
    }

    set({ isLoading: true, error: null })
    try {
      const headers: Record<string, string> = {
        "x-user-role": role,
        ...(initData && { "x-init-data": initData }),
      }

      const [todayRes, totalRes] = await Promise.all([
        fetch(`/${i18n.language}/api/accounting/daily/agent/${agentId}/today`, {
          headers,
          cache: "no-store",
        }),
        fetch(`/${i18n.language}/api/v1/accounting/total/agent/${agentId}`, {
          headers,
          cache: "no-store",
        }),
      ])

      const [todayResult, totalResult] = await Promise.all([
        todayRes.json(),
        totalRes.json(),
      ])

      if (!todayResult.success && !totalResult.success) {
        set({ error: todayResult.message || totalResult.message || "Failed to load dashboard data" })
        return
      }

      const today = todayResult?.data ?? {}
      const total = totalResult?.data ?? {}
      const rooms = get().rooms ?? []

      set({
        stats: {
          depositsToday: today.dailyDepositAmount ?? 0,
          withdrawalsToday: today.dailyWithdrawalAmount ?? 0,
          betsToday: today.dailyBetAmount ?? 0,
          prizesToday: today.dailyPrizeAmount ?? 0,
          commissionToday: today.dailyCommissionAmount ?? 0,
          netIncomeToday: today.netIncome ?? 0,
          totalDeposits: total.totalDepositAmount ?? 0,
          totalWithdrawals: total.totalWithdrawalAmount ?? 0,
          totalCommission: total.totalCommissionAmount ?? 0,
          totalNetIncome: total.netIncome ?? 0,
          openRooms: rooms.filter((r) => r.status === "OPEN").length,
          totalRooms: rooms.length,
        },
      })
    } catch {
      set({ error: "Failed to load dashboard data" })
    } finally {
      set({ isLoading: false })
    }
  },

  refreshData: async (agentId) => {
    const { loadDashboardData, loadRooms } = get()
    await loadRooms(agentId)
    await loadDashboardData(agentId)
  },

  createRoom: async (roomData, agentId) => {
    const { user, initData } = userStore.getState();
    const role = user?.role;

    set({ isLoading: true, error: null });

    try {
      if (!role || (role !== "ADMIN")) {
        set({ error: "Access denied: Admins only", isLoading: false });
        return;
      }

      if (!initData) {
        set({ error: "Missing Telegram initData", isLoading: false });
        return;
      }

      const response = await fetch(`/${i18n.language}/api/admin/rooms?telegramId=${user?.telegramId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": role,
          "x-init-data": initData,
        },
        body: JSON.stringify({...roomData, agentId}),
      });

      const result = await response.json();

      if (result.success) {
        const { loadRooms } = get();
        await loadRooms(agentId); // refresh room list
      } else {
        set({ error: result.error || "Failed to create room" });
      }
    } catch (error) {
      console.error("Error creating room:", error);
      set({ error: "Failed to create room" });
    } finally {
      set({ isLoading: false });
    }
  },

  updateRoom: async (id, agentId, updates) => {
    const { user, initData} = userStore.getState();
    const role = user?.role;

    set({ isLoading: true, error: null });

    try {
      if (!role || (role !== "ADMIN" && role !== "AGENT")) {
        set({ error: "Access denied: Admins only", isLoading: false });
        return;
      }

      // if (!initData) {
      //   set({ error: "Missing Telegram initData", isLoading: false });
      //   return;
      // }

      const response = await fetch(`/${i18n.language}/api/admin/rooms/${id}?agentId=${agentId}`, {
        method: "PUT",
        headers: {
          // "Content-Type": "application/json",
          "x-user-role": role,
          // "x-init-data": initData,
        },
        body: JSON.stringify(updates),
      });

      const result = await response.json();

      if (result.success) {
        const { loadRooms } = get();
        await loadRooms(agentId);
      } else {
        set({ error: result.error || "Failed to update room" });
      }
    } catch (error) {
      console.error("Error updating room:", error);
      set({ error: "Failed to update room" });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteRoom: async (id, agentId) => {
    const { user, initData } = userStore.getState();
    const role = user?.role;

    set({ isLoading: true, error: null });

    try {
      if (!role || (role !== "ADMIN" && role !== "AGENT")) {
        set({ error: "Access denied: Admins and agents only", isLoading: false });
        return;
      }

      if (!initData) {
        set({ error: "Missing Telegram initData", isLoading: false });
        return;
      }

      const response = await fetch(`/${i18n.language}/api/admin/rooms/${id}?agentId=${agentId}`, {
        method: "DELETE",
        headers: {
          "x-user-role": role,
          "x-init-data": initData,
        },
      });

      const result = await response.json();

      if (result.success) {
        const { loadRooms } = get();
        await loadRooms(agentId);
      } else {
        set({ error: result.error || "Failed to delete room" });
      }
    } catch (error) {
      console.error("Error deleting room:", error);
      set({ error: "Failed to delete room" });
    } finally {
      set({ isLoading: false });
    }
  },

  loadRooms: async (agentId) => {
    const { user, initData } = userStore.getState(); // ✅ get user data from userStore
    const role = user?.role;

    set({ isLoading: true, error: null });

    try {
      if (!role || (role !== "ADMIN" && role !== "AGENT")) {
        set({ error: "Access denied: Admins and agents only", isLoading: false });
        return;
      }

      if (!initData) {
        set({ error: "Missing Telegram initData", isLoading: false });
        return;
      }

      const response = await fetch(`/${i18n.language}/api/admin/rooms?agentId=${agentId}`, {
        headers: {
          "x-user-role": role,
          "x-init-data": initData,
        },
        cache: "no-store",
      });

      const result = await response.json();

      if (result.success) {
        set({ rooms: result.data });
      } else {
        set({ error: result.error || "Failed to load rooms" });
      }
    } catch (error) {
      console.error("Error loading rooms:", error);
      set({ error: "Failed to load rooms" });
    } finally {
      set({ isLoading: false });
    }
  },

  
  fetchDailyLeaderboard: async (agentId, page, size, orderBy, includeBots) => {
    set({ dailyLeaderboardLoading: true, dailyLeaderboardPage: page, dailyLeaderboardTotalPages: 0 });
    try {
      const response = await fetch(`/${i18n.language}/api/admin/leaderboard/daily?page=${page}&size=${size}&orderBy=${orderBy}&includeBots=${includeBots}&agentId=${agentId}`, {
        headers: {
          "x-user-role": userStore.getState().user?.role || "",
          "x-init-data": userStore.getState().initData || "",
        },
        cache: "no-store",
      });

      const result = await response.json();

      if (result.success) {
        set({
          dailyLeaderboard: result.data.content,
          dailyLeaderboardTotalPages: Math.ceil(result.data.totalElements/size),
        });
      } else {
        console.error("Failed to fetch daily leaderboard:", result.error);
      }
    } catch (err) {
      console.error("Error fetching daily leaderboard:", err);
    } finally {
      set({ dailyLeaderboardLoading: false });
    }
  },

  fetchTotalLeaderboard: async (agentId, page, size, orderBy, includeBots) => {
    set({ totalLeaderboardLoading: true, totalLeaderboardPage: page, totalLeaderboardTotalPages: 0 });
    try {
      const response = await fetch(`/${i18n.language}/api/admin/leaderboard/total?page=${page}&size=${size}&orderBy=${orderBy}&includeBots=${includeBots}&agentId=${agentId}`, {
        headers: {
          "x-user-role": userStore.getState().user?.role || "",
          "x-init-data": userStore.getState().initData || "",
        },
        cache: "no-store",
      });

      const result = await response.json();

      if (result.success) {
        set({
          totalLeaderboard: result.data.content,
          totalLeaderboardTotalPages: Math.ceil(result.data.totalElements/size),
        });
      } else {
        console.error("Failed to fetch total leaderboard:", result.error);
      }
    } catch (err) {
      console.error("Error fetching total leaderboard:", err);
    } finally {
      set({ totalLeaderboardLoading: false });
    }
  },


  banPlayer: async (playerId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`/api/admin/players/${playerId}/ban`, {
        method: "POST",
      })

      const result = await response.json()

      if (result.success) {
        // const { loadPlayers } = get()
        // await loadPlayers()
      } else {
        set({ error: result.error })
      }
    } catch (error) {
      set({ error: "Failed to ban player" })
    } finally {
      set({ isLoading: false })
    }
  },

  unbanPlayer: async (playerId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`/api/admin/players/${playerId}/unban`, {
        method: "POST",
      })

      const result = await response.json()

      if (result.success) {
        // const { loadPlayers } = get()
        // await loadPlayers()
      } else {
        set({ error: result.error })
      }
    } catch (error) {
      set({ error: "Failed to unban player" })
    } finally {
      set({ isLoading: false })
    }
  },

  getTransactions: async (
    agentId: number,
  status: TransactionStatus | undefined,
  type: TransactionType | undefined,
  page: number,
  size: number,
  sortBy: string
) => {
    set({ isLoading: true, error: null })

    try {
      // Build query parameters safely
      const params = new URLSearchParams()

      if (status) params.append("status", status)
      if (type) params.append("type", type)
      params.append("page", page.toString())
      params.append("size", size.toString())
      params.append("sortBy", sortBy)
      params.append("agentId", agentId.toString())

      // Construct URL dynamically based on current language
      const url = `/${i18n.language}/api/admin/transactions?${params.toString()}`

      const response = await fetch(url)
      const result = await response.json()

      if (result.success) {
        set({ orders: result.data })
      } else {
        set({ error: result.message || "Failed to fetch transactions" })
      }
    } catch (error) {
      console.error("Error fetching transactions:", error)
      set({ error: "Failed to load transactions" })
    } finally {
      set({ isLoading: false })
    }
  },


  getPaymentOrders: async (
    agentId: number,
    type: TransactionType,
    status: TransactionStatus,
    page = 0,
    size = 10,
    phoneNumber?: string
  ) => {
    const { user, initData } = userStore.getState()
    const role = user?.role

    if (role !== "ADMIN" && role !== "AGENT") return

    set({ isLoading: true, error: null })
    try {
      const params = new URLSearchParams({
        page: page.toString(), // backend page is 0-based
        size: size.toString(),
      })

      params.append("txnType", type)
      params.append("status", status)
      params.append("agentId", agentId.toString())
      if (phoneNumber) params.append("phoneNumber", phoneNumber)

      const url = `/${i18n.language}/api/admin/payment-orders?${params.toString()}`

      const response = await fetch(url, {
        headers: {
          "x-user-role": role,
          "x-init-data": initData || "",
        },
      })

      const data = await response.json()

      if (data.success) {
        set({
          orders: data.data.content,
          page: data.data.page,
          totalPages: Math.ceil(data.data.totalElements/size),
        })
      } else {
        set({ error: data.error || "Failed to fetch payment orders" })
      }
    } catch (error) {
      console.error(error)
      set({ error: "Error fetching payment orders" })
    } finally {
      set({ isLoading: false })
    }
  },


  fetchPaymentOrderDetail: async (id: number, agentId: number) => {
    const { user, initData } = userStore.getState()
    const role = user?.role

    if (role !== "ADMIN" && role !== "AGENT") {
      set({ detailError: "Unauthorized" })
      return
    }

    try {
      set({ isDetailLoading: true, detailError: null, orderDetail: null })

      const res = await axios.get(`/${i18n.language}/api/admin/payment-orders/${id}?agentId=${agentId}`, {
        headers: {
          "x-user-role": role,
          "x-init-data": initData || "",
        },
      })

      if (res.data?.success) {
        set({ orderDetail: res.data.data })
      } else {
        set({ detailError: res.data.message || "Unable to load order detail" })
      }
    } catch (err: any) {
      set({ detailError: err.response?.data?.message || err.response?.data?.error || "Request failed" })
    } finally {
      set({ isDetailLoading: false })
    }
  },


  updatePaymentOrderStatus: async ({ agentId, orderId, approve, reason }) => {
    const { user, initData } = userStore.getState()
    const role = user?.role

    if (role !== "ADMIN" && role !== "AGENT") {
      throw new Error("Unauthorized")
    }

    try {
      const res = await axios.put(
        `/${i18n.language}/api/admin/payment-orders/update-status`, // Next.js route
        { adminUserId: user?.id, agentId, orderId, approve, reason },
        {
          headers: {
            "x-user-role": role,
            "x-init-data": initData || "",
            "Content-Type": "application/json",
          },
        }
      )

      if (!res.data?.success) {
        throw new Error(res.data?.message || "Failed to update order status")
      }

      // Refresh order detail after successful update
      await get().fetchPaymentOrderDetail(orderId, agentId)
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || "Request failed")
    }
  },


  fetchWalletDetails: async (phoneNumber: string, agentId: number) => {
    set({ isLoading: true, error: null, WalletDetails: null })
    try { 
      const response = await fetch(`/${i18n.language}/api/admin/wallet/detail?phoneNumber=${encodeURIComponent(phoneNumber)}&agentId=${agentId}`, {
        headers: {
          "x-user-role": userStore.getState().user?.role || "",
          "x-init-data": userStore.getState().initData || "",
        },
        cache: "no-store",
      })

      const result = await response.json()

      if (result.success) {
        set({ WalletDetails: result.data, error: null, isLoading: false })
      } else {
        set({ error: result.error || "Failed to fetch wallet details" })
      }
    } catch (err) {
      console.error("Error fetching wallet details:", err)
      set({ error: "Error fetching wallet details" })
    } finally {
      set({ isLoading: false })
    }
  },


  addPromoBonus: async (agentId: number, telegramId: number, amount: number) => {
    set({ isLoading: true, error: null });

    const admin = userStore.getState().user;

    try {
      const res = await fetch(`/${i18n.language}/api/admin/wallet/add-promo-bonus`, {
        method: "POST",
        headers: {
          "x-user-role": userStore.getState().user?.role || "",
          "x-init-data": userStore.getState().initData || "",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ telegramId, amount, agentId, adminTelegramId: admin?.telegramId }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || data?.success === false) {
        throw new Error(data?.error || data?.message || "Failed to add promo bonus");
      }

      set({ isLoading: false });
      return true;
    } catch (err: any) {
      set({ isLoading: false, error: err.message });
      return false;
    }
  },

  addDeposit: async (agentId: number, telegramId: number, amount: number, txnRef: string) => {
    set({ isLoading: true, error: null });

    const body = { telegramId, amount, paymentProviderRef: txnRef, agentId, paymentMethodCode: "manual"};

    try {
      const res = await fetch(`/${i18n.language}/api/admin/wallet/deposit`, {
        method: "POST",
        headers: {
          "x-user-role": userStore.getState().user?.role || "",
          "x-init-data": userStore.getState().initData || "",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || data?.success === false) {
        throw new Error(data?.error || data?.message || "Failed to add deposit")
      }

      set({ isLoading: false });
      return true;
    } catch (err: any) {
      set({ isLoading: false, error: err.message });
      return false;
    }
  },


  approveOrRejectPaymentOrder: async (orderId, agentId, approve, reason) => {
    const { user, initData } = userStore.getState()
    const role = user?.role
    if (role !== "ADMIN") return

    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`/${i18n.language}/api/admin/payment-orders/approval`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": role,
          "x-init-data": initData || "",
        },
        body: JSON.stringify({ orderId, agentId, approve, reason, adminUserId: user?.id }),
      })

      const result = await response.json()

      if (!result.success) {
        set({ error: result.error || "Failed to process approval" })
      }
    } catch (error) {
      console.error(error)
      set({ error: "Error approving/rejecting payment order" })
    } finally {
      set({ isLoading: false })
    }
  },

  changeTransactionStatus: async (txnRef: string, status: TransactionStatus) => {
    set({ isLoading: true, error: null })

    try {
      const url = `/${i18n.language}/api/admin/transactions/${encodeURIComponent(txnRef)}/status?status=${status}`

      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        }
        // body: JSON.stringify({ status }), 
      })

      let result: any = null
      try {
        result = await response.json()
      } catch {
        throw new Error("Invalid JSON response from server")
      }

      // Success
      if (response.ok && result?.success && result?.data) {
        get().updateTransaction(result.data)
      } else {
        const errorMsg =
          result?.error ||
          result?.message ||
          `Failed to update transaction status (${response.status})`
        set({ error: errorMsg })
      }
    } catch (error) {
      console.error("Error updating transaction status:", error)
      set({ error: error instanceof Error ? error.message : "Failed to update transaction status" })
    } finally {
      set({ isLoading: false })
    }
  },

updateTransaction: (txn: Transaction) => {
  // if (txn.txnType === "DEPOSIT") {
  //   const existing = get().deposits.filter(t => t.id !== txn.id)
  //   set({ deposits: [...existing, txn] })
  // } else if (txn.txnType === "WITHDRAWAL") {
  //   const existing = get().withdrawals.filter(t => t.id !== txn.id)
  //   set({ withdrawals: [...existing, txn] }) 
  // }
},

// SYSTEM CONFIGS
getSystemConfigs: async (agentId: number) => {
  set({ sysConfigLoading: true, error: null })

  const { user, initData } = userStore.getState()
  const role = user?.role

  try {
    const response = await fetch(`/${i18n.language}/api/admin/system-configs?agentId=${agentId}`, {
      headers: {
        "x-user-role": role || "",
        "x-init-data": initData || "",
      },
      cache: "no-store",
    })

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
    }

    const result = await response.json()

    if (result.success) {
      // alert("Fetched system configs: " + JSON.stringify(result.data))
      set({ systemConfigs: result.data })
    } else {
      set({ error: result.error || "Failed to fetch system configs" })
    }
  } catch (err) {
    console.error("Error fetching system configs:", err)
    set({ error: "Error fetching system configs" })
  } finally {
    set({ sysConfigLoading: false })
  }
 },

updateSystemConfig: async (id: number, value: string) => {
    set({ sysConfigLoading: true, error: null })

    const { user, initData } = userStore.getState()
    const role = user?.role
    const configAgentId = get().systemConfigs.find((c) => c.id === id)?.agentId

    try {
      const response = await fetch(`/${i18n.language}/api/admin/system-configs/${id}${configAgentId ? `?agentId=${configAgentId}` : ""}`, {
        method: "PUT",
        headers: {
          "x-user-role": role || "",
          // "x-init-data": initData || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        const updatedConfigs = get().systemConfigs.map(config =>
          config.id === id ? result.data : config
        )
        set({ systemConfigs: updatedConfigs, error: null })
      } else {
        set({ error: result.error || "Failed to update system config" })
      }
    } catch (err) {
      console.error("Error updating system config:", err)
      set({ error: "Error updating system config" })
    } finally {
      set({ sysConfigLoading: false })
    }
  },


resetSystemConfigs: async () => {
  // Set system configs to empty array
  set({systemConfigs: []})
},


}))
