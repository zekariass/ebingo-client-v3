import { NextRequest, NextResponse } from "next/server"

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL!
const BACKEND_ENDPOINTS_ACCESS_TOKEN = process.env.BACKEND_ENDPOINTS_ACCESS_TOKEN

// Strip sensitive fields (botToken) before sending to client
function sanitizeAgent(agent: Record<string, any>) {
  const { botToken, ...safe } = agent
  return safe
}

/**
 * GET - List active agents (proxies GET /api/v1/agents/active)
 */
export async function GET(request: NextRequest) {
  try {
    if (!BACKEND_BASE_URL) {
      return NextResponse.json(
        { success: false, message: "Server misconfiguration: BACKEND_BASE_URL not set" },
        { status: 500 }
      )
    }

    const response = await fetch(`${BACKEND_BASE_URL}/api/v1/agents/active`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.INTERNAL_API_KEY ?? ""}`,
        "X-Access-Token": BACKEND_ENDPOINTS_ACCESS_TOKEN ?? "",
      },
      cache: "no-store",
    })

    const result = await response.json().catch(() => null)

    if (!response.ok) {
      console.error("Active agents backend error:", result)
      return NextResponse.json(
        result ?? { success: false, message: "Failed to fetch active agents" },
        { status: response.status }
      )
    }

    const agents = Array.isArray(result?.data) ? result.data.map(sanitizeAgent) : []

    return NextResponse.json({ success: true, data: agents })
  } catch (err) {
    console.error("Active agents proxy error:", err)
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    )
  }
}
