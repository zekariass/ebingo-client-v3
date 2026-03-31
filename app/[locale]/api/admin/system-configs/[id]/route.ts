import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_BASE_URL!;
const BACKEND_ENDPOINTS_ACCESS_TOKEN = process.env.BACKEND_ENDPOINTS_ACCESS_TOKEN;

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userRole = req.headers.get("x-user-role") || ""
    // const initData = req.headers.get("x-init-data") || ""

    if (userRole !== "ADMIN" && userRole !== "AGENT") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    // if (!initData) {
    //   return NextResponse.json({ error: "Missing initData" }, { status: 400 });
    // }

    const body = await req.json()

    const response = await fetch(
      `${BACKEND_URL}/api/v1/system-configs/${params.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": userRole,
          // "x-init-data": initData,
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
