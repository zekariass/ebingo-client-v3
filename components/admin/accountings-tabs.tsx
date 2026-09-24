"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminDailyAccountings } from "./admin-daily-accountings"
import { AdminTotalAccountings } from "./admin-total-accountings"

interface AccountingsTabsProps {
  agentId?: number
  initialTab?: string
}

export function AccountingsTabs({ agentId, initialTab = "daily" }: AccountingsTabsProps) {
  return (
    <Tabs defaultValue={initialTab === "total" ? "total" : "daily"} className="space-y-4">
      <TabsList>
        <TabsTrigger value="daily">Daily</TabsTrigger>
        <TabsTrigger value="total">Total</TabsTrigger>
      </TabsList>

      <TabsContent value="daily">
        <AdminDailyAccountings />
      </TabsContent>
      <TabsContent value="total">
        <AdminTotalAccountings agentId={agentId} />
      </TabsContent>
    </Tabs>
  )
}
