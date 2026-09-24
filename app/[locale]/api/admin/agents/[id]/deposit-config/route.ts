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

// Matches AgentDepositConfigDto from /api/v1/**/agents/{agentId}/deposit-config
interface AmountRule {
  rate: number
  fixed: number
  max: { isCapped: boolean; amount: number }
}

export interface AgentDepositConfig {
  agentId: number
  bonusAmount: AmountRule
  lockAmount: AmountRule
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

async function proxyError(response: Response, fallback: string) {
  const errorText = await response.text()
  console.error("Backend API error:", response.status, errorText)

  let message = fallback
  try {
    const parsed = JSON.parse(errorText)
    if (parsed?.message) message = parsed.message
  } catch {
    // non-JSON error body — keep fallback message
  }

  return NextResponse.json(
    {
      success: false,
      statusCode: response.status,
      message,
      error: errorText,
      timestamp: new Date().toISOString(),
    },
    { status: response.status }
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

    const response = await fetch(`${backendBase()}/api/v1/admin/agents/${agentId}/deposit-config`, {
      method: "GET",
      headers: backendHeaders(),
      cache: "no-store",
    })

    if (!response.ok) {
      return proxyError(
        response,
        response.status === 404 ? `Agent not found with ID: ${agentId}` : "Failed to fetch deposit config"
      )
    }

    const result: ApiResponse<AgentDepositConfig> = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching agent deposit config:", error)
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: "Failed to fetch deposit config",
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

    // Full replace — whitelist only the AgentDepositConfigDto fields (agentId comes from the path)
    const updateDto = {
      bonusAmount: {
        rate: body?.bonusAmount?.rate,
        fixed: body?.bonusAmount?.fixed,
        max: {
          isCapped: body?.bonusAmount?.max?.isCapped,
          amount: body?.bonusAmount?.max?.amount,
        },
      },
      lockAmount: {
        rate: body?.lockAmount?.rate,
        fixed: body?.lockAmount?.fixed,
        max: {
          isCapped: body?.lockAmount?.max?.isCapped,
          amount: body?.lockAmount?.max?.amount,
        },
      },
    }

    const response = await fetch(`${backendBase()}/api/v1/admin/agents/${agentId}/deposit-config`, {
      method: "PUT",
      headers: backendHeaders(),
      body: JSON.stringify(updateDto),
    })

    if (!response.ok) {
      return proxyError(
        response,
        response.status === 404 ? `Agent not found with ID: ${agentId}` : "Failed to update deposit config"
      )
    }

    const result: ApiResponse<AgentDepositConfig> = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error updating agent deposit config:", error)
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: "Failed to update deposit config",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const agentId = Number.parseInt(id, 10)
    if (Number.isNaN(agentId)) return invalidIdResponse()

    const response = await fetch(`${backendBase()}/api/v1/admin/agents/${agentId}/deposit-config`, {
      method: "DELETE",
      headers: backendHeaders(),
      cache: "no-store",
    })

    if (!response.ok) {
      return proxyError(
        response,
        response.status === 404 ? `Agent not found with ID: ${agentId}` : "Failed to delete deposit config"
      )
    }

    const result: ApiResponse<null> = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error deleting agent deposit config:", error)
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: "Failed to delete deposit config",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
