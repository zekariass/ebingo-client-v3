// import { type NextRequest, NextResponse } from "next/server"
// import { gameState } from "@/lib/backend/game-state"
// import type { ApiResponse } from "@/lib/backend/types"

// export async function POST(request: NextRequest, { params }: { params: { roomId: string } }) {
//   try {
//     const body = await request.json()
//     const { cardIds, playerId, playerName } = body

//     if (!cardIds || !Array.isArray(cardIds) || !playerId || !playerName) {
//       const response: ApiResponse = {
//         success: false,
//         error: "Missing required fields: cardIds, playerId, playerName",
//       }
//       return NextResponse.json(response, { status: 400 })
//     }

//     const success = gameState.joinRoom(params.roomId, playerId, playerName, cardIds)

//     if (!success) {
//       const response: ApiResponse = {
//         success: false,
//         error: "Failed to join room. Room may be full, in progress, or cards unavailable.",
//       }
//       return NextResponse.json(response, { status: 400 })
//     }

//     const response: ApiResponse = {
//       success: true,
//       data: { message: "Successfully joined room" },
//       error: null,
//     }

//     return NextResponse.json(response)
//   } catch (error) {
//     const response: ApiResponse = {
//       success: false,
//       error: error instanceof Error ? error.message : "Unknown error",
//     }
//     return NextResponse.json(response, { status: 500 })
//   }
// }
