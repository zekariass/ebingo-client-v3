import { NextRequest, NextResponse } from "next/server"

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL!
const BACKEND_ENDPOINTS_ACCESS_TOKEN = process.env.BACKEND_ENDPOINTS_ACCESS_TOKEN!

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    if (!BACKEND_BASE_URL) {
      console.error("BACKEND_BASE_URL is not configured")
      return NextResponse.json(
        { success: false, error: "Server misconfiguration: BACKEND_BASE_URL not set" },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const agentId = searchParams.get("agentId")
    const { date } = await params

    if (!agentId || !date) {
      return NextResponse.json(
        { success: false, error: "agentId and date are required" },
        { status: 400 }
      )
    }

    const initData = request.headers.get("x-init-data")
    const backendUrl = `${BACKEND_BASE_URL}/external-games/golden-eggs/accounting/daily/${date}?agentId=${agentId}`
    
    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Access-Token": BACKEND_ENDPOINTS_ACCESS_TOKEN,
        ...(initData && { "x-init-data": initData }),
      },
      cache: "no-store",
    })

    const result = await response.json()

    if (!response.ok) {
      console.error("Backend error:", result)
      return NextResponse.json(
        {
          success: false,
          error: result?.error || result?.message || "Backend error",
          details: result,
        },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: result.message,
    })
  } catch (err) {
    console.error("Golden Eggs daily accounting by date error:", err)
    const errorMessage = err instanceof Error ? err.message : "Internal server error"
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: err instanceof Error ? err.stack : String(err)
      },
      { status: 500 }
    )
  }
}
