import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string; agentId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get("page") || "0"
    const size = searchParams.get("size") || "10"
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    
    const { agentId } = await params
    
    const backendUrl = process.env.BACKEND_BASE_URL
    const apiKey = process.env.INTERNAL_API_KEY
    
    if (!backendUrl) {
      return NextResponse.json(
        { success: false, error: "Backend URL not configured" },
        { status: 500 }
      )
    }

    if (!startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: "startDate and endDate are required" },
        { status: 400 }
      )
    }

    const backendResponse = await fetch(
      `${backendUrl}/api/v1/accounting/daily/agent/${agentId}/date-range?page=${page}&size=${size}&startDate=${startDate}&endDate=${endDate}`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Access-Token": process.env.BACKEND_ENDPOINTS_ACCESS_TOKEN ?? "",
          ...(apiKey && { "X-API-KEY": apiKey }),
        },
      }
    )

    const data = await backendResponse.json()

    if (!backendResponse.ok) {
      return NextResponse.json(
        { success: false, error: data.message || "Failed to fetch daily accounting by date range" },
        { status: backendResponse.status }
      )
    }

    return NextResponse.json({ success: true, data: data.data })
  } catch (error) {
    console.error("Error fetching daily accounting by date range:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch daily accounting by date range" },
      { status: 500 }
    )
  }
}
