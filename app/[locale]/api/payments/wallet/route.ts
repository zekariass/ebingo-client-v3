import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse } from "@/lib/backend/types";

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL!;
const BACKEND_ENDPOINTS_ACCESS_TOKEN = process.env.BACKEND_ENDPOINTS_ACCESS_TOKEN;

/**
 * GET /[lang]/api/wallet
 * Expects: x-init-data header
 */
export async function GET(req: NextRequest) {
  try {
    if (!BACKEND_BASE_URL) {
      throw new Error("BACKEND_BASE_URL is not defined");
    }


    // Read initData from headers
    const initData = req.headers.get("x-init-data");
    const { searchParams } = new URL(req.url)
    const telegramId = searchParams.get("telegramId")
    const agentId = searchParams.get("agentId")

    // console.log("==========================>>> wallet route called with telegramId:", telegramId, "agentId:", agentId);

    if (!initData) {
      return NextResponse.json(
        { success: false, error: "Missing x-init-data header" },
        { status: 400 }
      );
    }

    // Forward request to backend API
    const response = await fetch(`${BACKEND_BASE_URL}/api/v1/secured/wallet?telegramId=${telegramId}&agentId=${agentId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-init-data": initData,
        "X-Access-Token": BACKEND_ENDPOINTS_ACCESS_TOKEN ?? "",
      },
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: result?.error || "Failed to fetch wallet" },
        { status: response.status }
      );
    }

    const responseData: ApiResponse = {
      success: true,
      data: result.data,
      error: null,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Wallet route error:", error);
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
