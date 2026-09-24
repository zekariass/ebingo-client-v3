import { NextRequest, NextResponse } from "next/server"

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL
const BACKEND_ENDPOINTS_ACCESS_TOKEN = process.env.BACKEND_ENDPOINTS_ACCESS_TOKEN

export async function POST(req: NextRequest) {
  const initData = req.headers.get("x-init-data")
  const role = req.headers.get("x-user-role")

  if (role !== "ADMIN" && role !== "AGENT") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { orderId, agentId, approve, reason, adminUserId } = body

    if (!orderId || approve === undefined || !adminUserId) {
      return NextResponse.json(
        { success: false, error: "orderId, approve and adminUserId are required" },
        { status: 400 }
      )
    }

    const res = await fetch(
      `${BACKEND_BASE_URL}/api/v1/secured/payment-orders/offline/admin/change-withdrawal-status?adminUserId=${adminUserId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": role,
          ...(initData && { "x-init-data": initData }),
          "X-Access-Token": BACKEND_ENDPOINTS_ACCESS_TOKEN ?? "",
        },
        body: JSON.stringify({ orderId, agentId, approve, reason }),
      }
    )

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    console.error("Error approving/rejecting payment order:", error)
    return NextResponse.json({ success: false, error: "Failed to process approval" }, { status: 500 })
  }
}
