"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminDailyAccounting } from "./admin-daily-accounting"
import { AdminTotalAccounting } from "./admin-total-accounting"

interface AccountingTabsProps {
  agentId?: number
  initialTab?: string
}

export function AccountingTabs({ agentId, initialTab = "daily" }: AccountingTabsProps) {
  return (
    <Tabs defaultValue={initialTab === "total" ? "total" : "daily"} className="space-y-4">
      <TabsList>
        <TabsTrigger value="daily">Daily</TabsTrigger>
        <TabsTrigger value="total">Total</TabsTrigger>
      </TabsList>

      <TabsContent value="daily">
        <AdminDailyAccounting agentId={agentId} />
      </TabsContent>
      <TabsContent value="total">
        <AdminTotalAccounting agentId={agentId} />
      </TabsContent>
    </Tabs>
  )
}
