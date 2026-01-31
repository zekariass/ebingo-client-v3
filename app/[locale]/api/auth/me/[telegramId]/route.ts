import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL!;

export async function GET(req: NextRequest, context: { params: Promise<{ telegramId: string }> }) {
  try {
    const { telegramId } = await context.params;

    const { searchParams } = new URL(req.url)
    const agentId = searchParams.get("agentId")

    if (!telegramId) {
      return NextResponse.json(
        { success: false, error: "telegramId is required" },
        { status: 400 }
      );
    }

    const res = await fetch(`${BACKEND_BASE_URL}/api/v1/secured/user-profile/${telegramId}?agentId=${agentId}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch profile" },
        { status: res.status }
      );
    }

    const result = await res.json();
    const { data } = result;

    return NextResponse.json({ success: true, data, error: null });
  } catch (err) {
    console.error("Error fetching profile:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
