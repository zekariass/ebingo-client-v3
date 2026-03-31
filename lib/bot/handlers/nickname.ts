import type { Telegraf, Context } from "telegraf"
import { message } from "telegraf/filters"
import axios from "axios"
import { t } from "../utils"
import { showStartMenu } from "./commands"
import { getUserLang } from "../userLangMap"
import { translations } from "../translations"

const API_BASE_URL = process.env.BACKEND_BASE_URL!
const BACKEND_ENDPOINTS_ACCESS_TOKEN = process.env.BACKEND_ENDPOINTS_ACCESS_TOKEN;

const awaitingNickname = new Map<number, boolean>()

function getTranslationForLang(lang: string, key: string) {
  return translations[lang]?.[key] || translations["am"][key] || key
}

export function registerNicknameHandlers(bot: Telegraf<Context>, agentId: number) {
  bot.action("change_name", async (ctx) => {
    const lang = getUserLang(ctx?.from?.id)
    await ctx.answerCbQuery()
    const userId = ctx.from?.id
    if (!userId) return

    awaitingNickname.set(userId, true)

    // await ctx.reply(t(ctx, "changeNickname"))
    awaitingNickname.set(userId, true)
    await ctx.reply(getTranslationForLang(lang, "nicknameChangeInstructions"))
    // await ctx.reply(getTranslationForLang(lang, "changeNickname"))
    setTimeout(() => awaitingNickname.delete(userId), 120_000)
    setTimeout(() => awaitingNickname.delete(userId), 120_000)
  })

  bot.on(message("text"), async (ctx, next) => {
    const userId = ctx.from?.id
    if (!userId) return next()

    const text = ctx.message.text.trim()

    if (text.startsWith("/")) return next()
    if (!awaitingNickname.get(userId)) return next()

    awaitingNickname.delete(userId)
    const newNickname = text

    if (!newNickname) {
      await ctx.reply(t(ctx, "invalidNickname"))
      return
    }

    try {
      const response = await axios.put(`${API_BASE_URL}/api/v1/secured/user-profile/update-nickname`, null, {
        params: { telegramId: userId, nickName: newNickname, agentId },
        headers: {
          "X-Access-Token": BACKEND_ENDPOINTS_ACCESS_TOKEN ?? "",
        },
      })

      if (response.data?.success) {
        await ctx.reply(t(ctx, "nicknameChanged").replace("{name}", newNickname))
      } else {
        await ctx.reply(t(ctx, "nicknameChangeFailed"))
      }
    } catch (err: any) {
      console.error("Nickname change error:", err.response?.data || err.message)
      await ctx.reply(t(ctx, "nicknameChangeError"))
    }

    await showStartMenu(ctx, agentId)
  })
}
