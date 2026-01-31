import { type NextRequest, NextResponse } from "next/server"

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL!

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const agentId = searchParams.get("agentId")

    if (!agentId) {
      return NextResponse.json(
        { success: false, error: "agentId is required" },
        { status: 400 }
      )
    }

    const response = await fetch(
      `${BACKEND_BASE_URL}/api/v1/public/rooms?agentId=${agentId}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      }
    )

    const result = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: result?.error || "Backend error" },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      error: null,
    })
  } catch (err) {
    console.error("Admin rooms error:", err)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}



// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json()
//     const { name, fee, capacity, nextStartAt } = body

//     if (!name || !fee || !capacity) {
//       const response: ApiResponse = {
//         success: false,
//         error: "Missing required fields: name, fee, capacity",
//       }
//       return NextResponse.json(response, { status: 400 })
//     }

//     const roomId = `room_${Date.now()}`
//     const room = gameState.createRoom({
//       id: roomId,
//       name,
//       fee,
//       capacity,
//       nextStartAt,
//     })

//     const response: ApiResponse = {
//       success: true,
//       data: room,
//       error: null,
//     }

//     return NextResponse.json(response, { status: 201 })
//   } catch (error) {
//     const response: ApiResponse = {
//       success: false,
//       error: error instanceof Error ? error.message : "Unknown error",
//     }
//     return NextResponse.json(response, { status: 500 })
//   }
// }
