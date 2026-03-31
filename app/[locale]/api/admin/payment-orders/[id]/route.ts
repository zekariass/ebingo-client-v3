import { NextRequest, NextResponse } from "next/server"
import axios from "axios"

const BACKEND_ENDPOINTS_ACCESS_TOKEN = process.env.BACKEND_ENDPOINTS_ACCESS_TOKEN;

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const role = req.headers.get("x-user-role")
    // const initData = req.headers.get("x-init-data")

    if (role !== "ADMIN" && role !== "AGENT") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      )
    }

    const backendRes = await axios.get(
      `${process.env.BACKEND_BASE_URL}/api/v1/secured/payment-orders/offline/detail/${params.id}`,
      {
        headers: {
          "x-user-role": role,
          "X-Access-Token": BACKEND_ENDPOINTS_ACCESS_TOKEN ?? "",
          // "x-init-data": initData || "",
        },
      }
    )

    return NextResponse.json(backendRes.data)
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch order detail" },
      { status: 500 }
    )
  }
}
