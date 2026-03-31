import axios from "axios"
import { Markup } from "telegraf"
import { getUserLang } from "../userLangMap"
import { translations } from "../translations"

export function registerRoomHandlers(bot: any, agentId: number) {
  bot.action(/show_rooms_(\d+)/, async (ctx: any) => {
    await ctx.answerCbQuery()
    const page = Number.parseInt(ctx.match?.[1] || "1", 10)
    await showRooms(ctx, page, agentId)
  })
}

export async function showRooms(ctx: any, page = 1, agentId: number) {
  const ROOMS_PER_PAGE = 10
  const currency = "Birr"
  try {
    const response = await axios.get(`${process.env.BACKEND_BASE_URL}/api/v1/public/rooms`, {
      params: { agentId },
      headers: { 
        "Content-Type": "application/json",
        "X-Access-Token": process.env.BACKEND_ENDPOINTS_ACCESS_TOKEN ?? "",
      },
    })
    const rooms = response.data.data
    if (!rooms || rooms.length === 0) {
      return await ctx.reply(getTranslation(ctx, "noRooms"))
    }

    const startIdx = (page - 1) * ROOMS_PER_PAGE
    const pagedRooms = rooms.slice(startIdx, startIdx + ROOMS_PER_PAGE)

    const roomButtons = pagedRooms.map((room: any) => {
      const btnName = room?.entryFee === 0 ? "🎮 Test (free)" : `🎮-Play ${room?.entryFee} ${currency}`
      return Markup.button.webApp(
        `${btnName}`,
        `${process.env.APP_URL}/${getUserLang(ctx.from?.id)}/rooms/${room.id}?agentId=${agentId}`,
      )
    })

    const totalPages = Math.ceil(rooms.length / ROOMS_PER_PAGE)
    const navButtons: any[] = []
    if (page > 1) navButtons.push(Markup.button.callback(getTranslation(ctx, "prev"), `show_rooms_${page - 1}`))
    if (page < totalPages)
      navButtons.push(Markup.button.callback(getTranslation(ctx, "next"), `show_rooms_${page + 1}`))

    await ctx.reply(
      getTranslation(ctx, "chooseRoom"),
      Markup.inlineKeyboard([...roomButtons, ...navButtons], { columns: 2 }),
    )
  } catch (err) {
    console.error("[ERROR] Failed to fetch rooms:", err)
    await ctx.reply(getTranslation(ctx, "fetchError"))
  }
}

function getTranslation(ctx: any, key: string) {
  const lang = getUserLang(ctx.from?.id)
  return translations[lang]?.[key] || translations["en"][key] || key
}
