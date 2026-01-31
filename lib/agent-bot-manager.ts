import { Telegraf } from "telegraf"
import { registerMiddleware } from "./bot/middleware"
import { registerHandlers } from "./bot/handlers"

// Store bot instances per agent
const botInstances = new Map<number, Telegraf>()

/**
 * Get or create a bot instance for a specific agent
 * @param agentId - The unique agent identifier
 * @param botToken - The bot token for this agent
 * @returns Telegraf bot instance
 */
export function getOrCreateBot(agentId: number, botToken: string): Telegraf {
  if (botInstances.has(agentId)) {
    return botInstances.get(agentId)!
  }

  // Create new bot instance
  const bot = new Telegraf(botToken)

  // Install middleware with agent context
  registerMiddleware(bot, agentId)

  // Register handlers with agent context
  registerHandlers(bot, agentId)

  // console.log(`>>>>>>>>>>: Received webhook for agentId: ${agentId}`)


  // Global error catcher
  bot.catch((err) => console.error(`Bot error for agent ${agentId}:`, err))

  // Store instance
  botInstances.set(agentId, bot)

  return bot
}

/**
 * Get a bot instance by agent ID
 */
export function getBotByAgent(agentId: number): Telegraf | undefined {
  return botInstances.get(agentId)
}

/**
 * Remove a bot instance (cleanup)
 */
export function removeBot(agentId: number): boolean {
  const bot = botInstances.get(agentId)
  if (bot) {
    bot.stop()
    botInstances.delete(agentId)
    return true
  }
  return false
}

/**
 * Get all active agent IDs
 */
export function getActiveAgents(): number[] {
  return Array.from(botInstances.keys())
}
