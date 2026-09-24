"use client"

import { useSearchParams } from "next/navigation"
import { userStore } from "@/lib/stores/user-store"
import { AgentConfig } from "@/components/admin/agent-config"
import { AlertCircle } from "lucide-react"

export default function AgentConfigPage() {
  const searchParams = useSearchParams()
  const user = userStore((state) => state.user)
  const userRole = user?.role

  // Agents always manage their own config; admins can target any agent via ?agentId=
  const queryAgentId = Number(searchParams.get("agentId") || 0)
  const agentId = userRole === "AGENT" && user?.agentId ? user.agentId : queryAgentId

  if (userRole !== "ADMIN" && userRole !== "AGENT") {
    return (
      <div className="p-6">
        <div className="flex items-center gap-3 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <h1 className="text-xl font-semibold">Access Denied</h1>
        </div>
        <p className="text-muted-foreground mt-2">
          This page is restricted to users with ADMIN or AGENT role.
        </p>
      </div>
    )
  }

  if (!agentId) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-3 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <h1 className="text-xl font-semibold">Invalid Request</h1>
        </div>
        <p className="text-muted-foreground mt-2">
          Agent ID is required to view the agent config.
        </p>
      </div>
    )
  }

  return <AgentConfig agentId={agentId} />
}
