"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, DollarSign, GamepadIcon, TrendingUp, Play, Pause, Settings, RefreshCw } from "lucide-react"
import { useAdminStore } from "@/lib/stores/admin-store"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useAgentStore } from "@/lib/stores/agent-store"

/**
 * Admin dashboard component providing comprehensive platform management and analytics.
 * Displays key metrics, active rooms, recent transactions, and system controls.
 *
 * Features:
 * - Real-time platform statistics (players, revenue, games)
 * - Active rooms monitoring with status and controls
 * - Recent transaction history display
 * - Manual data refresh functionality
 * - Error handling and loading states
 * - Responsive grid layout for different screen sizes
 *
 * Data Sources:
 * - Platform statistics from admin store
 * - Active rooms from room management API
 * - Transaction data from payment API
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
  const { stats, activeRooms, isLoading, error, loadDashboardData, refreshData } = useAdminStore()

  const {t, i18n} = useTranslation('admin')
  const {activeAgentId} = useAgentStore();

  useEffect(() => {
    loadDashboardData()
    const loadTransactions = async () => {
      try {
        const response = await fetch("/api/admin/transactions?limit=5")
        const result = await response.json()
        if (result.success) {
          // useAdminStore.setState({ recentTransactions: result.data })
        }
      } catch (error) {
        console.error("Failed to load transactions:", error)
      }
    }
    loadTransactions()
  }, [loadDashboardData])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">Monitor and manage your bingo platform</p>
        </div>
        <Button onClick={()=>refreshData(activeAgentId || 0 )} disabled={isLoading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Players</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats.activePlayers}</div>
            <p className="text-xs text-muted-foreground">+{stats.playersToday} today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : `$${stats.revenueToday}`}</div>
            <p className="text-xs text-muted-foreground">+{stats.revenueGrowth}% from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Games</CardTitle>
            <GamepadIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats.activeGames}</div>
            <p className="text-xs text-muted-foreground">{stats.gamesCompleted} completed today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Game Duration</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : `${stats.avgGameDuration}m`}</div>
            <p className="text-xs text-muted-foreground">-2m from last week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Active Rooms */}
        <Card>
          <CardHeader>
            <CardTitle>Active Rooms</CardTitle>
            <CardDescription>Currently running bingo rooms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeRooms.map((room) => (
                <div key={room.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium">{room.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {room.players}/{room.capacity} players • ${room.fee}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={room.status === "active" ? "default" : "secondary"}>{room.status}</Badge>
                    <Button size="sm" variant="outline">
                      {room.gameStatus === "playing" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest payment activity</CardDescription>
          </CardHeader>
          <CardContent>
            {/* <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="font-medium">{transaction.playerName}</div>
                    <div className="text-sm text-muted-foreground">
                      {transaction.type} • {transaction.timestamp}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${transaction.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                      {transaction.amount > 0 ? "+" : ""}${Math.abs(transaction.amount)}
                    </div>
                    <Badge variant={transaction.status === "completed" ? "default" : "secondary"} className="text-xs">
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div> */}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
