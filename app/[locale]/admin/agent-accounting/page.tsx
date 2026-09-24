"use client"

import { useSearchParams } from "next/navigation"
import { userStore } from "@/lib/stores/user-store"
import { AdminAgentDailyAccounting } from "@/components/admin/admin-agent-daily-accounting"
import { AlertCircle } from "lucide-react"

export default function AdminAgentAccountingPage() {
  const searchParams = useSearchParams()
  const user = userStore((state) => state.user)
  const userRole = user?.role

  // The agent whose accounting is being viewed
  const targetAgentId = Number(
    searchParams.get("agentId") || searchParams.get("targetAgentId") || 0
  )

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

  return <AdminAgentDailyAccounting targetAgentId={targetAgentId} />
}
