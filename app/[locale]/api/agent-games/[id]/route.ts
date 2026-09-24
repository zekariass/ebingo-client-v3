import { NextRequest, NextResponse } from "next/server"

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL!
const BACKEND_ENDPOINTS_ACCESS_TOKEN = process.env.BACKEND_ENDPOINTS_ACCESS_TOKEN!

export async function GET(
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

    if (!id) {
      return NextResponse.json(
        { success: false, error: "id is required" },
        { status: 400 }
      )
    }

    const initData = request.headers.get("x-init-data")
    const backendUrl = `${BACKEND_BASE_URL}/api/agent-games/${id}`
    
    // console.log("Fetching agent game by ID from:", backendUrl)

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
      data: result.data ?? result,
      message: result.message,
    })
  } catch (err) {
    console.error("Agent game by ID error:", err)
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

export async function DELETE(
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

    if (!id) {
      return NextResponse.json(
        { success: false, error: "id is required" },
        { status: 400 }
      )
    }

    const initData = request.headers.get("x-init-data")
    const backendUrl = `${BACKEND_BASE_URL}/api/agent-games/${id}`
    
    // console.log("Deleting agent game:", backendUrl)

    const response = await fetch(backendUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-Access-Token": BACKEND_ENDPOINTS_ACCESS_TOKEN ?? "",
      },
      cache: "no-store",
    })

    // console.log("Backend response status:", response.status)

    if (response.status === 204) {
      return NextResponse.json({
        success: true,
        message: "Agent game deleted successfully",
      })
    }

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
      data: result.data ?? result,
      message: result.message,
    })
  } catch (err) {
    console.error("Delete agent game error:", err)
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
