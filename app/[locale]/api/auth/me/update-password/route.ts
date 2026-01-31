import { NextResponse } from "next/server"

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    // const initData = req.headers.get("x-init-data") ?? ""
    const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL

    if (!BACKEND_BASE_URL) throw new Error("Backend URL not configured")

    const { searchParams } = new URL(req.url)
    const agentId = searchParams.get("agentId")

    const response = await fetch(
      `${BACKEND_BASE_URL}/api/v1/public/user-profile/update-password`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          // "x-init-data": initData,
        },
        body: JSON.stringify({ ...body, agentId }),
      }
    )

    const data = await response.json()

    if (!response.ok || data?.success === false) {
      return NextResponse.json(
        { error: data?.message || "Backend error" },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (err: any) {
    console.error("API Route Error:", err)
    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    )
  }
}
