import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_BASE_URL!;
const BACKEND_ENDPOINTS_ACCESS_TOKEN = process.env.BACKEND_ENDPOINTS_ACCESS_TOKEN;

export async function GET(req: NextRequest) {
  try {
    const userRole = req.headers.get("x-user-role") || ""
    const initData = req.headers.get("x-init-data") || ""

    const { searchParams } = new URL(req.url)
    const agentId = searchParams.get("agentId")

    if (userRole !== "ADMIN" && userRole !== "AGENT") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    // if (!initData) {
    //   return NextResponse.json({ error: "Missing initData" }, { status: 400 });
    // }

    const response = await fetch(
      `${BACKEND_URL}/api/v1/system-configs?agentId=${agentId}`,
      {
        headers: {
          "x-user-role": userRole,
          // "x-init-data": initData,
          "X-Access-Token": BACKEND_ENDPOINTS_ACCESS_TOKEN ?? "",
        },
        cache: "no-store",
      }
    )

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: `HTTP ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      data: data.data,
    })
  } catch (error) {
    console.error("GET system configs error:", error)

    return NextResponse.json(
      { success: false, error: "Failed to fetch system configs" },
      { status: 500 }
    )
  }
}
