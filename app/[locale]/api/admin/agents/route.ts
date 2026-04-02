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

    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy: sortBy,
    })

    // Add search parameter if provided (backend might need to implement this)
    if (search) {
      params.append("search", search)
    }

    const response = await fetch(`${backendUrl}/api/v1/agents?${params.toString()}`, {
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

    const result: ApiResponse<PageResponse<Agent>> = await response.json()

    // If search is provided and backend doesn't support it, filter client-side
    let filteredData = result.data
    if (search && result.data.content) {
      const filteredContent = result.data.content.filter(agent =>
        agent.name.toLowerCase().includes(search.toLowerCase()) ||
        agent.email?.toLowerCase().includes(search.toLowerCase()) ||
        agent.phoneNumber.toLowerCase().includes(search.toLowerCase())
      )
      
      filteredData = {
        ...result.data,
        content: filteredContent,
        totalElements: filteredContent.length,
        totalPages: Math.ceil(filteredContent.length / size),
      }
    }

    // Strip botToken from each agent before returning to client
    if (result.data?.content) {
      result.data.content = result.data.content.map(a => sanitizeAgent(a) as Agent)
    }
    return NextResponse.json(result)
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

    const response = await fetch(`${backendUrl}/api/v1/agents/${id}`, {
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
