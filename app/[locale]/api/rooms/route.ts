import { type NextRequest, NextResponse } from "next/server"

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL!
const BACKEND_ENDPOINTS_ACCESS_TOKEN = process.env.BACKEND_ENDPOINTS_ACCESS_TOKEN;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const agentId = searchParams.get("agentId")

    if (!agentId) {
      return NextResponse.json(
        { success: false, error: "agentId is required" },
        { status: 400 }
      )
    }

    const response = await fetch(
      `${BACKEND_BASE_URL}/api/v1/public/rooms?agentId=${agentId}`,
      {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "X-Access-Token": BACKEND_ENDPOINTS_ACCESS_TOKEN ?? "",
        },
        cache: "no-store",
      }
    )

    const result = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: result?.error || "Backend error" },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      error: null,
    })
  } catch (err) {
    console.error("Admin rooms error:", err)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}