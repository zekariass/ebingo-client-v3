import { NextRequest, NextResponse } from "next/server"
import axios from "axios"

const BACKEND_ENDPOINTS_ACCESS_TOKEN = process.env.BACKEND_ENDPOINTS_ACCESS_TOKEN;

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(req.url)
    const agentId = searchParams.get("agentId")

    const role = req.headers.get("x-user-role")
    const initData = req.headers.get("x-init-data")

    if (role !== "ADMIN" && role !== "AGENT") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      )
    }

    if (!/^\d+$/.test(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid order ID" },
        { status: 400 }
      )
    }

    const backendUrl = new URL(
      `${process.env.BACKEND_BASE_URL}/api/v1/secured/payment-orders/offline/detail/${id}`
    )
    if (agentId) backendUrl.searchParams.set("agentId", agentId)

    const backendRes = await axios.get(backendUrl.toString(), {
      headers: {
        "Content-Type": "application/json",
        "x-user-role": role,
        "X-Access-Token": BACKEND_ENDPOINTS_ACCESS_TOKEN ?? "",
        ...(initData && { "x-init-data": initData }),
      },
    })

    return NextResponse.json(backendRes.data)
  } catch (error: any) {
    console.error("Failed to fetch payment order detail:", error.response?.data || error.message)
    const status = error.response?.status
    const message = error.response?.data?.message || error.response?.data?.error || "Failed to fetch order detail"
    return NextResponse.json(
      { success: false, message },
      { status: status ?? 500 }
    )
  }
}
