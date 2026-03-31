import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL!;
const BACKEND_ENDPOINTS_ACCESS_TOKEN = process.env.BACKEND_ENDPOINTS_ACCESS_TOKEN;

export async function GET(request: NextRequest) {
  try {
    const role = request.headers.get("x-user-role");
    const initData = request.headers.get("x-init-data");

    // Optional: restrict access to admins
    // if (role !== "ADMIN") {
    //   return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    // }

    if (!initData) {
      return NextResponse.json({ error: "Missing initData" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get("phoneNumber");
    const agentId = searchParams.get("agentId");

    if (!phoneNumber) {
      return NextResponse.json({ error: "Missing phoneNumber" }, { status: 400 });
    }

    const response = await fetch(
      `${BACKEND_BASE_URL}/api/v1/secured/wallet/details?userPhone=${encodeURIComponent(phoneNumber)}&agentId=${agentId}`,
      {
        headers: {
          "Content-Type": "application/json",
          "x-init-data": initData,
          "x-user-role": role || "",
          "X-Access-Token": BACKEND_ENDPOINTS_ACCESS_TOKEN ?? "",
        },
        cache: "no-store",
      }
    );

    const result = await response.json();

    // console.log("=====================>>> Fetch wallet details response:", result);

    if (!response.ok) {
      return NextResponse.json(
        { error: result.error || "Backend error" },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (err) {
    console.error("Fetch wallet details error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
