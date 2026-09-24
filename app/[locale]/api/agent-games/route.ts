import { NextRequest, NextResponse } from "next/server"

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL!
const BACKEND_ENDPOINTS_ACCESS_TOKEN = process.env.BACKEND_ENDPOINTS_ACCESS_TOKEN!

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
    const enabledOnly = searchParams.get("enabledOnly")

    if (!agentId) {
      return NextResponse.json(
        { success: false, error: "agentId is required" },
        { status: 400 }
      )
    }

    const initData = request.headers.get("x-init-data")
    let backendUrl = `${BACKEND_BASE_URL}/api/agent-games?agentId=${agentId}`
    if (enabledOnly !== null) {
      backendUrl += `&enabledOnly=${enabledOnly}`
    }
    
    // console.log("Fetching agent games from:", backendUrl)

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Access-Token": BACKEND_ENDPOINTS_ACCESS_TOKEN ?? "",
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
    console.error("Agent games error:", err)
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
    const initData = request.headers.get("x-init-data")
    const backendUrl = `${BACKEND_BASE_URL}/api/agent-games`
    
    // console.log("Creating agent game:", backendUrl)

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Access-Token": BACKEND_ENDPOINTS_ACCESS_TOKEN ?? "",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    })

    // console.log("Backend response status:", response.status)

    const result = await response.json()

    if (!response.ok) {
      // console.error("Backend error:", result)
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
      data: result.data ?? result,
      message: result.message,
    })
  } catch (err) {
    console.error("Create agent game error:", err)
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
