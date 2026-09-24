import { type NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL!;

/**
 * PUT - Update a room (Admin only)
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    const { searchParams } = new URL(request.url)
    const agentId = searchParams.get("agentId")

    // Extract headers sent from the client
    const role = request.headers.get("x-user-role");
    const initData = request.headers.get("x-init-data");

    // Check for admin and valid Telegram initData
    if (!role || (role !== "ADMIN" && role !== "AGENT")) {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const updates = await request.json();

    // Forward update to backend
    const response = await fetch(`${BACKEND_BASE_URL}/api/v1/secured/rooms/${id}?agentId=${agentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Access-Token": process.env.BACKEND_ENDPOINTS_ACCESS_TOKEN ?? "",
        ...(initData && { "x-init-data": initData }),
      },
      body: JSON.stringify({ id, ...updates }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Room update backend error:", result);
      return NextResponse.json(
        { error: result?.error || "Backend error" },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (err) {
    console.error("Error updating room:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE - Delete a room (Admin only)
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const role = request.headers.get("x-user-role");
    const initData = request.headers.get("x-init-data");

    const { searchParams } = new URL(request.url)
    const agentId = searchParams.get("agentId")

    if (!role || role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    // Call backend delete endpoint
    const response = await fetch(`${BACKEND_BASE_URL}/api/v1/secured/rooms/${id}?agentId=${agentId}`, {
      method: "DELETE",
      headers: {
        ...(initData && { "x-init-data": initData }),
        "X-Access-Token": process.env.BACKEND_ENDPOINTS_ACCESS_TOKEN ?? "",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: result?.error || "Backend error. Room not deleted" },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete room error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
