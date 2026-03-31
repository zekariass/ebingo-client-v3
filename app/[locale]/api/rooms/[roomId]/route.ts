import { type NextRequest, NextResponse } from "next/server"
import type { ApiResponse } from "@/lib/backend/types"

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL!
const BACKEND_ENDPOINTS_ACCESS_TOKEN = process.env.BACKEND_ENDPOINTS_ACCESS_TOKEN;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ roomId: string }> } // 👈 params is async now
) {
  try {
    const { roomId } = await context.params; // 👈 await here

    const backendRes = await fetch(
      `${BACKEND_BASE_URL}/api/v1/public/rooms/${roomId}`,
      {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "X-Access-Token": BACKEND_ENDPOINTS_ACCESS_TOKEN ?? "",
        },
        cache: "no-store",
      }
    )

    if (!backendRes.ok) {
      const response: ApiResponse = {
        success: false,
        error: `Backend returned ${backendRes.status}`,
      }
      return NextResponse.json(response, { status: backendRes.status })
    }

    const { data } = await backendRes.json()


    if (!data) {
      const response: ApiResponse = {
        success: false,
        error: "Room not found",
      }
      return NextResponse.json(response, { status: 404 })
    }

    const response: ApiResponse = {
      success: true,
      data,
      error: null,
    }

    return NextResponse.json(response)
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
    return NextResponse.json(response, { status: 500 })
  }
}
