import axios from "axios"
import { Markup, type Telegraf, session } from "telegraf"
import { getAgentConfig } from "./agent-config"

const registeredUsersCache = new Map<string, boolean>()
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

const BACKEND_ENDPOINTS_ACCESS_TOKEN = process.env.BACKEND_ENDPOINTS_ACCESS_TOKEN;

export function registerMiddleware(bot: Telegraf, agentId: number) {
  // Add session middleware first
  bot.use(session())

  bot.use(async (ctx: any, next: any) => {
    const userId = ctx.from?.id
    if (!userId) return

    ctx.agentId = agentId

    const isStart = ctx.message?.text?.startsWith("/start")
    const isContact = ctx.message?.contact !== undefined

    const cacheKey = `${agentId}:${userId}`
    let isRegistered = registeredUsersCache.has(cacheKey)

    if (!isRegistered) {
      try {
        const response = await axios.get(`${process.env.BACKEND_BASE_URL}/api/v1/secured/user-profile/${userId}`, {
          params: { agentId },
          headers: {
            "X-Access-Token": BACKEND_ENDPOINTS_ACCESS_TOKEN ?? "",
          },
        })
        isRegistered = response.data?.success && response.data?.data?.telegramId === userId
        if (isRegistered) {
          registeredUsersCache.set(cacheKey, true)
          setTimeout(() => registeredUsersCache.delete(cacheKey), CACHE_TTL_MS)
        }
      } catch {
        isRegistered = false
      }
    }

    // Agent admins may not be registered players — let their commands through
    if (!isRegistered && !isStart && !isContact) {
      const config = await getAgentConfig(agentId)
      const adminIds = (config?.adminIds || "")
        .split(",")
        .map((x: string) => Number(x.trim()))
        .filter((n: number) => Number.isFinite(n) && n > 0)
      if (adminIds.includes(userId)) {
        ctx.session = ctx.session || {}
        return next()
      }

      await ctx.reply(
        "📌 Please share your phone number first to register.",
        Markup.keyboard([[Markup.button.contactRequest("📱 Share Phone Number To Register")]])
          .resize()
          .oneTime(),
      )
      return
    }

    // Ensure session object exists
    ctx.session = ctx.session || {}

    await next()
  })
}
