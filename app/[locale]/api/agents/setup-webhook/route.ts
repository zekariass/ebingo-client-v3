import { type NextRequest, NextResponse } from "next/server"
import { Telegraf } from "telegraf"
import axios from "axios"

const BACKEND_ENDPOINTS_ACCESS_TOKEN = process.env.BACKEND_ENDPOINTS_ACCESS_TOKEN

export async function POST(req: NextRequest, { params }: { params: Promise<{ locale: string }> }) {
  try {
    const { locale } = await params
    const { agentId } = await req.json()

    if (!agentId) {
      return NextResponse.json({ ok: false, error: "Missing agentId" }, { status: 400 })
    }

    // Fetch botToken server-side from backend
    const agentResponse = await axios.get(`${process.env.BACKEND_BASE_URL}/api/v1/agents/${agentId}`, {
      headers: {
        "X-Access-Token": BACKEND_ENDPOINTS_ACCESS_TOKEN ?? "",
      },
    })

    if (!agentResponse.data?.success || !agentResponse.data?.data?.botToken) {
      return NextResponse.json({ ok: false, error: "Agent not found or missing bot token" }, { status: 404 })
    }

    const botToken = agentResponse.data.data.botToken

    // Create temporary bot instance to set webhook
    const bot = new Telegraf(botToken)

    // Use locale in webhook URL to match your routing structure
    const webhookUrl = `${process.env.APP_URL}/${locale}/api/telegram/webhook/${agentId}`
    await bot.telegram.setWebhook(webhookUrl)

    // Set bot commands
    const normalCommands = [
      { command: "register", description: "📋 Register | ተመዝገብ" },
      { command: "menu", description: "📋 Menu | ምርጫዎች" },
      { command: "startgame", description: "🎮 Start Game | ጨዋታ ጀምር" },
      { command: "deposit", description: "💰 Deposit Fund | ገንዘብ አስቀምጥ" },
      { command: "withdraw", description: "💸 Withdraw Money | ገንዘብ አውጣ" },
      { command: "gamerooms", description: "🎲 Game Rooms | የጨዋታ ክፍሎች" },
      { command: "language", description: "🌐 Change Language | ቋንቋ ቀይር" },
      { command: "webview", description: "🌐 Web View | ድረገጽ" },
      { command: "wallet", description: "💰 Check Balance | ቀሪ ገንዘብ" },
      { command: "transfer", description: "🔁 Transfer To A Friend | ለጓደኛ ገንዘብ ላክ" },
      { command: "invite", description: "🔗 Invite A Friend | ጓደኛ ይጋብዙ" },
      { command: "instructions", description: "📖 Instructions | የጨዋታ መመሪያዎች" },
      { command: "support", description: "🧑‍💻 Support | ድጋፍ ያግኙ" },
    ]

    await bot.telegram.setMyCommands(normalCommands)

    // Set admin commands if ADMIN_IDS provided
    const adminIds = (process.env.ADMIN_IDS || "")
      .split(",")
      .map((id) => Number(id))
      .filter(Boolean)
    if (adminIds.length > 0) {
      const adminCommands = [
        ...normalCommands,
        { command: "broadcast", description: "📡 Broadcast Message | Admin Only" },
      ]
      for (const adminId of adminIds) {
        await bot.telegram.setMyCommands(adminCommands, {
          scope: { type: "chat", chat_id: adminId },
        })
      }
    }

    return NextResponse.json({
      ok: true,
      webhookUrl,
      message: "Webhook set successfully",
    })
  } catch (error) {
    console.error("Webhook setup error:", error)
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 })
  }
}
