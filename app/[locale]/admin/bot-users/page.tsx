"use client"

import { useSearchParams } from "next/navigation"
import { userStore } from "@/lib/stores/user-store"
import { AdminBotUsers } from "@/components/admin/admin-bot-users"
import { AlertCircle } from "lucide-react"

export default function AdminBotUsersPage() {
  const searchParams = useSearchParams()
  const user = userStore((state) => state.user)
  const userRole = user?.role

  const queryAgentId = Number(searchParams.get("agentId") || 0)

  if (userRole !== "ADMIN") {
    return (
      <div className="p-6">
        <div className="flex items-center gap-3 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <h1 className="text-xl font-semibold">Access Denied</h1>
        </div>
        <p className="text-muted-foreground mt-2">
          This page is restricted to users with ADMIN role.
        </p>
      </div>
    )
  }

  return <AdminBotUsers defaultAgentId={queryAgentId || undefined} />
}
