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

    const { searchParams } = new URL(request.url)
    const agentId = searchParams.get("agentId")
    const gameMode = searchParams.get("gameMode")

    if (!agentId || !gameMode) {
      return NextResponse.json(
        { success: false, error: "Agent ID and game mode are required" },
        { status: 400 }
      )
    }

    const backendUrl = `${BACKEND_BASE_URL}/external-games/game-settings/check?agentId=${agentId}&gameMode=${gameMode}`
    
    console.log("Checking if game mode is enabled:", gameMode, "for agent:", agentId)

    const initData = request.headers.get("x-init-data") || ""

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-init-data": initData,
      },
      cache: "no-store",
    })

    console.log("Backend response status:", response.status)

    const result = await response.json()

    if (!response.ok) {
      console.error("Backend error:", result)
      return NextResponse.json(
        {
          success: false,
          error: result?.message || "Failed to check game mode",
          details: result,
        },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: result.message || "Game mode check completed",
    })
  } catch (err) {
    console.error("Error checking game mode:", err)
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
