export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// WebSocket Event Types
export interface WebSocketEvent {
  type: string
  data: any
  timestamp: string
}

export interface NumberCalledEvent extends WebSocketEvent {
  type: "number_called"
  data: {
    number: number
    letter: string
    calledNumbers: number[]
  }
}

export interface BingoClaimedEvent extends WebSocketEvent {
  type: "bingo_claimed"
  data: {
    playerId: string
    cardId: string
    pattern: string
    verified: boolean
  }
}

export interface GameStartedEvent extends WebSocketEvent {
  type: "game_started"
  data: {
    gameId: string
    startTime: string
  }
}

export interface GameEndedEvent extends WebSocketEvent {
  type: "game_ended"
  data: {
    gameId: string
    winners: string[]
    prizes: Record<string, number>
  }
}

export interface PlayerJoinedEvent extends WebSocketEvent {
  type: "player_joined"
  data: {
    playerId: string
    playerName: string
    cardIds: string[]
  }
}

export interface PlayerLeftEvent extends WebSocketEvent {
  type: "player_left"
  data: {
    playerId: string
  }
}

export interface RoomUpdatedEvent extends WebSocketEvent {
  type: "room_updated"
  data: {
    room: any // Placeholder for Room type, please define it appropriately
  }
}

export type GameWebSocketEvent =
  | NumberCalledEvent
  | BingoClaimedEvent
  | GameStartedEvent
  | GameEndedEvent
  | PlayerJoinedEvent
  | PlayerLeftEvent
  | RoomUpdatedEvent
