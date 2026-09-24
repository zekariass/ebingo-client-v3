import { NextRequest, NextResponse } from "next/server"

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL!

export async function GET(request: NextRequest) {
  try {
    if (!BACKEND_BASE_URL) {
      console.error("BACKEND_BASE_URL is not configured")
      return NextResponse.json(
        { success: false, error: "Server misconfiguration: BACKEND_BASE_URL not set" },
        { status: 500 }
      )
    }

    const initData = request.headers.get("x-init-data")
    const backendUrl = `${BACKEND_BASE_URL}/external-games/golden-eggs/game-modes`
    
    // console.log("Fetching game modes from:", backendUrl)

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(initData && { "x-init-data": initData }),
        "X-Access-Token": process.env.BACKEND_ENDPOINTS_ACCESS_TOKEN ?? "",
      },
      cache: "no-store",
    })

    // console.log("Backend response status:", response.status)

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
    console.error("External games error:", err)
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
