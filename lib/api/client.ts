import type {
  Room,
  CreateRoomRequest,
  JoinRoomRequest,
  ChargeRequest,
  BingoClaimRequest,
  BingoCard,
  User,
  Transaction,
  GameState,
} from "@/lib/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string | null
}

class ApiClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`

    console.log("========================= URLLLLLL: "+ url)

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        // TODO: Add authorization header when auth is implemented
        // 'Authorization': `Bearer ${getAccessToken()}`
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    const apiResponse: ApiResponse<T> = await response.json()

    if (!apiResponse.success) {
      throw new Error(apiResponse.error || "API request failed")
    }

    return apiResponse.data as T
  }

  // Authentication endpoints
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    return this.request<{ user: User; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  async register(email: string, password: string, name: string): Promise<{ user: User; token: string }> {
    return this.request<{ user: User; token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    })
  }

  async logout(): Promise<void> {
    return this.request<void>("/auth/logout", {
      method: "POST",
    })
  }

  async refreshToken(): Promise<{ token: string }> {
    return this.request<{ token: string }>("/auth/refresh", {
      method: "POST",
    })
  }

  // User endpoints
  async getProfile(): Promise<User> {
    return this.request<User>("/users/profile")
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    return this.request<User>("/users/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async getUserBalance(): Promise<{ balance: number }> {
    return this.request<{ balance: number }>("/users/balance")
  }

  async getnHistory(page = 1, limit = 20): Promise<{ transactions: Transaction[]; total: number }> {
    return this.request<{ transactions: Transaction[]; total: number }>(
      `/users/transactions?page=${page}&limit=${limit}`,
    )
  }

  // Room endpoints
  async getRooms(): Promise<Room[]> {
    return this.request<Room[]>("/rooms")
  }

  async getRoom(roomId: string): Promise<Room> {
    return this.request<Room>(`/rooms/${roomId}`)
  }

  async createRoom(data: CreateRoomRequest): Promise<Room> {
    return this.request<Room>("/rooms", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // async joinRoom(data: JoinRoomRequest): Promise<void> {
  //   return this.request<void>(`/rooms/${data.roomId}/join`, {
  //     method: "POST",
  //     body: JSON.stringify({ cardIds: data.cardIds }),
  //   })
  // }

  // Room management endpoints
  // async leaveRoom(roomId: string): Promise<void> {
  //   return this.request<void>(`/rooms/${roomId}/leave`, {
  //     method: "POST",
  //   })
  // }

  async getRoomPlayers(roomId: string): Promise<{ players: User[] }> {
    return this.request<{ players: User[] }>(`/rooms/${roomId}/players`)
  }

  async getRoomCards(roomId: string): Promise<{ cards: BingoCard[] }> {
    return this.request<{ cards: BingoCard[] }>(`/rooms/${roomId}/cards`)
  }

  // Game endpoints
  async getGameState(roomId: string): Promise<GameState> {
    return this.request<GameState>(`/game/${roomId}/state`)
  }

  // async startGame(
  //   roomId: number,
  //   gameData?: { userBalance: number; selectedCards: any[]; totalCost: number },
  // ): Promise<{ success: boolean; gameId: string; newBalance?: number }> {
  //   return this.request<{ success: boolean; gameId: string; newBalance?: number }>(`/game/${roomId}/start`, {
  //     method: "POST",
  //     body: gameData ? JSON.stringify(gameData) : undefined,
  //   })
  // }

  // async endGame(roomId: string): Promise<{ success: boolean; winners: string[] }> {
  //   return this.request<{ success: boolean; winners: string[] }>(`/game/${roomId}/end`, {
  //     method: "POST",
  //   })
  // }

  // async callNumber(roomId: string): Promise<{ number: number; letter: string }> {
  //   return this.request<{ number: number; letter: string }>(`/game/${roomId}/call`, {
  //     method: "POST",
  //   })
  // }

  // async markCard(roomId: string, cardId: string, position: string): Promise<{ success: boolean }> {
  //   return this.request<{ success: boolean }>(`/game/${roomId}/cards/${cardId}/mark`, {
  //     method: "POST",
  //     body: JSON.stringify({ position }),
  //   })
  // }

  // async claimBingo(data: BingoClaimRequest): Promise<{ success: boolean; verified: boolean; prize?: number }> {
  //   return this.request<{ success: boolean; verified: boolean; prize?: number }>("/game/bingo", {
  //     method: "POST",
  //     body: JSON.stringify(data),
  //   })
  // }

  // async verifyBingo(roomId: string, cardId: string, pattern: string): Promise<{ valid: boolean; pattern: string }> {
  //   return this.request<{ valid: boolean; pattern: string }>(`/game/${roomId}/verify`, {
  //     method: "POST",
  //     body: JSON.stringify({ cardId, pattern }),
  //   })
  // }

  // Payment endpoints
  async chargePayment(data: ChargeRequest): Promise<{ success: boolean; transactionId: string }> {
    return this.request<{ success: boolean; transactionId: string }>("/payments/charge", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async deposit(amount: number, paymentMethod: string): Promise<{ success: boolean; transactionId: string }> {
    return this.request<{ success: boolean; transactionId: string }>("/payments/deposit", {
      method: "POST",
      body: JSON.stringify({ amount, paymentMethod }),
    })
  }

  async withdraw(amount: number, withdrawalMethod: string): Promise<{ success: boolean; transactionId: string }> {
    return this.request<{ success: boolean; transactionId: string }>("/payments/withdraw", {
      method: "POST",
      body: JSON.stringify({ amount, withdrawalMethod }),
    })
  }

  async getPaymentMethods(): Promise<{ methods: string[] }> {
    return this.request<{ methods: string[] }>("/payments/methods")
  }

  async processGamePayment(roomId: string, amount: number): Promise<{ success: boolean; transactionId: string }> {
    return this.request<{ success: boolean; transactionId: string }>("/payments/game", {
      method: "POST",
      body: JSON.stringify({ roomId, amount }),
    })
  }

  async distributePrize(roomId: string, winnerId: string, amount: number): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>("/payments/prize", {
      method: "POST",
      body: JSON.stringify({ roomId, winnerId, amount }),
    })
  }

  // Admin endpoints
  async getAdminStats(): Promise<{
    totalRooms: number
    activeGames: number
    totalPlayers: number
    revenue: number
  }> {
    return this.request<{
      totalRooms: number
      activeGames: number
      totalPlayers: number
      revenue: number
    }>("/admin/stats")
  }

  async getAllRooms(): Promise<Room[]> {
    return this.request<Room[]>("/admin/rooms")
  }

  async updateRoom(roomId: string, data: Partial<Room>): Promise<Room> {
    return this.request<Room>(`/admin/rooms/${roomId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deleteRoom(roomId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/admin/rooms/${roomId}`, {
      method: "DELETE",
    })
  }

  async getAllUsers(): Promise<User[]> {
    return this.request<User[]>("/admin/users")
  }

  async banUser(userId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/admin/users/${userId}/ban`, {
      method: "POST",
    })
  }

  async getGameHistory(
    page = 1,
    limit = 20,
  ): Promise<{
    games: Array<{
      id: string
      roomId: string
      startTime: string
      endTime: string
      winners: string[]
      totalPrize: number
    }>
    total: number
  }> {
    return this.request<{
      games: Array<{
        id: string
        roomId: string
        startTime: string
        endTime: string
        winners: string[]
        totalPrize: number
      }>
      total: number
    }>(`/admin/games?page=${page}&limit=${limit}`)
  }

  // WebSocket endpoints
  getWebSocketUrl(roomId: string): string {
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:"
    const wsHost = process.env.NEXT_PUBLIC_WS_URL || `${wsProtocol}//${window.location.host}/ws`
    return `${wsHost}/rooms/${roomId}`
  }
}

export const apiClient = new ApiClient()
