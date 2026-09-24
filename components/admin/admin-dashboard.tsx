"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DollarSign, GamepadIcon, TrendingUp, RefreshCw, Wallet, ArrowDownToLine } from "lucide-react"
import { useAdminStore } from "@/lib/stores/admin-store"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useAgentStore } from "@/lib/stores/agent-store"

/**
 * Admin dashboard component providing comprehensive platform management and analytics.
 * Displays key metrics, active rooms, recent transactions, and system controls.
 *
 * Features:
 * - Real-time platform statistics (deposits, revenue, games)
 * - Active rooms monitoring with status
 * - Total accounting summary
 * - Manual data refresh functionality
 * - Error handling and loading states
 * - Responsive grid layout for different screen sizes
 *
 * Data Sources:
 * - Daily accounting for the active agent
 * - Total accounting for the active agent
 * - Room management API
 *
 * @returns JSX element containing the complete admin dashboard
 *
 * @example
 * \`\`\`tsx
 * // Used in admin routes
 * <AdminDashboard />
 * \`\`\`
 */
export function AdminDashboard() {
  const { stats, rooms, isLoading, error, loadDashboardData, loadRooms, refreshData } = useAdminStore()

  const {t} = useTranslation('admin')
  const {activeAgentId} = useAgentStore();

  useEffect(() => {
    if (activeAgentId) {
      loadRooms(activeAgentId).then(() => loadDashboardData(activeAgentId))
    }
  }, [activeAgentId, loadDashboardData, loadRooms])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">Monitor and manage your bingo platform</p>
        </div>
        <Button onClick={() => activeAgentId && refreshData(activeAgentId)} disabled={isLoading || !activeAgentId} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deposits Today</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : `${stats.depositsToday} ETB`}</div>
            <p className="text-xs text-muted-foreground">{stats.withdrawalsToday} ETB withdrawn</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income Today</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : `${stats.netIncomeToday} ETB`}</div>
            <p className="text-xs text-muted-foreground">{stats.commissionToday} ETB commission</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bets Today</CardTitle>
            <GamepadIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : `${stats.betsToday} ETB`}</div>
            <p className="text-xs text-muted-foreground">{stats.prizesToday} ETB paid in prizes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Rooms</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : `${stats.openRooms} / ${stats.totalRooms}`}</div>
            <p className="text-xs text-muted-foreground">rooms currently open</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Active Rooms */}
        <Card>
          <CardHeader>
            <CardTitle>Active Rooms</CardTitle>
            <CardDescription>Currently open bingo rooms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rooms.length === 0 ? (
                <p className="text-sm text-muted-foreground">No rooms found</p>
              ) : (
                rooms.map((room) => (
                  <div key={room.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">{room.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {room.entryFee} ETB • capacity {room.capacity} • min {room.minPlayers} players
                      </div>
                    </div>
                    <Badge variant={room.status === "OPEN" ? "default" : "secondary"}>{room.status}</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Total Accounting */}
        <Card>
          <CardHeader>
            <CardTitle>Total Accounting</CardTitle>
            <CardDescription>All-time totals for this agent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Wallet className="h-4 w-4" />
                  Total Deposits
                </div>
                <div className="font-medium">{stats.totalDeposits} ETB</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ArrowDownToLine className="h-4 w-4" />
                  Total Withdrawals
                </div>
                <div className="font-medium">{stats.totalWithdrawals} ETB</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  Total Commission
                </div>
                <div className="font-medium">{stats.totalCommission} ETB</div>
              </div>
              <div className="flex items-center justify-between border-t pt-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <TrendingUp className="h-4 w-4" />
                  Total Net Income
                </div>
                <div className="font-bold">{stats.totalNetIncome} ETB</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
