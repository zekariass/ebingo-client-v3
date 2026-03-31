import { NextRequest, NextResponse } from "next/server"
import { Agent } from "@/lib/stores/agent-store"

interface ApiResponse<T> {
  success: boolean
  statusCode: number
  message: string
  error?: string
  errors?: Map<string, string>
  path?: string
  data: T
  timestamp: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const searchTerm = searchParams.get("searchTerm") || ""

    if (!searchTerm) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: "Search term is required",
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      )
    }

    // Build the backend URL with parameters
    const backendUrl = process.env.BACKEND_BASE_URL
    const BACKEND_ENDPOINTS_ACCESS_TOKEN = process.env.BACKEND_ENDPOINTS_ACCESS_TOKEN
    if (!backendUrl) {
      throw new Error("BACKEND_BASE_URL environment variable is not set")
    }

    const response = await fetch(`${backendUrl}/api/v1/agents/search?searchTerm=${encodeURIComponent(searchTerm)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.INTERNAL_API_KEY || ""}`,
        "X-Access-Token": BACKEND_ENDPOINTS_ACCESS_TOKEN ?? "",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Backend API error:", response.status, errorText)
      throw new Error(`Backend API error: ${response.status} ${errorText}`)
    }

    const result: ApiResponse<Agent[]> = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error searching agents:", error)
    return NextResponse.json(
      { 
        success: false, 
        statusCode: 500,
        message: "Failed to search agents",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
