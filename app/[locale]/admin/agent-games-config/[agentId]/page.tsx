"use client"

import { use } from "react"
import { AgentGamesDetailConfig } from "@/components/admin/agent-games-detail-config"

interface PageProps {
  params: Promise<{
    agentId: string
  }>
}

export default function AgentGamesDetailPage({ params }: PageProps) {
  const { agentId } = use(params)
  const agentIdNum = parseInt(agentId)

  if (isNaN(agentIdNum)) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-destructive">Invalid Agent ID</h1>
        <p className="text-muted-foreground">The provided agent ID is not valid.</p>
      </div>
    )
  }

  return <AgentGamesDetailConfig agentId={agentIdNum} />
}
