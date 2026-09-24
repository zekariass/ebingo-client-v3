import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL!;
const BACKEND_ENDPOINTS_ACCESS_TOKEN = process.env.BACKEND_ENDPOINTS_ACCESS_TOKEN!;

export async function GET(request: NextRequest) {
  try {
    const role = request.headers.get("x-user-role");

    // const initData = request.headers.get("x-init-data");

    if (role !== "ADMIN" && role !== "AGENT") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    // if (!initData) {
    //   return NextResponse.json({ error: "Missing initData" }, { status: 400 });
    // }

    const initData = request.headers.get("x-init-data");

    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get("agentId");
    const page = searchParams.get("page") || "0";
    const size = searchParams.get("size") || "10";
    const orderBy = searchParams.get("orderBy") || "dailyWins";
    const includeBots = searchParams.get("includeBots") || "false";

    const backendUrl = new URL(`${BACKEND_BASE_URL}/api/v1/leaderboard/admin/daily`);
    backendUrl.searchParams.set("page", page);
    backendUrl.searchParams.set("size", size);
    backendUrl.searchParams.set("orderBy", orderBy);
    backendUrl.searchParams.set("includeBots", includeBots);
    if (agentId) backendUrl.searchParams.set("agentId", agentId);

    const response = await fetch(backendUrl.toString(), {
      headers: {
        "Content-Type": "application/json",
        ...(initData && { "x-init-data": initData }),
        "X-Access-Token": BACKEND_ENDPOINTS_ACCESS_TOKEN,
      },
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: result.error || "Backend error" }, { status: response.status });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (err) {
    console.error("Daily leaderboard error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
