// import { NextRequest, NextResponse } from "next/server"
// import { DailyAccounting } from "@/lib/stores/agent-store"

// interface PageResponse<T> {
//   content: T[]
//   page: number
//   size: number
//   totalElements: number
//   totalPages: number
//   first: boolean
//   last: boolean
//   empty: boolean
// }

// interface ApiResponse<T> {
//   success: boolean
//   statusCode: number
//   message: string
//   error?: string
//   errors?: Record<string, string> // Map doesn't serialize well over JSON
//   path?: string
//   data: T
//   timestamp: string
// }

// export async function GET(
//   request: NextRequest,
//   { params }: { params: Promise<{ locale: string; agentId: string }> }
// ) {
//   try {
//     const { agentId } = await params
//     const { searchParams } = new URL(request.url)

//     const page = Number.parseInt(searchParams.get("page") || "0", 10)
//     const size = Number.parseInt(searchParams.get("size") || "10", 10)
//     const startDate = searchParams.get("startDate") || ""
//     const endDate = searchParams.get("endDate") || ""

//     const backendUrl = process.env.BACKEND_BASE_URL
//     if (!backendUrl) throw new Error("BACKEND_BASE_URL environment variable is not set")

//     // Build query params
//     const queryParams = new URLSearchParams({
//       page: page.toString(),
//       size: size.toString(),
//     })

//     // Choose the correct backend route
//     let endpoint = `${backendUrl}/api/v1/accounting/daily/agent/${agentId}`

//     const hasDateRange = Boolean(startDate && endDate)
//     if (hasDateRange) {
//       endpoint = `${backendUrl}/api/v1/accounting/daily/agent/${agentId}/date-range`
//       queryParams.set("startDate", startDate)
//       queryParams.set("endDate", endDate)
//     }

//     // Auth: forward user's Authorization header if present, else internal key
//     const incomingAuth = request.headers.get("authorization")
//     const internalKey = process.env.INTERNAL_API_KEY

//     const headers: Record<string, string> = {}
//     if (incomingAuth) headers["Authorization"] = incomingAuth
//     else if (internalKey) headers["Authorization"] = `Bearer ${internalKey}`

//     const response = await fetch(`${endpoint}?${queryParams.toString()}`, {
//       method: "GET",
//       headers,
//       cache: "no-store",
//     })

//     if (!response.ok) {
//       const errorText = await response.text()
//       console.error("Backend API error:", response.status, errorText)

//       return NextResponse.json(
//         {
//           success: false,
//           statusCode: response.status,
//           message: "Backend error while fetching daily accounting data",
//           error: errorText,
//           path: `/api/v1/accounting/daily/agent/${agentId}`,
//           timestamp: new Date().toISOString(),
//           data: null as any, // keep shape; or change ApiResponse to data?: T
//         },
//         { status: response.status }
//       )
//     }

//     const result: ApiResponse<PageResponse<DailyAccounting>> = await response.json()
//     return NextResponse.json(result)
//   } catch (error) {
//     console.error("Error fetching daily accounting:", error)
//     return NextResponse.json(
//       {
//         success: false,
//         statusCode: 500,
//         message: "Failed to fetch daily accounting data",
//         error: error instanceof Error ? error.message : "Unknown error",
//         timestamp: new Date().toISOString(),
//       },
//       { status: 500 }
//     )
//   }
// }


import { NextRequest, NextResponse } from "next/server"
import { DailyAccounting } from "@/lib/stores/agent-store"

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

    const page = Number.parseInt(searchParams.get("page") || "0", 10)
    const size = Number.parseInt(searchParams.get("size") || "10", 10)
    const startDate = searchParams.get("startDate") || ""
    const endDate = searchParams.get("endDate") || ""

    const backendUrl = process.env.BACKEND_BASE_URL
    if (!backendUrl) throw new Error("BACKEND_BASE_URL environment variable is not set")

    // ✅ enforce backend contract for date-range
    const hasStart = Boolean(startDate)
    const hasEnd = Boolean(endDate)
    if ((hasStart && !hasEnd) || (!hasStart && hasEnd)) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: "Both startDate and endDate are required for date-range filtering",
          path: `/api/accounting/daily/agent/${agentId}`,
          timestamp: new Date().toISOString(),
          data: null as any,
        },
        { status: 400 }
      )
    }

    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    })

    let endpoint = `${backendUrl}/api/v1/accounting/daily/agent/${agentId}`

    if (hasStart && hasEnd) {
      endpoint = `${backendUrl}/api/v1/accounting/daily/agent/${agentId}/date-range`
      queryParams.set("startDate", startDate)
      queryParams.set("endDate", endDate)
    }

    const incomingAuth = request.headers.get("authorization")
    const internalKey = process.env.INTERNAL_API_KEY

    const headers: Record<string, string> = {}
    if (incomingAuth) headers["Authorization"] = incomingAuth
    else if (internalKey) headers["Authorization"] = `Bearer ${internalKey}`

    const response = await fetch(`${endpoint}?${queryParams.toString()}`, {
      method: "GET",
      headers,
      cache: "no-store",
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Backend API error:", response.status, errorText)

      return NextResponse.json(
        {
          success: false,
          statusCode: response.status,
          message: "Backend error while fetching daily accounting data",
          error: errorText,
          path: endpoint.replace(backendUrl, ""), // ✅ accurate path
          timestamp: new Date().toISOString(),
          data: null as any,
        },
        { status: response.status }
      )
    }

    const result: ApiResponse<PageResponse<DailyAccounting>> = await response.json()
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
        data: null as any,
      },
      { status: 500 }
    )
  }
}
