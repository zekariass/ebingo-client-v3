// import { type NextRequest, NextResponse } from "next/server"
// import { prisma } from "@/lib/prisma"
// import { getServerSession } from "next-auth"
// import { authOptions } from "@/lib/auth"

// export async function GET(request: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions)

//     if (!session?.user || session.user.role !== "admin") {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     const { searchParams } = new URL(request.url)
//     const search = searchParams.get("search")

//     const where = search
//       ? {
//           OR: [
//             { name: { contains: search, mode: "insensitive" as const } },
//             { email: { contains: search, mode: "insensitive" as const } },
//           ],
//         }
//       : {}

//     const players = await prisma.user.findMany({
//       where: {
//         ...where,
//         role: "player",
//       },
//       include: {
//         _count: {
//           select: { gameEntries: true },
//         },
//       },
//       orderBy: { createdAt: "desc" },
//     })

//     const playersWithStats = players.map((player) => ({
//       ...player,
//       gamesPlayed: player._count.gameEntries,
//       winRate: Math.random() * 20, // Mock - would calculate from actual wins
//     }))

//     return NextResponse.json({ success: true, data: playersWithStats })
//   } catch (error) {
//     console.error("Admin players error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }
