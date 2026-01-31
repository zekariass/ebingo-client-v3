import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse } from "@/lib/backend/types";

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL!;

/**
 * POST /[lang]/api/payments/shop
 * Body: { amount: number, paymentMethodId: number, isMobileMoney?: boolean, bankName?: string, accountName?: string, accountNumber?: string, phoneNumber?: string, currency?: string, txnType?: string }
 * Description: Initiates a payment request for the Ethiopian shop
 */
export async function POST(req: NextRequest) {
  try {
    if (!BACKEND_BASE_URL) {
      throw new Error("BACKEND_BASE_URL is not defined");
    }

    const initData = req.headers.get("x-init-data");
    if (!initData) {
      return NextResponse.json({ success: false, error: "Missing x-init-data header" }, { status: 400 });
    }


    const body = await req.json();
    const { agentId, telegramId, amount, paymentMethodId, bankName, accountName, accountNumber, phoneNumber, currency, txnType, providerPaymentMethodName, withdrawalMode, password } = body;


    if (!amount || !paymentMethodId || !agentId) {
      return NextResponse.json({ success: false, error: "Missing required fields: amount or paymentMethodId or agentId" }, { status: 400 });
    }

    // Validate required fields based on isMobileMoney
    // if (isMobileMoney) {
    //   if (!phoneNumber) {
    //     return NextResponse.json({ success: false, error: "Phone number is required for mobile money withdrawals" }, { status: 400 });
    //   }
    // } else {
    //   if (!bankName || !accountName || !accountNumber) {
    //     return NextResponse.json({ success: false, error: "Bank name, account name, and account number are required for bank withdrawals" }, { status: 400 });
    //   }
    // }

    // Build payload dynamically
    const payload: Record<string, any> = {
      agentId,
      telegramId,
      amount,
      paymentMethodId,
      currency,
      txnType,
      providerPaymentMethodName,
      phoneNumber,
      bankName,
      accountName,
      accountNumber,
      withdrawalMode,
      password
    };

    // if (isMobileMoney) {
    //   payload.phoneNumber = phoneNumber;
    // } else {
    //   payload.bankName = bankName;
    //   payload.accountName = accountName;
    //   payload.accountNumber = accountNumber;
    // }

    // Forward request to backend
    const response = await fetch(`${BACKEND_BASE_URL}/api/v1/secured/payments/withdraw`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // "x-init-data": initData,
      },
      body: JSON.stringify(payload),
    });


    const result = await response.json();



    if (!response.ok) {
      return NextResponse.json({ success: false, error: result?.error || "Backend payment failed" }, { status: response.status });
    }

    const responseData: ApiResponse = {
      success: true,
      data: result.data,
      error: null,
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("Ethiopian shop payment route error:", error);
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
