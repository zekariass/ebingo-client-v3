import { type NextRequest, NextResponse } from "next/server";
import type { ApiResponse } from "@/lib/backend/types";

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL!;
const BACKEND_ENDPOINTS_ACCESS_TOKEN = process.env.BACKEND_ENDPOINTS_ACCESS_TOKEN;

/**
 * GET /[lang]/api/admin/transactions
 * Query Params: agentId, status, type, page, size, sortBy
 */
export async function GET(request: NextRequest) {
  try {
    if (!BACKEND_BASE_URL) {
      throw new Error("BACKEND_BASE_URL is not defined");
    }

    const initData = request.headers.get("x-init-data");

    // Extract query params from request
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get("agentId");
    const page = searchParams.get("page") || "0";
    const size = searchParams.get("size") || "10";
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const sortBy = searchParams.get("sortBy");

    if (!agentId) {
      return NextResponse.json(
        { success: false, error: "agentId is required" },
        { status: 400 }
      );
    }

    // Construct backend URL with encoded params
    const params = new URLSearchParams({ agentId, page, size });
    if (status) params.set("status", status);
    if (type) params.set("type", type);
    if (sortBy) params.set("sortBy", sortBy);

    const backendUrl = `${BACKEND_BASE_URL}/api/v1/secured/transactions?${params.toString()}`;

    // Call backend
    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Access-Token": BACKEND_ENDPOINTS_ACCESS_TOKEN ?? "",
        ...(initData && { "x-init-data": initData }),
      },
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: result?.error || result?.message || "Backend transactions fetch failed" },
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
