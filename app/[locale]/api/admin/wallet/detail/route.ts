import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL!;
const BACKEND_ENDPOINTS_ACCESS_TOKEN = process.env.BACKEND_ENDPOINTS_ACCESS_TOKEN;

export async function GET(request: NextRequest) {
  try {
    const role = request.headers.get("x-user-role");
    const initData = request.headers.get("x-init-data");

    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get("phoneNumber");
    const agentId = searchParams.get("agentId");

    if (!phoneNumber) {
      return NextResponse.json({ error: "Missing phoneNumber" }, { status: 400 });
    }

    const backendUrl = new URL(
      `${BACKEND_BASE_URL}/api/v1/secured/wallet/details`
    );
    backendUrl.searchParams.set("userPhone", phoneNumber);
    if (agentId) backendUrl.searchParams.set("agentId", agentId);

    const response = await fetch(backendUrl.toString(), {
      headers: {
        "Content-Type": "application/json",
        ...(initData && { "x-init-data": initData }),
        "X-Access-Token": BACKEND_ENDPOINTS_ACCESS_TOKEN ?? "",
      },
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: result.error || result.message || "Backend error" },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (err) {
    console.error("Fetch wallet details error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
