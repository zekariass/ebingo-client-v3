import { type NextRequest, NextResponse } from "next/server"
import { getOrCreateBot } from "@/lib/agent-bot-manager"
import axios from "axios"

export async function POST(req: NextRequest, { params }: { params: Promise<{ locale: string; agentId: number }> }) {
  try {
    const { agentId } = await params

    // Fetch agent details from backend
    const agentResponse = await axios.get(`${process.env.BACKEND_BASE_URL}/api/v1/agents/${agentId}`)

    if (!agentResponse.data?.success) {
      return NextResponse.json({ ok: false, error: "Agent not found" }, { status: 404 })
    }

    const botToken = agentResponse.data.data.botToken

    // Get or create bot instance for this agent
    const bot = getOrCreateBot(agentId, botToken)

    const update = await req.json()

    // Handle update safely
    await bot.handleUpdate(update).catch((err) => console.error("handleUpdate error:", err))

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Telegram webhook error:", error)
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 })
  }
}
