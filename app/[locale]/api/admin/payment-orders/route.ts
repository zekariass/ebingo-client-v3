import { NextRequest, NextResponse } from "next/server"

const BACKEND_ENDPOINTS_ACCESS_TOKEN = process.env.BACKEND_ENDPOINTS_ACCESS_TOKEN;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const page = searchParams.get("page") || "1"
    const size = searchParams.get("size") || "20"
    const txnType = searchParams.get("txnType")
    const status = searchParams.get("status")
    const phoneNumber = searchParams.get("phoneNumber")
    const agentId = searchParams.get("agentId")

    const userRole = req.headers.get("x-user-role")
    // const initData = req.headers.get("x-init-data")

    if (!userRole || (userRole !== "ADMIN" && userRole !== "AGENT")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Build backend URL
    const backendUrl = new URL(
      `${process.env.BACKEND_BASE_URL}/api/v1/secured/payment-orders/offline`
    )

    backendUrl.searchParams.set("page", page)
    backendUrl.searchParams.set("size", size)

    if (txnType) backendUrl.searchParams.set("txnType", txnType)
    if (status) backendUrl.searchParams.set("status", status)
    if (phoneNumber) backendUrl.searchParams.set("phoneNumber", phoneNumber)
    if (agentId) backendUrl.searchParams.set("agentId", agentId)

    // Call backend
    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-user-role": userRole,
        "X-Access-Token": BACKEND_ENDPOINTS_ACCESS_TOKEN ?? "",
        // "x-init-data": initData || "",
      },
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (err: any) {
    console.error("Failed to fetch payment orders:", err)
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    )
  }
}
