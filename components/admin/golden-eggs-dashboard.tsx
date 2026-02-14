"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { GoldenEggsAccounting } from "./golden-eggs-accounting"
import { GoldenEggsAgentGames } from "./golden-eggs-agent-games"
import { userStore } from "@/lib/stores/user-store"

export function GoldenEggsDashboard() {
  const { user } = userStore()
  const [activeTab, setActiveTab] = useState("accounting")

  // Check if user has access to this dashboard
  const hasAccess = user?.role === "ADMIN" || user?.role === "AGENT"

  if (!hasAccess) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              You do not have permission to access this page.
            </p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Golden Eggs Management</h1>
        <p className="text-muted-foreground">
          Manage Golden Eggs accounting and agent games
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="accounting">Accounting</TabsTrigger>
          <TabsTrigger value="agent-games">Agent Games</TabsTrigger>
        </TabsList>

        <TabsContent value="accounting" className="space-y-4">
          <GoldenEggsAccounting />
        </TabsContent>

        <TabsContent value="agent-games" className="space-y-4">
          <GoldenEggsAgentGames />
        </TabsContent>
      </Tabs>
    </div>
  )
}
