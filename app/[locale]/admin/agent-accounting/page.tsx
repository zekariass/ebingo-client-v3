"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { userStore } from "@/lib/stores/user-store"
import { AdminAgentDailyAccounting } from "@/components/admin/admin-agent-daily-accounting"
import { AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function AdminAgentAccountingPage() {
  const searchParams = useSearchParams()
  const { user } = userStore.getState()
  const userRole = user?.role
  
  const [agentId, setAgentId] = useState<number | null>(null)
  const [targetAgentId, setTargetAgentId] = useState<number | null>(null)

  useEffect(() => {
    // Get agentId from query params
    const agentParam = searchParams.get("agentId")
    if (agentParam) {
      const id = parseInt(agentParam, 10)
      if (!isNaN(id)) {
        setTargetAgentId(id)
        // Current agent is the logged-in admin user
        if (user?.agentId) {
          setAgentId(user.agentId)
        }
      }
    }
  }, [searchParams, user?.agentId])

  // Check if user has ADMIN role
  if (userRole !== "ADMIN") {
    return (
      <div className="p-6">
        <div className="flex items-center gap-3 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <h1 className="text-xl font-semibold">Access Denied</h1>
        </div>
        <p className="text-muted-foreground mt-2">
          This page is restricted to users with ADMIN role only.
        </p>
      </div>
    )
  }

  // Check if targetAgentId is provided
  if (!targetAgentId) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-3 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <h1 className="text-xl font-semibold">Invalid Request</h1>
        </div>
        <p className="text-muted-foreground mt-2">
          Agent ID is required to view accounting details.
        </p>
      </div>
    )
  }

  return (
    <AdminAgentDailyAccounting 
      // agentId={agentId || 0} 
      // targetAgentId={targetAgentId} 
    />
  )
}
