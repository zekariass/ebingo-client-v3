import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { locale: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get("page") || "0"
    const size = searchParams.get("size") || "10"
    
    const backendUrl = process.env.BACKEND_BASE_URL
    const apiKey = process.env.INTERNAL_API_KEY
    
    if (!backendUrl) {
      return NextResponse.json(
        { success: false, error: "Backend URL not configured" },
        { status: 500 }
      )
    }

    const backendResponse = await fetch(
      `${backendUrl}/api/v1/accounting/daily?page=${page}&size=${size}`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Access-Token": process.env.BACKEND_ENDPOINTS_ACCESS_TOKEN!,
          ...(apiKey && { "X-API-KEY": apiKey }),
        },
      }
    )

    const data = await backendResponse.json()

    if (!backendResponse.ok) {
      return NextResponse.json(
        { success: false, error: data.message || "Failed to fetch daily accountings" },
        { status: backendResponse.status }
      )
    }

    return NextResponse.json({ success: true, data: data.data })
  } catch (error) {
    console.error("Error fetching daily accountings:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch daily accountings" },
      { status: 500 }
    )
  }
}
