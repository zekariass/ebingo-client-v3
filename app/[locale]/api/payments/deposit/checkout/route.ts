import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse } from "@/lib/backend/types";

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL!;
const BACKEND_ENDPOINTS_ACCESS_TOKEN = process.env.BACKEND_ENDPOINTS_ACCESS_TOKEN;

export async function POST(req: NextRequest) {
  try {
    if (!BACKEND_BASE_URL) {
      throw new Error("BACKEND_BASE_URL is not defined");
    }

    const initData = req.headers.get("x-init-data");
    if (!initData) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Missing x-init-data header" },
        { status: 400 }
      );
    }

    const body = await req.json();

    // Forward the request to backend
    const backendResponse = await fetch(
      `${BACKEND_BASE_URL}/api/v1/secured/payments/order/initiate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-init-data": initData,
          "X-Access-Token": BACKEND_ENDPOINTS_ACCESS_TOKEN ?? "",
        },
        body: JSON.stringify(body),
      }
    );

    const result = await backendResponse.json();

    // console.log("====================================>>>>: ", result)

    // Handle backend errors gracefully
    if (!backendResponse.ok || result.success === false) {
      console.error("Backend checkout failed:", result);

      return NextResponse.json<ApiResponse>(
        {
          success: false,
          status: result.statusCode || backendResponse.status,
          message:
            result.message ||
            result.error ||
            "Failed to complete checkout (backend error)",
          error: result.error || "Internal Server Error",
          data: result.data || null,
        },
        { status: backendResponse.status }
      );
    }

    // Successful response
    return NextResponse.json<ApiResponse>(
      {
        success: true,
        status: 200,
        message: result.message || "Checkout successful",
        data: result.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Checkout route error:", error);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        status: 500,
        message:
          error instanceof Error
            ? error.message
            : "Unexpected error during checkout",
        error: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
