"use server"

import { NextRequest, NextResponse } from "next/server"
import type { ApiResponse } from "@/lib/backend/types"

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL!
const BACKEND_ENDPOINTS_ACCESS_TOKEN = process.env.BACKEND_ENDPOINTS_ACCESS_TOKEN
/**
 * GET - Fetch transactions using x-init-data
 */
export async function GET(req: NextRequest) {
  try {
    //  Validate backend base URL
    if (!BACKEND_BASE_URL) {
      return NextResponse.json(
        { success: false, error: "Server misconfiguration: BACKEND_BASE_URL is not defined" },
        { status: 500 }
      )
    }

    //  Validate header
    const initData = req.headers.get("x-init-data")
    if (!initData) {
      return NextResponse.json(
        { success: false, error: "Missing x-init-data header" },
        { status: 400 }
      )
    }

    //  Use nextUrl instead of new URL(req.url)
    const { searchParams } = req.nextUrl
    const agentId = searchParams.get("agentId") || "0"
    const telegramId = searchParams.get("telegramId") || "0"
    const page = searchParams.get("page") || "1"
    const size = searchParams.get("size") || "10"
    const sortBy = searchParams.get("sortBy") || "createdAt"

    //  Construct backend URL safely
    const backendUrl = new URL(`${BACKEND_BASE_URL}/api/v1/secured/transactions`)

    backendUrl.searchParams.set("agentId", agentId)
    backendUrl.searchParams.set("telegramId", telegramId)
    backendUrl.searchParams.set("page", page)
    backendUrl.searchParams.set("size", size)
    backendUrl.searchParams.set("sortBy", sortBy)

    //  Forward request to backend
    const response = await fetch(backendUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-init-data": initData,
        "X-Access-Token": BACKEND_ENDPOINTS_ACCESS_TOKEN ?? "",
      },
      cache: "no-store",
    })

    //  Handle non-JSON or broken backend responses safely
    let result: any
    try {
      result = await response.json()
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON returned from backend" },
        { status: 502 }
      )
    }

    //  Forward backend error codes cleanly
    if (!response.ok || result?.success === false) {
      return NextResponse.json(
        {
          success: false,
          error:
            result?.error ||
            result?.message ||
            `Backend error (${response.status})`,
        },
        { status: response.status }
      )
    }

    //  All good — forward data
    const responseData: ApiResponse = {
      success: true,
      data: result.data ?? result,
      error: null,
    }

    return NextResponse.json(responseData)
  } catch (err: unknown) {
    console.error("GET /api/payments/game-transactions error:", err)

    const message =
      err instanceof Error ? err.message : "Unexpected server error"

    const response: ApiResponse = {
      success: false,
      error: message,
    }

    return NextResponse.json(response, { status: 500 })
  }
}
