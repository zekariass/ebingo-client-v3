export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string | null
  status?: number
  statusCode?: number
  message?: string
}

export interface GamePlayer {
  playerId: string
  name: string
  cards: BingoCard[]
  markedNumbers: Record<string, number[]> // cardId -> marked numbers
  isReady: boolean
  joinedAt: string
}

export interface GameRoom {
  id: string
  name: string
  fee: number
  capacity: number
  status: "open" | "starting" | "in-game" | "finished"
  players: GamePlayer[]
  availableCards: BingoCard[]
  game?: GameSession
  createdAt: string
  nextStartAt?: string
}

export interface GameSession {
  gameId: string
  roomId: string
  status: "waiting" | "active" | "finished"
  calledNumbers: number[]
  winners: GameWinner[]
  startedAt: string
  endedAt?: string
  currentNumber?: number
  totalPrize: number
}

export interface GameWinner {
  playerId: string
  cardId: string
  pattern: string
  prize: number
  claimedAt: string
}

export interface BingoCard {
  id: string
  numbers: number[][]
  marked: boolean[][]
}

export interface WebSocketMessage {
  type: string
  payload: any
  timestamp: string
}

export interface RoomSnapshot {
  room: GameRoom
  game?: GameSession
  playerCount: number
  isJoined: boolean
  userCards: BingoCard[]
}
