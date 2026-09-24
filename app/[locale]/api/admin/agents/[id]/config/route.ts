import { NextRequest, NextResponse } from "next/server"

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

// Matches AgentConfigDto returned by /api/v1/admin/agents/{agentId}/config
export interface AgentConfig {
  agentId: number
  name: string | null
  adminIds: string | null
  logoName: string | null
  supportContact: string | null
  supportUsername: string | null
  supportChannel: string | null
  bankDetails: Record<string, Record<string, any>> | null
  themeKey?: string | null
}

type AgentConfigUpdateDto = {
  name?: string | null
  adminIds?: string | null
  logoName?: string | null
  supportContact?: string | null
  supportUsername?: string | null
  supportChannel?: string | null
  bankDetails?: Record<string, Record<string, any>> | null
  themeKey?: string | null
}

function backendBase() {
  const backendUrl = process.env.BACKEND_BASE_URL
  if (!backendUrl) throw new Error("BACKEND_BASE_URL environment variable is not set")
  return backendUrl
}

function backendHeaders() {
  return {
    "Content-Type": "application/json",
    "X-Access-Token": process.env.BACKEND_ENDPOINTS_ACCESS_TOKEN ?? "",
  }
}

function invalidIdResponse() {
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const agentId = Number.parseInt(id, 10)
    if (Number.isNaN(agentId)) return invalidIdResponse()

    const response = await fetch(`${backendBase()}/api/v1/admin/agents/${agentId}/config`, {
      method: "GET",
      headers: backendHeaders(),
      cache: "no-store",
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Backend API error:", response.status, errorText)
      return NextResponse.json(
        {
          success: false,
          statusCode: response.status,
          message:
            response.status === 404
              ? `Agent config not found for agent ID: ${agentId}`
              : "Failed to fetch agent config",
          error: errorText,
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      )
    }

    const result: ApiResponse<AgentConfig> = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching agent config:", error)
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: "Failed to fetch agent config",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const agentId = Number.parseInt(id, 10)
    if (Number.isNaN(agentId)) return invalidIdResponse()

    const body = await request.json()

    // Whitelist only fields that exist on AgentConfigUpdateDto (replace semantics)
    const updateDto: AgentConfigUpdateDto = {
      name: body?.name ?? null,
      adminIds: body?.adminIds ?? null,
      logoName: body?.logoName ?? null,
      supportContact: body?.supportContact ?? null,
      supportUsername: body?.supportUsername ?? null,
      supportChannel: body?.supportChannel ?? null,
      bankDetails: body?.bankDetails ?? null,
      themeKey: body?.themeKey ?? null,
    }

    const response = await fetch(`${backendBase()}/api/v1/admin/agents/${agentId}/config`, {
      method: "PUT",
      headers: backendHeaders(),
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
            response.status === 404 ? "Agent not found" : "Backend rejected config update",
          error: errorText,
          path: `/api/v1/admin/agents/${agentId}/config`,
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      )
    }

    const result: ApiResponse<AgentConfig> = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error updating agent config:", error)
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: "Failed to update agent config",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
