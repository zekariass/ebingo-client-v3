import { NextRequest, NextResponse } from "next/server"

interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first?: boolean
  last?: boolean
  empty?: boolean
}

interface ApiResponse<T> {
  success: boolean
  statusCode: number
  message: string
  error?: string
  errors?: Record<string, string>
  path?: string
  data: T
  timestamp: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string; agentId: string }> }
) {
  try {
    const { agentId } = await params
    const { searchParams } = new URL(request.url)
    
    const page = searchParams.get("page") || "0"
    const size = searchParams.get("size") || "10"
    
    const backendUrl = process.env.BACKEND_BASE_URL
    const apiKey = process.env.INTERNAL_API_KEY
    
    if (!backendUrl) {
      return NextResponse.json(
        { 
          success: false, 
          statusCode: 500,
          message: "Backend URL not configured",
          error: "BACKEND_BASE_URL environment variable is not set",
          timestamp: new Date().toISOString(),
          data: null as any
        },
        { status: 500 }
      )
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Access-Token": process.env.BACKEND_ENDPOINTS_ACCESS_TOKEN!,
    }
    
    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`
    }

    const backendResponse = await fetch(
      `${backendUrl}/api/v1/accounting/daily/agent/${agentId}?page=${page}&size=${size}`,
      {
        headers,
        cache: "no-store",
      }
    )

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text()
      console.error("Backend API error:", backendResponse.status, errorText)
      
      return NextResponse.json(
        { 
          success: false, 
          statusCode: backendResponse.status,
          message: "Backend error while fetching daily accounting data",
          error: errorText,
          path: `/api/v1/accounting/daily/agent/${agentId}`,
          timestamp: new Date().toISOString(),
          data: null as any
        },
        { status: backendResponse.status }
      )
    }

    const result: ApiResponse<PageResponse<any>> = await backendResponse.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching daily accounting:", error)
    return NextResponse.json(
      { 
        success: false, 
        statusCode: 500,
        message: "Failed to fetch daily accounting data",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
        data: null as any
      },
      { status: 500 }
    )
  }
}
