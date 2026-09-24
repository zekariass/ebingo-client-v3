import { ApiResponse } from "@/lib/backend/types";
import { NextRequest, NextResponse } from "next/server";
const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL!
const BACKEND_ENDPOINTS_ACCESS_TOKEN = process.env.BACKEND_ENDPOINTS_ACCESS_TOKEN

// Strip sensitive fields before sending to client
function sanitizeAgent(agent: Record<string, any>) {
  const { botToken, commissionRate, ...safe } = agent
  return safe
}

// Fields an AGENT is allowed to change on their own record.
// Deliberately excludes: code, botToken, botUsername, commissionRate,
// isActive, isMaster — those remain admin-only.
type AgentSelfUpdateDto = {
  name?: string
  phoneNumber?: string
  email?: string
  contactName?: string
  contactAddress?: string
  themeKey?: string | null
}

// helper: remove undefined fields so backend gets only what was provided
function stripUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Partial<T>
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ agentId: string }> } // 
) {
  try {
    const { agentId } = await context.params; // 
    const backendRes = await fetch(
      `${BACKEND_BASE_URL}/api/v1/agents/${agentId}`,
      {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "X-Access-Token": BACKEND_ENDPOINTS_ACCESS_TOKEN ?? "",
        },
        cache: "no-store",
      }
    )
    if (!backendRes.ok) {
      const response: ApiResponse = {
        success: false,
        error: `Backend returned ${backendRes.status}`,
      }
      return NextResponse.json(response, { status: backendRes.status })
    }
    const { data } = await backendRes.json()

    // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>Agent data:", data)

    if (!data) {
      const response: ApiResponse = {
        success: false,
        error: "Agent not found",
      }
      return NextResponse.json(response, { status: 404 })
    }
    const response: ApiResponse = {
      success: true,
      data: sanitizeAgent(data),
        error: null,    
    }
    return NextResponse.json(response)
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
    return NextResponse.json(response, { status: 500 })
  }
}

/**
 * PUT /[lang]/api/agents/[agentId]
 * Self-service agent update. Agents may only edit their own record and only
 * "safe" fields — see AgentSelfUpdateDto. Forwards to the admin backend
 * endpoint since the backend exposes no PUT /api/v1/agents/{id}.
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId: agentIdParam } = await context.params
    const agentId = Number.parseInt(agentIdParam, 10)

    if (Number.isNaN(agentId)) {
      return NextResponse.json(
        { success: false, error: "Invalid agent ID" },
        { status: 400 }
      )
    }

    const userRole = request.headers.get("x-user-role")
    const callerAgentId = Number.parseInt(request.headers.get("x-agent-id") ?? "", 10)
    const initData = request.headers.get("x-init-data")

    if (userRole !== "AGENT" && userRole !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Agents may only touch their own record; admins may target any agent
    if (userRole === "AGENT" && callerAgentId !== agentId) {
      return NextResponse.json(
        { success: false, error: "Agents can only update their own profile" },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Whitelist only safe fields — never forward code, botToken, botUsername,
    // commissionRate, isActive, isMaster or anything else.
    const updateDto: AgentSelfUpdateDto = stripUndefined({
      name: body?.name,
      phoneNumber: body?.phoneNumber,
      email: body?.email,
      contactName: body?.contactName,
      contactAddress: body?.contactAddress,
      themeKey: body?.themeKey,
    })

    if (Object.keys(updateDto).length === 0) {
      return NextResponse.json(
        { success: false, error: "No editable fields provided" },
        { status: 400 }
      )
    }

    const backendRes = await fetch(`${BACKEND_BASE_URL}/api/v1/admin/agents/${agentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-user-role": userRole,
        "X-Access-Token": BACKEND_ENDPOINTS_ACCESS_TOKEN ?? "",
        ...(initData && { "x-init-data": initData }),
      },
      body: JSON.stringify(updateDto),
    })

    if (!backendRes.ok) {
      const errorText = await backendRes.text()
      console.error("Backend API error:", backendRes.status, errorText)
      return NextResponse.json(
        {
          success: false,
          error:
            backendRes.status === 404 ? "Agent not found" : "Backend rejected update request",
        },
        { status: backendRes.status }
      )
    }

    const result = await backendRes.json()
    if (result.data) {
      result.data = sanitizeAgent(result.data)
    }
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error updating agent:", error)
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
    return NextResponse.json(response, { status: 500 })
  }
}