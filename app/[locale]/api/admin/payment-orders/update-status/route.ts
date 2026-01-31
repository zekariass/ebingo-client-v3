import { NextResponse } from "next/server"
import axios from "axios"

export async function PUT(req: Request) {
  try {
    const role = req.headers.get("x-user-role")
    const initData = req.headers.get("x-init-data")

    if (role !== "ADMIN" && role !== "AGENT") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json()
    const { adminUserId, agentId, orderId, approve, reason } = body

    if (!orderId || approve === undefined) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    // --- Call your Spring Boot backend ---
    const backendRes = await axios.put(
      `${process.env.BACKEND_BASE_URL}/api/v1/secured/payment-orders/offline/admin/change-withdrawal-status?adminUserId=${adminUserId}`,
      { orderId, agentId, approve, reason },
      {
        headers: {
          "Content-Type": "application/json",
          // "x-init-data": initData || "",
          "x-user-role": role,
        },
      }
    )

    return NextResponse.json({ success: true, message: backendRes.data.message, data: backendRes.data.data })
  } catch (err: any) {
    console.error("Error in route handler:", err)
    return NextResponse.json(
      { success: false, message: err.response?.data?.message || err.message || "Internal Server Error" },
      { status: 500 }
    )
  }
}
