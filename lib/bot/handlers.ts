import type { Telegraf } from "telegraf"
import { registerStartHandlers } from "./handlers/start"
import { registerCommandHandlers } from "./handlers/commands"
import { registerRoomHandlers } from "./handlers/rooms"
import { registerNicknameHandlers } from "./handlers/nickname"
import { registerWalletHandlers } from "./handlers/wallet-handler"
import { registerInviteHandler } from "./handlers/invite"
import { registerBroadcastHandler } from "./handlers/broadcast"
import { registerDepositHandler } from "./handlers/deposit"
import { registerThemeHandler } from "./handlers/theme"

export function registerHandlers(bot: Telegraf, agentId: number) {
  // Pass agentId to all handlers
  registerCommandHandlers(bot, agentId)
  registerNicknameHandlers(bot, agentId)
  registerInviteHandler(bot, agentId)
  registerStartHandlers(bot, agentId)
  registerDepositHandler(bot, agentId)
  registerBroadcastHandler(bot, agentId)
  registerThemeHandler(bot, agentId)
  registerWalletHandlers(bot, agentId)
  registerRoomHandlers(bot, agentId)
}
