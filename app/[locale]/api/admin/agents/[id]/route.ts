import { NextRequest, NextResponse } from "next/server"
import { Agent } from "@/lib/stores/agent-store"

interface ApiResponse<T> {
  success: boolean
  statusCode: number
  message: string
  error?: string
  errors?: Map<string, string>
  path?: string
  data: T
  timestamp: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const agentId = parseInt(id)

    if (isNaN(agentId)) {
      return NextResponse.json(
        { 
          success: false, 
          statusCode: 400,
          message: "Invalid agent ID",
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      )
    }

    const backendUrl = process.env.BACKEND_BASE_URL
    if (!backendUrl) {
      throw new Error("BACKEND_BASE_URL environment variable is not set")
    }

    const response = await fetch(`${backendUrl}/api/v1/agents/${agentId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.INTERNAL_API_KEY || ""}`,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { 
            success: false, 
            statusCode: 404,
            message: "Agent not found",
            timestamp: new Date().toISOString()
          },
          { status: 404 }
        )
      }

      const errorText = await response.text()
      console.error("Backend API error:", response.status, errorText)
      throw new Error(`Backend API error: ${response.status} ${errorText}`)
    }

    const result: ApiResponse<Agent> = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching agent:", error)
    return NextResponse.json(
      { 
        success: false, 
        statusCode: 500,
        message: "Failed to fetch agent",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// export async function PUT(
//   request: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id } = await params
//     const agentId = parseInt(id)
//     const body = await request.json()

//     if (isNaN(agentId)) {
//       return NextResponse.json(
//         { 
//           success: false, 
//           statusCode: 400,
//           message: "Invalid agent ID",
//           timestamp: new Date().toISOString()
//         },
//         { status: 400 }
//       )
//     }

//     const backendUrl = process.env.BACKEND_BASE_URL
//     if (!backendUrl) {
//       throw new Error("BACKEND_BASE_URL environment variable is not set")
//     }

//     console.log(">>>>>>>>>>>>>>>> Updating agent with ID:", agentId)
//     console.log(">>>>>>>>>>>>>>>> Request body:", body)

//     const response = await fetch(`${backendUrl}/api/v1/agents/${agentId}`, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(body),
//     })

//     if (!response.ok) {
//       if (response.status === 404) {
//         return NextResponse.json(
//           { 
//             success: false, 
//             statusCode: 404,
//             message: "Agent not found",
//             timestamp: new Date().toISOString()
//           },
//           { status: 404 }
//         )
//       }

//       const errorText = await response.text()
//       console.error("Backend API error:", response.status, errorText)
//       throw new Error(`Backend API error: ${response.status} ${errorText}`)
//     }

//     const result: ApiResponse<Agent> = await response.json()
//     return NextResponse.json(result)
//   } catch (error) {
//     console.error("Error updating agent:", error)
//     return NextResponse.json(
//       { 
//         success: false, 
//         statusCode: 500,
//         message: "Failed to update agent",
//         error: error instanceof Error ? error.message : "Unknown error",
//         timestamp: new Date().toISOString()
//       },
//       { status: 500 }
//     )
//   }
// }





type AgentUpdateDto = {
  name?: string
  phoneNumber?: string
  email?: string
  contactName?: string
  isActive?: boolean
  commissionRate?: number | string // BigDecimal-friendly
  botToken?: string
  botUsername?: string
  contactAddress?: string
}

// helper: remove undefined fields so backend gets only what was provided
function stripUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Partial<T>
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const agentId = Number.parseInt(id, 10)

    if (Number.isNaN(agentId)) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: "Invalid agent ID",
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      )
    }

    const backendUrl = process.env.BACKEND_BASE_URL
    if (!backendUrl) throw new Error("BACKEND_BASE_URL environment variable is not set")

    const body = await request.json()

    // ✅ whitelist only fields that exist on AgentUpdateDto
    const updateDto: AgentUpdateDto = stripUndefined({
      name: body?.name,
      phoneNumber: body?.phoneNumber,
      email: body?.email,
      contactName: body?.contactName,
      isActive: body?.isActive,
      commissionRate: body?.commissionRate,
      botToken: body?.botToken,
      botUsername: body?.botUsername,
      contactAddress: body?.contactAddress,
    })

    console.log(">>>>>>>>>>>>>>>> Updating agent with ID:", agentId)
    console.log(">>>>>>>>>>>>>>>> Forwarding update DTO:", updateDto)

    const response = await fetch(`${backendUrl}/api/v1/agents/${agentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        // Forward auth if you use it:
        ...(request.headers.get("authorization")
          ? { Authorization: request.headers.get("authorization")! }
          : {}),
      },
      body: JSON.stringify(updateDto),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Backend API error:", response.status, errorText)

      return NextResponse.json(
        {
          success: false,
          statusCode: response.status,
          message:
            response.status === 404 ? "Agent not found" : "Backend rejected update request",
          error: errorText,
          path: `/api/v1/agents/${agentId}`,
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      )
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error updating agent:", error)
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: "Failed to update agent",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

