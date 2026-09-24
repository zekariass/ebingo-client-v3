import { NextRequest, NextResponse } from "next/server"

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL!
const BACKEND_ENDPOINTS_ACCESS_TOKEN = process.env.BACKEND_ENDPOINTS_ACCESS_TOKEN

/**
 * POST - Bulk create bot users + wallets (ADMIN only)
 * Proxies to POST /api/v1/admin/bot-users and preserves the backend
 * status code + standard envelope so the client can distinguish
 * 400 (field errors), 404 (agent not found) and 409 (range conflict).
 */
export async function POST(request: NextRequest) {
  try {
    if (!BACKEND_BASE_URL) {
      return NextResponse.json(
        { success: false, message: "Server misconfiguration: BACKEND_BASE_URL not set" },
        { status: 500 }
      )
    }

    const role = request.headers.get("x-user-role")
    if (role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Forbidden: Admins only" },
        { status: 403 }
      )
    }

    const body = await request.json()

    const response = await fetch(`${BACKEND_BASE_URL}/api/v1/admin/bot-users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.INTERNAL_API_KEY ?? ""}`,
        "X-Access-Token": BACKEND_ENDPOINTS_ACCESS_TOKEN ?? "",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    })

    const result = await response.json().catch(() => null)

    if (!response.ok) {
      console.error("Bot users backend error:", result)
    }

    return NextResponse.json(
      result ?? { success: false, message: "Empty response from backend" },
      { status: response.status }
    )
  } catch (err) {
    console.error("Bot users proxy error:", err)
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    )
  }
}
