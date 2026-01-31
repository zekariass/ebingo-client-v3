import { NextRequest, NextResponse } from "next/server"

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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string; id: string }> }
) {
  try {
    const { id } = await params
    
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
    }
    
    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`
    }

    const backendResponse = await fetch(
      `${backendUrl}/api/v1/accounting/daily/${id}/settle`,
      {
        method: "PUT",
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
          message: "Backend error while settling daily accounting",
          error: errorText,
          path: `/api/v1/accounting/daily/${id}/settle`,
          timestamp: new Date().toISOString(),
          data: null as any
        },
        { status: backendResponse.status }
      )
    }

    const result: ApiResponse<any> = await backendResponse.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error settling daily accounting:", error)
    return NextResponse.json(
      { 
        success: false, 
        statusCode: 500,
        message: "Failed to settle daily accounting",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
        data: null as any
      },
      { status: 500 }
    )
  }
}
