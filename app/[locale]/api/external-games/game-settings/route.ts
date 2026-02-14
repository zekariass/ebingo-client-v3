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

    if (!agentId) {
      return NextResponse.json(
        { success: false, error: "Agent ID is required" },
        { status: 400 }
      )
    }

    const backendUrl = `${BACKEND_BASE_URL}/external-games/game-settings?agentId=${agentId}`
    
    console.log("Fetching agent game settings for agent:", agentId)

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
          error: result?.message || "Failed to fetch agent game settings",
          details: result,
        },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: result.message || "Agent game settings retrieved successfully",
    })
  } catch (err) {
    console.error("Error fetching agent game settings:", err)
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

export async function PUT(request: NextRequest) {
  try {
    if (!BACKEND_BASE_URL) {
      console.error("BACKEND_BASE_URL is not configured")
      return NextResponse.json(
        { success: false, error: "Server misconfiguration: BACKEND_BASE_URL not set" },
        { status: 500 }
      )
    }

    const body = await request.json()

    if (!body.agentId || !body.gameModes) {
      return NextResponse.json(
        { success: false, error: "Agent ID and game modes are required" },
        { status: 400 }
      )
    }

    const backendUrl = `${BACKEND_BASE_URL}/external-games/game-settings`
    
    console.log("Updating agent game settings for agent:", body.agentId)
    console.log("Game modes:", body.gameModes)

    const initData = request.headers.get("x-init-data") || ""

    const response = await fetch(backendUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-init-data": initData,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    })

    console.log("Backend response status:", response.status)

    const result = await response.json()

    if (!response.ok) {
      console.error("Backend error:", result)
      return NextResponse.json(
        {
          success: false,
          error: result?.message || "Failed to update agent game settings",
          details: result,
        },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: result.message || "Agent game settings updated successfully",
    })
  } catch (err) {
    console.error("Error updating agent game settings:", err)
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
