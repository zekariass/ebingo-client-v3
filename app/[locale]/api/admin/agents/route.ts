import { NextRequest, NextResponse } from "next/server"
import { Agent } from "@/lib/stores/agent-store"

// Strip sensitive fields (botToken) before sending to client
function sanitizeAgent(agent: Agent): Omit<Agent, "botToken"> {
  const { botToken, ...safe } = agent
  return safe
}

interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
  empty: boolean
}

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "0")
    const size = parseInt(searchParams.get("size") || "10")
    const sortBy = searchParams.get("sortBy") || "id"
    const search = searchParams.get("search") || ""

    // Build the backend URL with parameters
    const backendUrl = process.env.BACKEND_BASE_URL
    const BACKEND_ENDPOINTS_ACCESS_TOKEN = process.env.BACKEND_ENDPOINTS_ACCESS_TOKEN
    
    if (!backendUrl) {
      throw new Error("BACKEND_BASE_URL environment variable is not set")
    }

    const response = await fetch(`${backendUrl}/api/v1/agents`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.INTERNAL_API_KEY || ""}`,
        "X-Access-Token": BACKEND_ENDPOINTS_ACCESS_TOKEN ?? "",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Backend API error:", response.status, errorText)
      throw new Error(`Backend API error: ${response.status} ${errorText}`)
    }

    const result: ApiResponse<PageResponse<Agent> | Agent[]> = await response.json()

    // Backend returns a plain list; normalize into the paged shape the UI expects
    const allAgents: Agent[] = Array.isArray(result.data)
      ? result.data
      : result.data?.content ?? []

    const searchLower = search.toLowerCase()
    const filtered = search
      ? allAgents.filter(agent =>
          agent.name?.toLowerCase().includes(searchLower) ||
          agent.code?.toLowerCase().includes(searchLower) ||
          agent.email?.toLowerCase().includes(searchLower) ||
          agent.phoneNumber?.toLowerCase().includes(searchLower)
        )
      : allAgents

    const totalElements = filtered.length
    const totalPages = Math.max(1, Math.ceil(totalElements / size))
    const content = filtered.slice(page * size, (page + 1) * size)

    return NextResponse.json({
      ...result,
      data: {
        content: content.map(a => sanitizeAgent(a) as Agent),
        page,
        size,
        totalElements,
        totalPages,
        first: page === 0,
        last: page >= totalPages - 1,
        empty: content.length === 0,
      } satisfies PageResponse<Omit<Agent, "botToken">>,
    })
  } catch (error) {
    console.error("Error fetching agents:", error)
    return NextResponse.json(
      { 
        success: false, 
        statusCode: 500,
        message: "Failed to fetch agents",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

/**
 * POST - Create a new agent (ADMIN only)
 * Proxies to POST /api/v1/admin/agents and preserves the backend
 * status code + standard envelope so the client can distinguish
 * 400 (field errors) and 409 (duplicate code/phone/email).
 */
export async function POST(request: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_BASE_URL
    const BACKEND_ENDPOINTS_ACCESS_TOKEN = process.env.BACKEND_ENDPOINTS_ACCESS_TOKEN

    if (!backendUrl) {
      throw new Error("BACKEND_BASE_URL environment variable is not set")
    }

    const role = request.headers.get("x-user-role")
    if (role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          statusCode: 403,
          message: "Forbidden: Admins only",
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      )
    }

    const body = await request.json()

    const response = await fetch(`${backendUrl}/api/v1/admin/agents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.INTERNAL_API_KEY || ""}`,
        "X-Access-Token": BACKEND_ENDPOINTS_ACCESS_TOKEN ?? "",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    })

    const result = await response.json().catch(() => null)

    if (!response.ok) {
      console.error("Create agent backend error:", response.status, result)
      return NextResponse.json(
        result ?? {
          success: false,
          statusCode: response.status,
          message: "Backend rejected create request",
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      )
    }

    // Strip botToken before returning to client
    if (result?.data) {
      result.data = sanitizeAgent(result.data) as Agent
    }

    return NextResponse.json(result, { status: response.status })
  } catch (error) {
    console.error("Error creating agent:", error)
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: "Failed to create agent",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          statusCode: 400,
          message: "Agent ID is required",
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      )
    }

    const backendUrl = process.env.BACKEND_BASE_URL
    const BACKEND_ENDPOINTS_ACCESS_TOKEN = process.env.BACKEND_ENDPOINTS_ACCESS_TOKEN
    
    if (!backendUrl) {
      throw new Error("BACKEND_BASE_URL environment variable is not set")
    }

    const response = await fetch(`${backendUrl}/api/v1/admin/agents/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.INTERNAL_API_KEY || ""}`,
        "X-Access-Token": BACKEND_ENDPOINTS_ACCESS_TOKEN ?? "",
      },
      body: JSON.stringify(updateData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Backend API error:", response.status, errorText)
      throw new Error(`Backend API error: ${response.status} ${errorText}`)
    }

    const result: ApiResponse<Agent> = await response.json()
    // Strip botToken before returning to client
    if (result.data) {
      result.data = sanitizeAgent(result.data) as Agent
    }
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error updating agent:", error)
    return NextResponse.json(
      { 
        success: false, 
        statusCode: 500,
        message: "Failed to update agent",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
