import { type NextRequest, NextResponse } from "next/server";
import type { ApiResponse } from "@/lib/backend/types";

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL!;
const BACKEND_ENDPOINTS_ACCESS_TOKEN = process.env.BACKEND_ENDPOINTS_ACCESS_TOKEN;

/**
 * GET /[lang]/api/admin/transactions/by-status
 * Query Params: status, type, page, size, sortBy
 * Header: x-init-data
 */
export async function GET(request: NextRequest) {
  try {
    if (!BACKEND_BASE_URL) {
      throw new Error("BACKEND_BASE_URL is not defined");
    }

    // Read initData from headers
    const initData = request.headers.get("x-init-data");
    if (!initData) {
      return NextResponse.json(
        { success: false, error: "Missing x-init-data header" },
        { status: 400 }
      );
    }

    // Extract query params from request
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";
    const type = searchParams.get("type") || "";
    const page = searchParams.get("page") || "0";
    const size = searchParams.get("size") || "10";
    const sortBy = searchParams.get("sortBy") || "createdat";
    const agentId = searchParams.get("agentId");

    // Construct backend URL with encoded params
    const backendUrl = `${BACKEND_BASE_URL}/api/v1/secured/transactions/by-status?` +
      new URLSearchParams({ status, type, page, size, sortBy }).toString();

    // Call backend
    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Access-Token": BACKEND_ENDPOINTS_ACCESS_TOKEN ?? "",
        // "x-init-data": initData,
      },
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: result?.error || "Backend transactions fetch failed" },
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
    console.error("Admin transactions error:", error);
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
