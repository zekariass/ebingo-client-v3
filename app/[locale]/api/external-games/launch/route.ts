import { NextRequest, NextResponse } from "next/server"

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL!
const BACKEND_ENDPOINTS_ACCESS_TOKEN = process.env.BACKEND_ENDPOINTS_ACCESS_TOKEN!

export async function POST(request: NextRequest) {
  try {
    if (!BACKEND_BASE_URL) {
      console.error("BACKEND_BASE_URL is not configured")
      return NextResponse.json(
        { success: false, error: "Server misconfiguration: BACKEND_BASE_URL not set" },
        { status: 500 }
      )
    }

    const body = await request.json()

    // Validate required fields
    const requiredFields = ["agentId", "gameMode", "currency", "initData"]
    const missingFields = requiredFields.filter(field => !body[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Missing required fields: ${missingFields.join(", ")}` 
        },
        { status: 400 }
      )
    }

    const backendUrl = `${BACKEND_BASE_URL}/external-games/golden-eggs/launch`
    
    // console.log("=== GAME LAUNCH REQUEST ===")
    // console.log("Backend URL:", backendUrl)
    // console.log("Game Mode:", body.gameMode)
    // console.log("Agent ID:", body.agentId)
    // console.log("Full Request Body:", JSON.stringify(body, null, 2))

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Access-Token": BACKEND_ENDPOINTS_ACCESS_TOKEN,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    })

    // console.log("Backend response status:", response.status)
    // console.log("Backend response headers:", Object.fromEntries(response.headers.entries()))

    const result = await response.json()

    // console.log("Backend response body:", JSON.stringify(result, null, 2))

    if (!response.ok) {
      console.error("=== BACKEND ERROR ===")
      console.error("Status:", response.status)
      console.error("Error details:", result)
      return NextResponse.json(
        {
          success: false,
          error: result?.error || result?.message || `Backend error: ${response.status}`,
          details: result,
        },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data || result,
      message: result.message || "Game launched successfully",
    })
  } catch (err) {
    console.error("Game launch error:", err)
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
