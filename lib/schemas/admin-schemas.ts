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

export type RoomFormData = z.infer<typeof roomSchema>
export type NumberCallFormData = z.infer<typeof numberCallSchema>
export type PlayerSearchFormData = z.infer<typeof playerSearchSchema>

export const roomPatterns = roomSchema.shape.pattern.options
export const roomStatuses = roomSchema.shape.status.options
