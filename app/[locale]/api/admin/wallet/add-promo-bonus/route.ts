import { NextRequest, NextResponse } from "next/server";
const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL!;
const BACKEND_ENDPOINTS_ACCESS_TOKEN = process.env.BACKEND_ENDPOINTS_ACCESS_TOKEN;

/**
 * POST - Add Promo Bonus (ADMIN only)
 */
export async function POST(request: NextRequest) {
  try {
    const role = request.headers.get("x-user-role");
    const initData = request.headers.get("x-init-data");

    if (role !== "ADMIN" && role !== "AGENT") {
      return NextResponse.json(
        { error: "Forbidden: Admins and Agents only" },
        { status: 403 }
      );
    }

    if (!initData) {
      return NextResponse.json(
        { error: "Missing initData" },
        { status: 400 }
      );
    }

    const { telegramId, amount, agentId, adminTelegramId } = await request.json();

    // Validate required fields
    if (!telegramId || !amount || isNaN(Number(amount))) {
      return NextResponse.json(
        { error: "Missing or invalid telegramId/amount" },
        { status: 400 }
      );
    }

    const body = JSON.stringify({
      userTelegramId: Number(telegramId),
      amount: Number(amount),
      agentId: Number(agentId),
    });

    const response = await fetch(
      `${BACKEND_BASE_URL}/api/v1/secured/payment-orders/offline/admin/add-promotional-discount?adminTelegramId=${adminTelegramId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // "x-init-data": initData,
          "X-Access-Token": BACKEND_ENDPOINTS_ACCESS_TOKEN ?? "",
        },
        body
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error || "Backend error" },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Add promo bonus error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
