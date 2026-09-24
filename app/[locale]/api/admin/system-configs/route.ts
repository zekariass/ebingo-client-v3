import { NextRequest, NextResponse } from "next/server"

import { ADMIN_ONLY_SYSTEM_CONFIGS } from "@/lib/constant"

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

    const response = await fetch(
      `${BACKEND_URL}/api/v1/system-configs?agentId=${agentId}`,
      {
        headers: {
          "x-user-role": userRole,
          ...(initData && { "x-init-data": initData }),
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

    const configs: any[] = Array.isArray(data.data) ? data.data : []
    const visible =
      userRole === "ADMIN"
        ? configs
        : configs.filter((c) => !ADMIN_ONLY_SYSTEM_CONFIGS.has(c?.name))

    return NextResponse.json({
      success: true,
      data: visible,
    })
  } catch (error) {
    console.error("GET system configs error:", error)

    return NextResponse.json(
      { success: false, error: "Failed to fetch system configs" },
      { status: 500 }
    )
  }
}
