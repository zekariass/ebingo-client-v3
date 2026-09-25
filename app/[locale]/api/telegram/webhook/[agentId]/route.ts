import { type NextRequest, NextResponse } from "next/server"
import { getOrCreateBot } from "@/lib/agent-bot-manager"
import { waitUntil } from "@vercel/functions"
import axios from "axios"

const BACKEND_ENDPOINTS_ACCESS_TOKEN = process.env.BACKEND_ENDPOINTS_ACCESS_TOKEN

export const maxDuration = 300

export async function POST(req: NextRequest, { params }: { params: Promise<{ locale: string; agentId: string }> }) {
  try {
    const { agentId } = await params
    const agentIdNum = Number(agentId)

    // Fetch agent details from backend
    const agentResponse = await axios.get(`${process.env.BACKEND_BASE_URL}/api/v1/agents/${agentIdNum}`, {
      headers: {
        "X-Access-Token": BACKEND_ENDPOINTS_ACCESS_TOKEN ?? "",
      },
    })

    if (!agentResponse.data?.success) {
      return NextResponse.json({ ok: false, error: "Agent not found" }, { status: 404 })
    }

    const botToken = agentResponse.data.data.botToken

    // Get or create bot instance for this agent
    const bot = getOrCreateBot(agentIdNum, botToken)

    const update = await req.json()
    console.log(
      `[Webhook] agent=${agentIdNum} update_id=${update.update_id} types=${Object.keys(update).filter((k: string) => k !== "update_id").join(",")} text=${update.message?.text ?? update.callback_query?.data ?? ""}`
    )

    // Respond immediately — long-running handlers (e.g. broadcast) continue in
    // the background. On Vercel, a plain fire-and-forget promise is killed as
    // soon as the response is sent; waitUntil keeps the function alive until
    // the update has been processed.
    waitUntil(bot.handleUpdate(update).catch((err) => console.error("handleUpdate error:", err)))

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Telegram webhook error:", error)
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 })
  }
}
