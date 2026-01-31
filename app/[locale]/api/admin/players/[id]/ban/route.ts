// import { type NextRequest, NextResponse } from "next/server"
// import { prisma } from "@/lib/prisma"
// import { getServerSession } from "next-auth"
// import { authOptions } from "@/lib/auth"

// export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     const session = await getServerSession(authOptions)

//     if (!session?.user || session.user.role !== "admin") {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     const player = await prisma.user.update({
//       where: { id: params.id },
//       data: { status: "banned" },
//     })

//     return NextResponse.json({ success: true, data: player })
//   } catch (error) {
//     console.error("Ban player error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }
