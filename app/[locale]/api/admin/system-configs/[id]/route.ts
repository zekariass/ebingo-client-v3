import { NextRequest, NextResponse } from "next/server"

import { ADMIN_ONLY_SYSTEM_CONFIGS } from "@/lib/constant"

const BACKEND_URL = process.env.BACKEND_BASE_URL!;
const BACKEND_ENDPOINTS_ACCESS_TOKEN = process.env.BACKEND_ENDPOINTS_ACCESS_TOKEN;

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userRole = req.headers.get("x-user-role") || ""
    const initData = req.headers.get("x-init-data") || ""

    if (userRole !== "ADMIN" && userRole !== "AGENT") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    // Non-admin users may not update admin-only configs. Resolve the config's
    // name via the agent's config list before proxying the update.
    if (userRole !== "ADMIN") {
      const agentId = new URL(req.url).searchParams.get("agentId")
      if (!agentId) {
        return NextResponse.json(
          { success: false, error: "agentId is required" },
          { status: 400 }
        )
      }

      const listRes = await fetch(
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

      if (!listRes.ok) {
        return NextResponse.json(
          { success: false, error: "Unable to verify config permissions" },
          { status: 502 }
        )
      }

      const listJson = await listRes.json()
      const target = (Array.isArray(listJson.data) ? listJson.data : []).find(
        (c: any) => String(c.id) === id
      )
      if (target && ADMIN_ONLY_SYSTEM_CONFIGS.has(target.name)) {
        return NextResponse.json(
          { error: "Forbidden: Admins only" },
          { status: 403 }
        )
      }
    }

    const body = await req.json()

    const response = await fetch(
      `${BACKEND_URL}/api/v1/system-configs/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": userRole,
          ...(initData && { "x-init-data": initData }),
          "X-Access-Token": BACKEND_ENDPOINTS_ACCESS_TOKEN ?? "",
        },
        body: JSON.stringify(body),
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
    console.error("UPDATE system config error:", error)

    return NextResponse.json(
      { success: false, error: "Failed to update system config" },
      { status: 500 }
    )
  }
}
