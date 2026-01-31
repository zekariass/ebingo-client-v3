import { NextRequest, NextResponse } from "next/server"

export async function PUT(
  request: NextRequest,
  { params }: { params: { locale: string; id: string } }
) {
  try {
    const id = params.id
    
    const backendUrl = process.env.BACKEND_BASE_URL
    const apiKey = process.env.INTERNAL_API_KEY
    
    if (!backendUrl) {
      return NextResponse.json(
        { success: false, error: "Backend URL not configured" },
        { status: 500 }
      )
    }

    const backendResponse = await fetch(
      `${backendUrl}/api/v1/accounting/daily/${id}/settle`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey && { "X-API-KEY": apiKey }),
        },
      }
    )

    const data = await backendResponse.json()

    if (!backendResponse.ok) {
      return NextResponse.json(
        { success: false, error: data.message || "Failed to settle daily accounting" },
        { status: backendResponse.status }
      )
    }

    return NextResponse.json({ success: true, data: data.data })
  } catch (error) {
    console.error("Error settling daily accounting:", error)
    return NextResponse.json(
      { success: false, error: "Failed to settle daily accounting" },
      { status: 500 }
    )
  }
}
