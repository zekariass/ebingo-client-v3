import { z } from "zod"

// Room management schema
export const roomSchema = z.object({
  // agentId: z.number(),
  name: z.string().min(1, "Room name is required").max(50, "Room name must be less than 50 characters"),
  entryFee: z.number().min(0, "Fee must be positive").max(1000, "Fee cannot exceed $1000"),
  capacity: z.number().min(1, "Capacity must be at least 1"),
  minPlayers: z.number().min(1, "There must be at least 1 player to play the game."),
  pattern: z.enum(["LINE", "LINE_AND_CORNERS", "CORNERS", "FULL_HOUSE"], {
    errorMap: () => ({ message: "Please select a valid winning pattern" }),
  }),
  status: z.enum(["OPEN", "CLOSED"], {
    errorMap: () => ({ message: "Please select a valid room status" }),
  }),
  botAllowed: z.boolean().optional(),
  minBots: z.number().min(0, "Minimum bots cannot be negative").optional(),
  maxBots: z.number().min(0, "Maximum bots cannot be negative").optional(),
  maxCards: z.number().min(1, "Maximum cards cannot be less than 1").max(2, "Maximum cards cannot exceed 2").optional(),
  minDraws: z.number().min(1, "Minimum draws cannot be less than 5").max(75, "Minimum draws cannot exceed 75").optional(),
  maxDraws: z.number().min(1, "Maximum draws cannot be less than 5").max(75, "Maximum draws cannot exceed 75").optional(),
  fakeWinEnabled: z.boolean().optional(),
  commissionRate: z.number().min(0, "Commission rate cannot be negative").max(1, "Commission rate cannot exceed 1").optional(),
})

// Manual number calling schema
export const numberCallSchema = z.object({
  number: z.number().min(1, "Number must be between 1 and 75").max(75, "Number must be between 1 and 75"),
})

// Player search schema
export const playerSearchSchema = z.object({
  searchTerm: z.string().optional(),
})

// Bot user name pool entry
export const botUserNameSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  nickname: z.string().optional(),
})

// Bulk bot user creation schema (POST /api/v1/admin/bot-users)
export const botUsersSchema = z.object({
  startId: z
    .number({ invalid_type_error: "Start ID is required" })
    .int("Start ID must be a whole number")
    .positive("Start ID must be greater than 0"),
  startPhone: z
    .number({ invalid_type_error: "Start phone is required" })
    .int("Start phone must be a whole number")
    .positive("Start phone must be greater than 0"),
  botRoomId: z
    .number({ invalid_type_error: "Bot room ID is required" })
    .int("Bot room ID must be a whole number")
    .positive("Bot room ID must be greater than 0"),
  agentId: z
    .number({ invalid_type_error: "Agent is required" })
    .int("Agent ID must be a whole number")
    .positive("Agent is required"),
  count: z
    .number({ invalid_type_error: "Count is required" })
    .int("Count must be a whole number")
    .min(1, "Count must be at least 1")
    .max(500, "Count must not exceed 500"),
  initialBalance: z.number().min(0, "Initial balance cannot be negative").optional(),
  names: z.array(botUserNameSchema).optional(),
})

// Agent creation schema (POST /api/v1/admin/agents)
export const agentCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Agent code is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  contactName: z.string().optional(),
  contactAddress: z.string().optional(),
  commissionRate: z
    .number({ invalid_type_error: "Commission rate must be a number" })
    .min(0, "Commission rate cannot be negative")
    .max(100, "Commission rate cannot exceed 100")
    .optional(),
  isActive: z.boolean(),
  isMaster: z.boolean(),
  botToken: z.string().optional(),
  botUsername: z.string().optional(),
  themeKey: z.string().optional(),
})

export type RoomFormData = z.infer<typeof roomSchema>
export type NumberCallFormData = z.infer<typeof numberCallSchema>
export type PlayerSearchFormData = z.infer<typeof playerSearchSchema>
export type BotUserNameFormData = z.infer<typeof botUserNameSchema>
export type BotUsersFormData = z.infer<typeof botUsersSchema>
export type AgentCreateFormData = z.infer<typeof agentCreateSchema>

export const roomPatterns = roomSchema.shape.pattern.options
export const roomStatuses = roomSchema.shape.status.options
