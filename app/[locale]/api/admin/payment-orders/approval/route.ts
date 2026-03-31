import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL
const BACKEND_ENDPOINTS_ACCESS_TOKEN = process.env.BACKEND_ENDPOINTS_ACCESS_TOKEN

export async function POST(req: NextRequest) {
  const initData = req.headers.get("x-init-data")
  const role = req.headers.get("x-user-role")

  if (!initData || (role !== "ADMIN" && role !== "AGENT")) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
  }

  try {
    const body = await req.json()
    const backendUrl = `${BACKEND_URL}/api/admin/payment-orders/approval`

    const res = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // "x-init-data": initData,
        "x-user-role": role,
        "x-backend-endpoints-access-token": BACKEND_ENDPOINTS_ACCESS_TOKEN ?? "",
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Backend error: ${text}`)
    }

    const data = await res.json()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error approving/rejecting payment order:", error)
    return NextResponse.json({ success: false, error: "Failed to process approval" }, { status: 500 })
  }
}
