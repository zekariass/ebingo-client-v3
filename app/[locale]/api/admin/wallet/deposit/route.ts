import { NextRequest, NextResponse } from "next/server";
const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL!;
/**
 * POST - Add Deposit Bonus (ADMIN only)
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
        console.error("======> Add deposit bonus error: Missing initData");
      return NextResponse.json(
        { error: "Missing initData" },
        { status: 400 }
      );
    }



    const { telegramId, amount, paymentProviderRef, paymentMethodCode, agentId } = await request.json();

    // Validate required fields
    if (!telegramId || !amount || !paymentMethodCode) {
        console.error("======> Add deposit error: Missing required fields");
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (isNaN(Number(amount))) {
        console.error("======> Add deposit error: Invalid amount");
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    const body = JSON.stringify({
      telegramId: Number(telegramId),
      amount: Number(amount),
      paymentMethodCode,
      agentId: agentId,
      paymentMethodId: null,
      instructionsUrl: null,
      paymentProviderRef: paymentProviderRef,
      metadata: null,
    });

    // console.log("======> Add deposit bonus response status:", JSON.stringify(body));


    const response = await fetch(
      `${BACKEND_BASE_URL}/api/v1/secured/payment-orders/offline/offline-deposit`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-init-data": initData,
        },
        body,
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
    console.error("Add deposit bonus error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
