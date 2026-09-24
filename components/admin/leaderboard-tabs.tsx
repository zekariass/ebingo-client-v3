"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DailyLeaderboardPage from "./admin-daily-leaderboard"
import TotalLeaderboardPage from "./admin-total-leaderboard"

export function LeaderboardTabs({ initialTab = "daily" }: { initialTab?: string }) {
  return (
    <Tabs defaultValue={initialTab === "total" ? "total" : "daily"} className="space-y-4">
      <TabsList>
        <TabsTrigger value="daily">Daily</TabsTrigger>
        <TabsTrigger value="total">Total</TabsTrigger>
      </TabsList>

      <TabsContent value="daily">
        <DailyLeaderboardPage />
      </TabsContent>
      <TabsContent value="total">
        <TotalLeaderboardPage />
      </TabsContent>
    </Tabs>
  )
}
