import { NextRequest, NextResponse } from "next/server"

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL!
const BACKEND_ENDPOINTS_ACCESS_TOKEN = process.env.BACKEND_ENDPOINTS_ACCESS_TOKEN!

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!BACKEND_BASE_URL) {
      console.error("BACKEND_BASE_URL is not configured")
      return NextResponse.json(
        { success: false, error: "Server misconfiguration: BACKEND_BASE_URL not set" },
        { status: 500 }
      )
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const agentId = searchParams.get("agentId")

    if (!id || !agentId) {
      return NextResponse.json(
        { success: false, error: "id and agentId are required" },
        { status: 400 }
      )
    }

    const initData = request.headers.get("x-init-data")
    const backendUrl = `${BACKEND_BASE_URL}/external-games/golden-eggs/accounting/daily/${id}/unsettle?agentId=${agentId}`
    
    const response = await fetch(backendUrl, {
      method: "PUT",
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
    console.error("Golden Eggs unsettle daily accounting error:", err)
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
