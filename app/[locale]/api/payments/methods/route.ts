import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse } from "@/lib/backend/types";
import { PaymentMethod } from "@/lib/types";

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL!;

/**
 * GET - Fetch payment methods using x-init-data
 */
export async function GET(request: NextRequest) {
  try {
    if (!BACKEND_BASE_URL) {
      throw new Error("BACKEND_BASE_URL is not defined");
    }

    // Read initData from headers
    // const initData = request.headers.get("x-init-data");

    // if (!initData) {
    //   return NextResponse.json(
    //     { success: false, error: "Missing x-init-data header" },
    //     { status: 400 }
    //   );
    // }

    const response = await fetch(`${BACKEND_BASE_URL}/api/v1/secured/payment-methods`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // "x-init-data": initData, // send to backend for verification
      },
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: result?.error || "Backend error" },
        { status: response.status }
      );
    }

    // Ensure data is an array of PaymentMethod
    const methods: PaymentMethod[] = Array.isArray(result.data) ? result.data : [];

    const responseData: ApiResponse = {
      success: true,
      data: methods,
      error: null,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
