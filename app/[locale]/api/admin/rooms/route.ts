import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL!;

/**
 * GET - Fetch all rooms (ADMIN only)
 */
export async function GET(request: NextRequest) {
  try {
    // Read role and initData from headers (sent by frontend)
    const role = request.headers.get("x-user-role");
    const initData = request.headers.get("x-init-data");

    const { searchParams } = new URL(request.url)
    const agentId = searchParams.get("agentId")

    // Check role
    if (role !== "ADMIN" && role !== "AGENT") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    if (!initData) {
      return NextResponse.json({ error: "Missing initData" }, { status: 400 });
    }

    // Call backend API with initData for verification
    const response = await fetch(`${BACKEND_BASE_URL}/api/v1/secured/rooms?agentId=${agentId}`, {
      headers: {
        "Content-Type": "application/json",
        "x-init-data": initData, // Pass to backend for verification
      },
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: result?.error || "Backend error" },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (err) {
    console.error("Admin rooms error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST - Create a room (ADMIN only)
 */
// export async function POST(request: NextRequest) {
//   try {
//     // Read role and initData from headers
//     const role = request.headers.get("x-user-role");
//     const initData = request.headers.get("x-init-data");

//     if (role !== "ADMIN") {
//       return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
//     }

//     if (!initData) {
//       return NextResponse.json({ error: "Missing initData" }, { status: 400 });
//     }

//     const { name, entryFee, capacity, minPlayers, pattern } = await request.json();

//     if (!name || !capacity || !minPlayers || !pattern) {
//       return NextResponse.json(
//         { error: "Missing required fields or invalid field name" },
//         { status: 400 }
//       );
//     }

//     const body = JSON.stringify({ name, entryFee: Number(entryFee), capacity: Number(capacity), minPlayers: Number(minPlayers), pattern })

//     // Forward data to backend for verification and room creation
//     const response = await fetch(`${BACKEND_BASE_URL}/api/v1/secured/rooms`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "x-init-data": initData,
//       },
//       body:body,
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       return NextResponse.json({ error: data?.error || "Backend error" }, { status: response.status });
//     }

//     return NextResponse.json({ success: true, data });
//   } catch (err) {
//     console.error("Create room error:", err);
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
//   }
// }




/**
 * POST - Create a room (ADMIN only)
 */
export async function POST(request: NextRequest) {
  try {
    const role = request.headers.get("x-user-role");
    // const initData = request.headers.get("x-init-data");

    const { searchParams } = new URL(request.url)
    const telegramId = searchParams.get("telegramId")

    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    // if (!initData) {
    //   return NextResponse.json({ error: "Missing initData" }, { status: 400 });
    // }

    const {
      agentId,
      name,
      entryFee,
      capacity,
      minPlayers,
      pattern,
      status = "OPEN",
      botAllowed = false,
      minBots = 0,
      maxBots = 0,
      minDraws = 6,
      maxDraws = 12,
      fakeWinEnabled = false,
      commissionRate = 0,
    } = await request.json();

    // Validate required fields
    if (!name || !capacity || !minPlayers || !pattern) {
      return NextResponse.json(
        { error: "Missing required fields or invalid field" },
        { status: 400 }
      );
    }

    // Ensure bot numbers are consistent
    if (botAllowed && minBots > maxBots) {
      return NextResponse.json(
        { error: "minBots cannot be greater than maxBots" },
        { status: 400 }
      );
    }

    const body = JSON.stringify({
      agentId,
      name,
      entryFee: Number(entryFee),
      capacity: Number(capacity),
      minPlayers: Number(minPlayers),
      pattern,
      status,
      botAllowed,
      minBots: Number(minBots),
      maxBots: Number(maxBots),
      minDraws: Number(minDraws),
      maxDraws: Number(maxDraws),
      fakeWinEnabled,
      commissionRate: Number(commissionRate),
    });

    const response = await fetch(`${BACKEND_BASE_URL}/api/v1/secured/rooms?telegramId=${telegramId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // "x-init-data": initData,
      },
      body,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data?.error || "Backend error" }, { status: response.status });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Create room error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
