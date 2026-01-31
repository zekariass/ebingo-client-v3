// import { type NextRequest, NextResponse } from "next/server"
// import { gameState } from "@/lib/backend/game-state"
// import type { ApiResponse } from "@/lib/backend/types"

// export async function GET(request: NextRequest, { params }: { params: { roomId: string } }) {
//   try {
//     const room = gameState.getRoom(params.roomId)

//     if (!room) {
//       const response: ApiResponse = {
//         success: false,
//         error: "Room not found",
//       }
//       return NextResponse.json(response, { status: 404 })
//     }

//     const response: ApiResponse = {
//       success: true,
//       data: {
//         cards: room.availableCards,
//         totalCards: room.availableCards.length,
//       },
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
