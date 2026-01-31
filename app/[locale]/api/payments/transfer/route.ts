import { NextRequest, NextResponse } from "next/server"
import type { ApiResponse } from "@/lib/backend/types"
import { error } from "console"

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL!

/**
 * POST /[lang]/api/payments/transfer
 * Body: { amount: number, phone: string }
 */
export async function POST(req: NextRequest) {
  try {
    if (!BACKEND_BASE_URL) {
      throw new Error("BACKEND_BASE_URL is not defined")
    }

    // 🔹 Read Telegram init data from headers
    const initData = req.headers.get("x-init-data")
    if (!initData) {
      return NextResponse.json(
        { success: false, error: "Missing x-init-data header" },
        { status: 400 }
      )
    }

    // 🔹 Parse JSON request body
    const { amount, phone, agentId, userId } = await req.json()

    if (!amount || !phone) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: amount or phone" },
        { status: 400 }
      )
    }

    // 🔹 Validate phone format before forwarding
    const phoneRegex = /^(?:\+?251|0)(7|9)\d{8}$/;

    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { success: false, error: "Invalid phone number format. Use 09..., 07..., +2519..., or +2517..." },
        { status: 400 }
      )
    }

    // 🔹 Forward to backend
    const backendUrl = `${BACKEND_BASE_URL}/api/v1/secured/deposit/transfers?telegramId=${userId}`
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-init-data": initData,
      },
      body: JSON.stringify({ amount, phoneNumber: phone, agentId}),
    })

    const result = await response.json().catch(() => ({}))


    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: result?.error || result?.message || "Backend transfer failed" },
        { status: response.status }
      )
    }

    const responseData: ApiResponse = {
      success: true,
      data: result.data,
      error: null,
    }


    return NextResponse.json(responseData, { status: 200 })
  } catch (error) {
    console.error("Transfer route error:", error)
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
    return NextResponse.json(response, { status: 500 })
  }
}
