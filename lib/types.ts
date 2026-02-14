// export interface PaymentInitiateRequest {
//    uuid: string
//    phoneNumber: String
//    encryptedTotalAmount: number
//    merchantName: string
//    selectedService: string
//    selectedBank: string
// }



// ---------- Types ----------
export interface ProviderPaymentMethod {
  name: string;
  fee: number;
  photo: string;
  service: string;
  catagory: string;
  order: number;
  institution_bic?: string;
}

export interface CheckData {
  merchant_name: string;
  uncomissioned_amount: number;
  total_amount: number;
  is_commissioned: boolean;
  merchant_id: string;
  status: boolean;
  cancel_url: string;
  msg: string;
  is_phone_restricted: boolean;
  default_lang: string;
  phone_number: string;
  payment_methods: ProviderPaymentMethod[];
  bank: ProviderPaymentMethod[];
  HasMerchantAccount: boolean;
  escrow_enabled: boolean;
  addispay_transaction_id: string;
  redirect_url: string;
  order_reason: string;
  commission: string;
  [key: string]: any;
}


 export interface CheckoutData {
    uuid: string,
    phoneNumber: string,
    encryptedTotalAmount: number,
    merchantName: string,
    selectedService: string,
    selectedBank: string,
};

export interface CheckoutResponse {
   message?: string
   details?: string
   status?: number
   data?: string
}

export interface PaymentOrderData {
  orderId: number;
  txnRef: string;
  status: string;
  amount: number;
  providerUuid: string;
  checkoutUrl: string;
  instructionsUrl?: string | null;
  paymentMethodId?: number
  checkData: {
    message: string;
    details: string;
    status_code: number;
    data: CheckData;
    commission: string;
  };
}



export interface UserProfile {
  id: number;
  telegramId: number;
  agentId: number;
  firstName: string;
  lastName: string;
  nickname: string,
  phoneNumber?: string | null;
  status: 'ACTIVE' | 'BANNED';
  role: 'ADMIN' | 'PLAYER' | 'MODERATOR' | 'AGENT';
  is_bot: boolean;
  hasPassword: boolean;
  createdAt: string;
  updatedAt: string;
}

// export type ApiResponse<T> = {
//   success: boolean;
//   statusCode: number;
//   message?: string;
//   error?: string;
//   errors?: Record<string, string>;
//   path?: string;
//   data?: T;
//   timestamp?: string;
// };



export type TransactionType = "DEPOSIT" | "WITHDRAWAL" | "REFUND" | "PROMOTIONAL_BONUS" | "WELCOME_BONUS" | "REFERRAL_BONUS";
export type TransactionStatus = "PENDING" | "AWAITING_APPROVAL" | "COMPLETED" | "FAILED" | "CANCELLED" | "REJECTED";

// export interface Transaction {
//   id: number;
//   userProfileId: number;
//   transferTo?: number | null;
//   paymentMethodId: number;
//   txnType: TransactionType;
//   txnAmount: number;
//   status: TransactionStatus;
//   description?: string;
//   createdAt: string
// }

export interface Transaction {
  id: number;
  playerId: number;
  agentId: number;
  txnRef: string;
  paymentMethodId: number;
  txnType: TransactionType;
  txnAmount: number;
  status: TransactionStatus;
  description?: string | null;
  metaData?: Record<string, any> | null;
  approvedBy?: number | null;
  approvedAt?: Date | null;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}


export enum PaymentOrderStatus {
  PENDING = "PENDING",
  INITIATED = "INITIATED",
  AWAITING_APPROVAL = "AWAITING_APPROVAL",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
  REJECTED = "REJECTED",
}

// export enum TransactionType {
//   DEPOSIT = "DEPOSIT",
//   WITHDRAWAL = "WITHDRAWAL",
// }

export interface PaymentMethodMinimal {
  id: number,
  code: string,
  name: string,
  description: string
}


export interface PaymentOrder {
  id: number;
  userId: number;
  agentId: number;
  txnRef: string;
  phoneNumber?: string;
  providerOrderRef?: string | null; // null if offline
  amount: string; // BigDecimal -> string to preserve precision
  currency: string;
  status: PaymentOrderStatus;
  reason?: string;
  paymentMethodId: number;
  instructionsUrl?: string | null;
  txnType: TransactionType;
  nonce: string;
  metaData?: string | null;
  approvedBy?: number | null;
  createdAt?: string; // Instant -> ISO string
  updatedAt?: string; // Instant -> ISO string

  userProfile?: UserProfile;
  wallet?: WalletBalance;
  paymentMethod: PaymentMethodMinimal
}


export enum GameTransactionType {
    GAME_FEE = 'GAME_FEE',
    PRIZE_PAYOUT = 'PRIZE_PAYOUT',
    REFUND = 'REFUND',
    DISPUTE = 'DISPUTE'
}

export enum GameTransactionStatus {
    PENDING = 'PENDING',
    SUCCESS = 'SUCCESS',
    FAIL = 'FAIL',
    AWAITING_APPROVAL = 'AWAITING_APPROVAL',
    CANCELLED = 'CANCELLED'
}

export interface GameTransaction {
    id: number;
    gameId: number;
    agentId: number;
    playerId: number;
    txnAmount: number; // or string if you want to store precise decimals
    txnType: GameTransactionType;
    txnStatus: GameTransactionStatus;
    createdAt: string; // ISO timestamp
    updatedAt: string; // ISO timestamp
}


export interface PaymentMethod {
  id: number;
  name: string;
  description?: string;
  isDefault: boolean;
  isOnline: boolean;
  isMobileMoney: boolean
  instructionUrl: string;
  logoUrl: string;
  code: string
}

export interface WalletBalance {
  id: number;
  userProfileId: number;
  // totalDeposit: number;
  depositBalance: number;
  pendingBalance: number;
  welcomeBonus: number;
  availableWelcomeBonus: number;
  referralBonus: number;
  availableReferralBonus: number;
  totalPrizeAmount: number;
  pendingWithdrawal: number;
  // totalWithdrawal: number;
  totalAvailableBalance: number;
  availableToWithdraw: number;
  lockedAmount: number;
  depositBonus: number;
  promotionalBonus: number;
  lastPaymentFrom?: string | null;
  agentId: number;
}

export interface DepositRequest {
  amount: number
  paymentMethodId: string
}

export interface WithdrawalRequest {
  amount: number
  paymentMethodId: string
}

export interface PaymentProcessingResult {
  success: boolean
  transactionId?: string
  error?: string
  requiresVerification?: boolean
}


// Core game types
export enum BingoColumn {
  B = "B",
  I = "I",
  N = "N",
  G = "G",
  O = "O",
}

export interface CardInfo {
  cardId: string;
  numbers: Partial<Record<BingoColumn, number[]>>;
  marked: number[];
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "BANNED",
  // add other statuses as needed
}

export enum UserRole {
  PLAYER = "PLAYER",
  MODERATOR = "MODERATOR",
  ADMIN = "ADMIN",
  AGENT = "AGENT",
  // add other roles as needed
}


export enum GameStatus {
  READY = "READY",
  COUNTDOWN = "COUNTDOWN",
  PLAYING = "PLAYING",
  COMPLETED = "COMPLETED",
  CANCELLED_ADMIN = "CANCELLED_ADMIN",
  CANCELLED_NO_MIN_PLAYERS = "CANCELLED_NO_MIN_PLAYERS",
}

export enum GamePattern {
  LINE = "LINE",
  LINE_AND_CORNERS = "LINE_AND_CORNERS",
  CORNERS = "CORNERS",
  FULL_HOUSE = "FULL_HOUSE",
}

export enum RoomStatus {
  OPEN = "OPEN",
  CLOSED = "CLOSED",
}

export interface GameWinner {
  gameId: number
  playerId: number
  playerName: string
  cardId: string
  pattern: GamePattern
  prizeAmount: number
  winAt: string
  hasWinner: boolean
  markedNumbers?: number[]
  card?: CardInfo
}

export interface GameState { 
  gameId: number;
  roomId: number;
  agentId: number;

  // Players in the game
  joinedPlayers: string[];

  // Total number of players in the game
  playersCount: number;

  // Numbers that have been drawn in the game (order matters)
  drawnNumbers: number[];

  // The most recently drawn number
  currentDrawnNumber?: number;

  // Selected cards by players
  allSelectedCardsIds: string[]; 

  // User selected card IDs
  userSelectedCardsIds: string[];

  // Marked numbers go here
  userSelectedCards: CardInfo[];

  // All card IDs in the game (for reference)
  // allCardIds: string[];

  // Game status flags
  started: boolean;
  ended: boolean;
  status: GameStatus;

  // Countdown timer in seconds (if applicable)
  // serverTime: string;
  countdownEndTime: string;
  countdownDurationSeconds: number;
  backendEpochMillis: number;

  // Stop flag for number drawing
  stopNumberDrawing: boolean;
  loading: boolean

}


export interface PlayerState {
  userProfileId: number;

  // Map of cardId -> CardInfo
  cards: Record<string, CardInfo>;
}

export interface ClaimError {
  [key: string]: any
}


export interface Wallet {
  id: number;
  userProfileId: number;
  agentId: number;

  totalDeposit: number;
  depositBalance: number;
  pendingBalance: number;
  welcomeBonus: number;
  availableWelcomeBonus: number;
  referralBonus: number;
  availableReferralBonus: number;
  totalPrizeAmount: number;
  pendingWithdrawal: number;
  totalWithdrawal: number;
  totalAvailableBalance: number;
  availableToWithdraw: number;

  createdAt: string; // ISO string from Instant
  updatedAt: string; // ISO string from Instant
}

export interface UserProfileDto {
  id: number;
  supabaseId: string; // UUID as string
  firstName: string;
  lastName: string;
  nickName?: string;
  email: string;
  phone?: string;
  dateOfBirth?: string; // LocalDate -> ISO string (YYYY-MM-DD)
  status: UserStatus;
  role: UserRole;
  dailyFreePlayCount?: number;
  wallet?: Wallet;
  createdAt: string; // LocalDateTime -> ISO string
  updatedAt: string; // LocalDateTime -> ISO string
}


export interface Room {
  id: number;
  agentId: number;
  name: string;
  capacity: number;
  minPlayers: number;
  entryFee: number; // BigDecimal → number
  pattern: GamePattern;
  status: RoomStatus;
  cardPool: CardInfo[] | [];
  allCardIds: string[] | []
  isForPractice?: boolean;
  botsEnabled?: boolean;
  maxBots?: number;
  minBots?: number;
  commissionRate: number;
}


// ============ WebSocket event types ======================
export interface WSMessage {
  type: string
  payload: any
}

export type WSPayload = WSMessage["payload"]

export interface PlayerJoinRequest extends WSMessage {
  type: "game.playerJoinRequest"
  payload: {
    gameId: number
    playerId: number
  }
}

export interface PlayerJoinResponse extends WSMessage {
  type: "game.playerJoinResponse"
  payload: {
    success: boolean
    error: string | null
    gameId: number
    playerId: number | null
  }
}


export interface PlayerJoined extends WSMessage {
  type: "game.playerJoined"
  payload: {
    gameId: number
    playerId: string
    playersCount: number
    joinedPlayers: string[]
    playerSelectedCardIds: string[]
  }
}


export interface NotEnoughPlayers extends WSMessage {
  type: "game.notEnoughPlayers"
  payload: {
    gameId: number
    roomId: number
    playersCount: number
    status: string
    joinedPlayers: string[]
  }
}


export interface PlayerLeaveRequest extends WSMessage {
  type: "game.playerLeaveRequest"
  payload: {
    gameId: number
    playerId: string
  }
}

export interface PlayerLeaveResponse extends WSMessage {
  type: "game.playerLeaveResponse"
  payload: {
    success: boolean
    error: string | null
    gameId: number
    playerId: string
  }
}


export interface PlayerLeft extends WSMessage {
  type: "game.playerLeft"
  payload: {
    gameId: number
    gameState?: GameState
    playerId: string
    playersCount: number
    joinedPlayers: string[]
    releasedCardsIds?: string[]
    roomId: number
    errorType?: string
  }
}


export interface RoomEnter extends WSMessage {
  type: "room.enter"
  payload: {
    roomId: number
    playerId: number
  }
}


export interface RoomLeave extends WSMessage {
  type: "room.leave"
  payload: {
    roomId: number
    playerId: number
  }
}

export interface ServerGameState extends WSMessage {
  type: "room.serverGameState"
  payload: {
    success: boolean
    error: string
    gameState: GameState | null,
    roomId: number
  }
}


export interface GameStateAfterPlayerLeave extends WSMessage {
  type: "game.state"
  payload: {
    gameState: GameState | null,
    roomId: number
  }
}


export interface GameInitialized extends WSMessage {
  type: "game.initialized"
  payload: {
    gameState: GameState
  }
}

export interface CardSelectRequest extends WSMessage {
  type: "game.cardSelectRequest"
  payload: {
    gameId: string
    playerId: string
    cardId: string
  }
}


export interface CardSelectResponse extends WSMessage {
  type: "game.cardSelectResponse"
  payload: {
    gameId: string
    playerId: string
    cardId: string
  }
}

export interface CardSelected extends WSMessage {
  type: "game.cardSelected"
  payload: {
    gameId: string
    playerId: number
    cardId: string
  }
}


export interface CardReleaseRequest extends WSMessage {
  type: "game.cardReleaseRequest"
  payload: {
    gameId: string
    playerId: string
    cardId: string
  }
}

export interface CardReleaseResponse extends WSMessage {
  type: "game.cardReleaseResponse"
  payload: {
    gameId: string
    playerId: string
    cardId: string
  }
}

export interface CardReleased extends WSMessage {
  type: "game.cardReleased"
  payload: {
    gameId: string
    playerId: string
    cardId: string
  }
}


export interface MarkNumberRequest extends WSMessage {
  type: "card.markNumberRequest"
  payload: {
    gameId: string
    playerId: string
    cardId: string
    number: number
  }
}


export interface MarkNumberResponse extends WSMessage {
  type: "card.markNumberResponse"
  payload: {
    gameId?: string
    playerId?: string
    cardId: string
    numbers: number[]
  }
}


export interface UnmarkNumberRequest extends WSMessage {
  type: "card.unmarkNumberRequest"
  payload: {
    gameId: string
    playerId: string
    cardId: string
    number: number
  }
}

export interface UnmarkNumberResponse extends WSMessage {
  type: "card.unmarkNumberResponse"
  payload: {
    gameId?: number
    playerId?: number
    cardId: string
    numbers: number[]
  }
}


export interface GameStarted extends WSMessage {
  type: "game.started"
  payload: {
    message: string
    roomId: number
    gameId: number
  }
}

export interface NumberDrawn extends WSMessage {
  type: "game.numberDrawn"
  payload: {
    gameId: number
    number: number
    roomId: number
    column?: BingoColumn
  }
}


export interface BingoClaimRequestPayloadType {
  gameId: number
  cardId: string
  pattern: GamePattern
  playerId: string
  userProfileId?: number,
  playerName: string
  markedNumbers: number[]
  card: CardInfo
}

export interface BingoClaimRequest extends WSMessage {
  type: "game.bingoClaimRequest"
  payload: BingoClaimRequestPayloadType
}


export interface BingoClaimResponse extends WSMessage {
  type: "game.bingoClaimResponse"
  payload: {
    success: boolean
    error: string | null
    playerId: number
    cardId: number
    pattern: GamePattern
    markedNumbers: number[]
  }
}

export interface WinnerDeclared extends WSMessage {
  type: "game.winnerDeclared"
  payload: {
    winner: GameWinner
    endedAt: string
  }
}

export interface Countdown extends WSMessage {
  type: "game.countdown"
  payload: {
    roomId: number
    gameId: number
    seconds: number,
    countdownEndTime: string
  }
}


export interface GameEnded extends WSMessage {
  type: "game.ended"
  payload: GameWinner
}


export interface ErrorMessage extends WSMessage {
  type: "error"
  payload: {
    code?: number
    message: string
    eventType?: string
    errorType?: string
  }
}


export interface PongMessage extends WSMessage {
  type: "pong"
  payload: any
}

export interface PingMessage extends WSMessage {
  type: "ping"
  payload: any
}



export type WSRequestEvent = 
  | PlayerJoinRequest
  | PlayerLeaveRequest
  | RoomEnter
  | CardSelectRequest
  | CardReleaseRequest
  | MarkNumberRequest
  | UnmarkNumberRequest
  | BingoClaimRequest
  | RoomLeave

export type WSResponseEvent = 
  | PlayerJoinResponse
  | PlayerLeaveResponse
  | ServerGameState
  | GameInitialized
  | CardSelectResponse
  | CardReleaseResponse
  | MarkNumberResponse
  | UnmarkNumberResponse
  | BingoClaimResponse
  | ErrorMessage
  | GameStarted
  | PlayerJoined
  | PlayerLeft
  | CardSelected
  | CardReleased
  | NumberDrawn
  | WinnerDeclared
  | Countdown
  | GameEnded
  | GameStateAfterPlayerLeave
  | NotEnoughPlayers


export type WSEvent = WSRequestEvent | WSResponseEvent | PongMessage | PingMessage




// ========================OLD TYPES========================
// export interface BingoCard {
//   id: string
//   numbers: number[][]
//   marked: boolean[][]
// }

// export interface Room {
//   id: string
//   name: string
//   fee: number
//   players: number
//   capacity: number
//   status: "open" | "in-game" | "starting"
//   nextStartAt?: string
//   pattern?: BingoPattern
// }

// export interface Player {
//   id: string
//   name: string
//   balance: number
//   cards: BingoCard[]
// }

// export interface GameState {
//   id: string
//   roomId: string
//   status: "waiting" | "active" | "finished"
//   pattern: BingoPattern
//   calledNumbers: number[]
//   currentNumber?: number
//   winners: Winner[]
//   startedAt?: string
//   endsAt?: string
// }

// export interface Winner {
//   playerId: string
//   playerName: string
//   cardId: number
//   pattern: BingoPattern
//   prizeAmount: number
//   winTime: string
// }

// export type BingoPattern = "line" | "four-corners" | "full-house" | "x-pattern"

// // WebSocket event types
// export interface WSMessage {
//   type: string
//   payload: any
//   timestamp: string
// }

// export interface RoomSnapshot extends WSMessage {
//   type: "room.snapshot"
//   payload: {
//     room: Room
//     players: Player[]
//     game?: GameState
//   }
// }

// export interface PlayerJoined extends WSMessage {
//   type: "room.playerJoined"
//   payload: {
//     player: Player
//   }
// }

// export interface PlayerLeft extends WSMessage {
//   type: "room.playerLeft"
//   payload: {
//     playerId: string
//   }
// }

// export interface GameStarted extends WSMessage {
//   type: "game.started"
//   payload: {
//     game: GameState
//   }
// }

// export interface NumberCalled extends WSMessage {
//   type: "game.numberCalled"
//   payload: {
//     number: number
//     index: number
//     calledAt: string
//   }
// }

// export interface BingoClaimed extends WSMessage {
//   type: "game.bingoClaimed"
//   payload: {
//     playerId: string
//     cardId: number
//     pattern: BingoPattern
//     status: "pending" | "verified" | "rejected"
//   }
// }

// export interface WinnerDeclared extends WSMessage {
//   type: "game.winnerDeclared"
//   payload: {
//     winners: Winner[]
//     endedAt: string
//   }
// }

// export interface NextCountdown extends WSMessage {
//   type: "game.nextCountdown"
//   payload: {
//     secondsRemaining: number
//   }
// }

// export interface CardsAssigned extends WSMessage {
//   type: "cards.assigned"
//   payload: {
//     cards: BingoCard[]
//   }
// }

export interface PaymentUpdated extends WSMessage {
  type: "payments.updated"
  payload: {
    balance: number
    transaction?: {
      id: string
      amount: number
      type: "charge" | "payout"
      status: "pending" | "completed" | "failed"
    }
  }
}

// export type WSEvent =
//   | RoomSnapshot
//   | PlayerJoined
//   | PlayerLeft
//   | GameStarted
//   | NumberCalled
//   | BingoClaimed
//   | WinnerDeclared
//   | NextCountdown
//   | CardsAssigned
//   | PaymentUpdated

// API types
export interface CreateRoomRequest {
  name: string
  fee: number
  capacity: number
}

export interface JoinRoomRequest {
  roomId: string
  cardIds: number[]
}

export interface ChargeRequest {
  amount: number
  roomId: string
  cardIds: number[]
}

export interface UserProfileMinimal {
  id: number;
  telegramId: number;
  firstName: string;
  lastName: string;
  nickname: string;
  phoneNumber: string;
  isBot: boolean;
}

export interface DailyLeaderboard {
  // id: number;
  // userId: number;
  // dailyGamesPlayed: number;
  // dailyWins: number;
  // dailyPrize: string; 
  // dailyBets: string;  
  // dailyDeposit: string; 
  // leaderboardDate: string; 
  // userProfile: UserProfileMinimal;
  // isBot: boolean | null;
  // createdAt: string; 
  // updatedAt: string; 

   id: number;
    userId: number;
    userProfile: UserProfileMinimal;
    leaderboardDate: string;
    dailyGamesPlayed: number;
    dailyWins: number;
    dailyPrize: string;
    dailyBets: string;
    dailyDeposit: string;
    dailyWithdrawal: string;
    isBot: boolean | null;
    agentId: number;
    createdAt: string;
    updatedAt: string;
}

export interface TotalLeaderboard {
  // id: number;
  // userId: number;
  // totalGamesPlayed: number;
  // totalWins: number;
  // totalPrize: string;
  // totalBets: string; 
  // totalDeposit: string;
  // userProfile: UserProfileMinimal;
  // isBot: boolean | null;
  // createdAt: string;
  // updatedAt: string;


  id: number;
  userId: number;
  userProfile: UserProfileMinimal;
  totalGamesPlayed: number;
  totalWins: number;
  totalPrize: string;
  totalBets: string;
  totalDeposit: string;
  totalWithdrawal: string;
  isBot: boolean | null;
  agentId: number;
  createdAt: string;
  updatedAt: string;
}


export interface WalletDetails {
  id: number;
  userProfileId: number;
  agentId: number;

  welcomeBonus: number;                 
  availableWelcomeBonus: number;

  referralBonus: number;
  availableReferralBonus: number;

  totalPrizeAmount: number;
  pendingWithdrawal: number;

  totalAvailableBalance: number;
  availableToWithdraw: number;

  lockedAmount: number;
  depositBonus: number;
  promotionalBonus: number;

  lastPaymentFrom: string | null;

  userProfile: UserProfileMinimal;
}



export type BankDetailsProps = {
  data: {
    phoneNumber?: string
    accountName?: string
    bankName?: string
    accountNumber?: string
  }
}


export interface SystemConfig {
  id: number;
  agentId: number;
  name: string;
  value: string;
  possibleValues?: string;
}

export interface GoldenEggsTotalAccounting {
  agentId: number;
  totalBetsCount: number;
  totalBetsAmount: number;
  totalWinsAmount: number;
  totalLossAmount: number;
  totalNetProfitAmount: number;
  totalRollbackCount: number;
  totalRollbackAmount: number;
}

export interface GoldenEggsDailyAccounting {
  id: number;
  agentId: number;
  accountingDate: string;
  dailyBetsCount: number;
  dailyBetsAmount: number;
  dailyWinsAmount: number;
  dailyLossAmount: number;
  dailyNetProfitAmount: number;
  dailyRollbackCount: number;
  dailyRollbackAmount: number;
  isSettled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AgentGameResponse {
  id: number;
  agentId: number;
  gameCategory: string;
  gameTypes: string[];
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAgentGameRequest {
  agentId: number;
  gameCategory: string;
  gameTypes: string[];
  isEnabled?: boolean;
}

export interface AgentGameSettingDto {
  id: number;
  agentId: number;
  gameModes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateAgentGameModesRequest {
  agentId: number;
  gameModes: string[];
}
