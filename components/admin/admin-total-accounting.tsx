"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { userStore } from "@/lib/stores/user-store"
import { useAgentStore } from "@/lib/stores/agent-store"
import type { TotalAccounting } from "@/lib/stores/agent-store"
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  Clock,
  DollarSign,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface AdminTotalAccountingProps {
  agentId?: number
}

function formatCurrency(amount: number | null | undefined) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "ETB",
    minimumFractionDigits: 2,
  }).format(amount ?? 0)
}

function MetricCard({
  label,
  value,
  icon,
  tone = "neutral",
}: {
  label: string
  value: string
  icon: React.ReactNode
  tone?: "positive" | "negative" | "neutral" | "info"
}) {
  const toneClasses =
    tone === "positive"
      ? "bg-green-50 border-green-200"
      : tone === "negative"
      ? "bg-red-50 border-red-200"
      : tone === "info"
      ? "bg-blue-50 border-blue-200"
      : "bg-muted/40 border-border"

  const valueClasses =
    tone === "positive"
      ? "text-green-700"
      : tone === "negative"
      ? "text-red-700"
      : tone === "info"
      ? "text-blue-700"
      : "text-foreground"

  const labelClasses =
    tone === "positive"
      ? "text-green-600"
      : tone === "negative"
      ? "text-red-600"
      : tone === "info"
      ? "text-blue-600"
      : "text-muted-foreground"

  return (
    <div className={cn("rounded-lg border p-2", toneClasses)}>
      <div className="mb-2 flex items-center justify-between">
        <span className={cn("text-xs font-medium tracking-wide", labelClasses)}>
          {label.toUpperCase()}
        </span>
        <span className={cn("text-muted-foreground")}>{icon}</span>
      </div>
      <p className={cn("text-xl font-bold tabular-nums sm:text-3xl", valueClasses)}>
        {value}
      </p>
    </div>
  )
}

function MiniStat({
  label,
  value,
  tone = "neutral",
}: {
  label: string
  value: string
  tone?: "neutral" | "positive" | "negative" | "warning"
}) {
  const toneBg =
    tone === "positive"
      ? "bg-green-50 border-green-200"
      : tone === "negative"
      ? "bg-red-50 border-red-200"
      : tone === "warning"
      ? "bg-yellow-50 border-yellow-200"
      : "bg-muted/40 border-border"

  const toneText =
    tone === "positive"
      ? "text-green-700"
      : tone === "negative"
      ? "text-red-700"
      : tone === "warning"
      ? "text-yellow-700"
      : "text-foreground"

  return (
    <div className={cn("rounded-lg border p-3 sm:p-4", toneBg)}>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground sm:text-sm">
          {label}
        </span>
      </div>
      <p className={cn("text-lg font-bold tabular-nums sm:text-xl", toneText)}>
        {value}
      </p>
    </div>
  )
}

export function AdminTotalAccounting({ agentId }: AdminTotalAccountingProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { fetchTotalAccountingForAgent } = useAgentStore()

  const user = userStore((state) => state.user)
  const userRole = user?.role

  const queryAgentId = Number(searchParams.get("agentId") ?? 0)

  const targetAgentId = useMemo(() => {
    return agentId ?? user?.agentId ?? queryAgentId ?? 0
  }, [agentId, user?.agentId, queryAgentId])

  const showBack = Boolean(searchParams.get("agentId"))

  const [totalAccounting, setTotalAccounting] = useState<TotalAccounting | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTotalAccountingData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await fetchTotalAccountingForAgent(targetAgentId)
      setTotalAccounting(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch total accounting.")
      setTotalAccounting(null)
    } finally {
      setLoading(false)
    }
  }, [fetchTotalAccountingForAgent, targetAgentId])

  useEffect(() => {
    if (targetAgentId > 0) fetchTotalAccountingData()
    else setError("No valid agent ID provided.")
  }, [targetAgentId, fetchTotalAccountingData])

  // Role gate
  if (userRole !== "ADMIN" && userRole !== "AGENT") {
    return (
      <div className="p-2">
        <div className="flex items-center gap-3 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <h1 className="text-xl font-semibold">Access denied</h1>
        </div>
        <p className="mt-2 text-muted-foreground">
          This page is restricted to users with ADMIN or AGENT role.
        </p>
      </div>
    )
  }

  // Agent ID gate
  if (!targetAgentId || targetAgentId <= 0) {
    return (
      <div className="p-2">
        <div className="flex items-center gap-3 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <h1 className="text-xl font-semibold">Invalid agent</h1>
        </div>
        <p className="mt-2 text-muted-foreground">
          No valid agent ID provided. Please specify an agent to view total accounting.
        </p>
      </div>
    )
  }

  return (
    <div className="p-2">
      {/* Header */}
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left side */}
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          {searchParams.get("agentId") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="w-fit shrink-0"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}

          {/* Title + badge group */}
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <DollarSign className="h-6 w-6 shrink-0 text-primary" />

            <h1 className="min-w-0 truncate text-xl font-bold sm:text-2xl">
              Total Accounting
            </h1>

            <Badge variant="outline" className="shrink-0">
              Agent #{targetAgentId}
            </Badge>
          </div>
        </div>

        {/* Right side */}
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTotalAccountingData}
            disabled={loading}
            className="w-full shrink-0 sm:w-auto"
          >
            <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-md border border-destructive/20 bg-destructive/10 p-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <Card>
          <CardHeader className="space-y-2">
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data */}
      {totalAccounting && !loading && (
        <Card className="border-blue-200 shadow-sm">
          <CardHeader className="space-y-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  Total Accounting Summary
                </CardTitle>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2">
                <Badge variant="outline" className="text-sm">
                  ID: #{totalAccounting.id}
                </Badge>

                {totalAccounting.lastSettledAt ? (
                  <Badge className="bg-green-600">
                    <BadgeCheck className="mr-1 h-3 w-3" />
                    Settled
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <Clock className="mr-1 h-3 w-3" />
                    Pending
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Main metrics */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              <MetricCard
                label="Deposits"
                value={formatCurrency(totalAccounting.totalDepositAmount)}
                tone="positive"
                icon={<TrendingUp className="h-5 w-5 text-green-600" />}
              />
              <MetricCard
                label="Withdrawals"
                value={formatCurrency(totalAccounting.totalWithdrawalAmount)}
                tone="negative"
                icon={<TrendingDown className="h-5 w-5 text-red-600" />}
              />
              <MetricCard
                label="Bets"
                value={formatCurrency(totalAccounting.totalBetAmount)}
                tone="info"
                icon={<DollarSign className="h-5 w-5 text-blue-600" />}
              />
              <MetricCard
                label="Net Income"
                value={formatCurrency(totalAccounting.netIncome)}
                tone={totalAccounting.netIncome >= 0 ? "positive" : "negative"}
                icon={
                  totalAccounting.netIncome >= 0 ? (
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  )
                }
              />
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              <MiniStat
                label="Prizes Paid"
                value={formatCurrency(totalAccounting.totalPrizeAmount)}
              />
              <MiniStat
                label="Commission Earned"
                value={formatCurrency(totalAccounting.totalCommissionAmount)}
              />
              <div className="rounded-lg border bg-muted/40 p-3 sm:p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground sm:text-sm">
                    Bot Performance
                  </span>
                </div>
                <div className="space-y-1 text-xs sm:text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Wins</span>
                    <span className="font-medium tabular-nums text-green-600">
                      {formatCurrency(totalAccounting.totalBotWinAmount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Losses</span>
                    <span className="font-medium tabular-nums text-red-600">
                      {formatCurrency(totalAccounting.totalBotLossAmount)}
                    </span>
                  </div>
                </div>
              </div>

              <MiniStat
                label="Promotional Bonuses"
                value={formatCurrency(totalAccounting.totalPromotionalBonusAmount || 0)}
              />
              <MiniStat
                label="Welcome Bonuses"
                value={formatCurrency(totalAccounting.totalWelcomeBonusAmount || 0)}
              />

              <div className="rounded-lg border bg-muted/40 p-3 sm:p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground sm:text-sm">
                    Settlement
                  </span>
                </div>

                <div className="space-y-1 text-xs sm:text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span
                      className={cn(
                        "font-medium",
                        totalAccounting.lastSettledAt ? "text-green-600" : "text-yellow-600"
                      )}
                    >
                      {totalAccounting.lastSettledAt ? "Settled" : "Pending"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Last settled at</span>
                    <span className="font-medium text-foreground">
                      {totalAccounting.lastSettledAt
                        ? format(new Date(totalAccounting.lastSettledAt), "MMM dd, yyyy")
                        : "—"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Last amount</span>
                    <span className="font-medium tabular-nums text-foreground">
                      {formatCurrency(totalAccounting.lastSettledAmount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total settled</span>
                    <span className="font-medium tabular-nums text-foreground">
                      {formatCurrency(totalAccounting.totalSettledAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="mt-8 border-t pt-6">
              <div className="grid grid-cols-1 gap-4 text-xs text-muted-foreground sm:grid-cols-3 sm:text-sm">
                <div>
                  <span className="font-medium text-foreground/80">Created</span>
                  <div className="break-all">
                    {format(new Date(totalAccounting.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-foreground/80">Updated</span>
                  <div className="break-all">
                    {format(new Date(totalAccounting.updatedAt), "MMM dd, yyyy 'at' h:mm a")}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-foreground/80">Last settled</span>
                  <div className="break-all">
                    {totalAccounting.lastSettledAt
                      ? format(new Date(totalAccounting.lastSettledAt), "MMM dd, yyyy 'at' h:mm a")
                      : "Not settled yet"}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty */}
      {!totalAccounting && !loading && !error && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <DollarSign className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p>No total accounting data found for Agent #{targetAgentId}.</p>
              <p className="mt-2 text-sm">
                This agent may not have any accounting records yet.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
