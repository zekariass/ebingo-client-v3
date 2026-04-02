import { ApiResponse } from "@/lib/backend/types";
import { NextRequest, NextResponse } from "next/server";
const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL!
const BACKEND_ENDPOINTS_ACCESS_TOKEN = process.env.BACKEND_ENDPOINTS_ACCESS_TOKEN

// Strip sensitive fields before sending to client
function sanitizeAgent(agent: Record<string, any>) {
  const { botToken, ...safe } = agent
  return safe
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