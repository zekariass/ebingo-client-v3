import { type NextRequest, NextResponse } from "next/server";
import type { ApiResponse } from "@/lib/backend/types";

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL!;

/**
 * PATCH /[lang]/api/admin/transactions/:txnRef/status
 * Query: ?status=COMPLETED
 * Header: x-init-data
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ txnRef: string }> }
) {
  try {
    if (!BACKEND_BASE_URL) {
      throw new Error("BACKEND_BASE_URL is not defined");
    }

    // Must await params in Next.js 15+
    const { txnRef } = await context.params;

    if (!txnRef) {
      return NextResponse.json(
        { success: false, error: "Transaction reference is required" },
        { status: 400 }
      );
    }

    // Get `status` from query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    if (!status) {
      return NextResponse.json(
        { success: false, error: "Status query parameter is required" },
        { status: 400 }
      );
    }

    // Read initData from headers
    const initData = request.headers.get("x-init-data");
    if (!initData) {
      return NextResponse.json(
        { success: false, error: "Missing x-init-data header" },
        { status: 400 }
      );
    }

    // Build backend URL safely
    const backendUrl = `${BACKEND_BASE_URL}/api/v1/secured/transactions/${encodeURIComponent(
      txnRef
    )}/change-status?${new URLSearchParams({ status }).toString()}`;

    // Call backend
    const response = await fetch(backendUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-init-data": initData,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: result?.error || "Failed to update transaction status" },
        { status: response.status }
      );
    }

    const responseData: ApiResponse = {
      success: result.success ?? true,
      data: result.data ?? null,
      error: result.success ? null : result.message || "Failed to update transaction status",
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Change transaction status error:", error);
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
