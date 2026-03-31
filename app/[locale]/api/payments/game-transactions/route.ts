"use server"

import { NextRequest, NextResponse } from "next/server"
import type { ApiResponse } from "@/lib/backend/types"

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL!
const BACKEND_ENDPOINTS_ACCESS_TOKEN = process.env.BACKEND_ENDPOINTS_ACCESS_TOKEN;

export async function GET(req: NextRequest) {
  try {
    if (!BACKEND_BASE_URL) throw new Error("BACKEND_BASE_URL is not defined")

    const initData = req.headers.get("x-init-data")
    if (!initData) {
      return NextResponse.json(
        { success: false, error: "Missing x-init-data header" },
        { status: 400 }
      )
    }

    const { searchParams } = req.nextUrl
    const page = searchParams.get("page") || "1"
    const size = searchParams.get("size") || "10"
    const agentId = searchParams.get("agentId") || "0"
    const sortBy = "createdAt"

    const res = await fetch(
      `${BACKEND_BASE_URL}/api/v1/secured/game/transaction?agentId=${agentId}&page=${page}&size=${size}&sortBy=${sortBy}`,
      {
        headers: {
          "Content-Type": "application/json",
          "x-init-data": initData,
          "X-Access-Token": BACKEND_ENDPOINTS_ACCESS_TOKEN ?? "",
        },
        cache: "no-store",
      }
    )

    const json = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: json?.error || "Failed to fetch game transactions" },
        { status: res.status }
      )
    }

    const responseData: ApiResponse = {
      success: true,
      data: json.data,
      error: null,
    }

    return NextResponse.json(responseData)
  } catch (err) {
    console.error("Game transaction route error:", err)
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
