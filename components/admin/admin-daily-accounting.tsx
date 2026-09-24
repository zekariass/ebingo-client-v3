"use client"

import { useState, useEffect, useMemo } from "react"
import { useAgentStore } from "@/lib/stores/agent-store"
import { userStore } from "@/lib/stores/user-store"
import type { DailyAccounting } from "@/lib/stores/agent-store"
import {
  BarChart3,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  BadgeCheck,
  Filter,
  Eye,
  X,
  Trophy,
  Search,
  Info,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { format, isAfter, startOfDay } from "date-fns"
import { cn } from "@/lib/utils"

interface AdminDailyAccountingProps {
  agentId?: number
}

interface ApiResponse<T> {
  success: boolean
  statusCode: number
  message: string
  error?: string
  errors?: Record<string, string>
  path?: string
  data: T
  timestamp: string
}

const PAGE_SIZE = 10

// ✅ LocalDate (YYYY-MM-DD) safe parse (prevents timezone off-by-one)
function parseLocalDate(dateStr: string) {
  // dateStr expected "YYYY-MM-DD"
  const [y, m, d] = dateStr.split("-").map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

export function AdminDailyAccounting({ agentId }: AdminDailyAccountingProps) {
  const user = userStore((state) => state.user)
  const userRole = user?.role
  const currentAgentId = (agentId && agentId > 0 ? agentId : undefined) || user?.agentId

  const {
    dailyAccountings,
    dailyAccountingLoading,
    dailyAccountingError,
    dailyAccountingPage,
    dailyAccountingTotalPages,
    dailyAccountingTotalElements,
    fetchDailyAccountings,
    fetchTodayDailyAccountingForAgent,
    setDailyAccountingPage,
    setDailyAccountingDateRange,
    resetDailyAccountings,
  } = useAgentStore()

  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [selectedRecord, setSelectedRecord] = useState<DailyAccounting | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [todayRecord, setTodayRecord] = useState<DailyAccounting | null>(null)
  const [filterError, setFilterError] = useState<string>("")

  const formatCurrency = (amount: number | null | undefined) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETB",
      minimumFractionDigits: 2,
    }).format(amount ?? 0)
  }

  // Load today's accounting and daily accounting data when component mounts
  useEffect(() => {
    if (currentAgentId) {
      // Fetch today's record first
      fetchTodayDailyAccountingForAgent(currentAgentId)
      // Then fetch paginated list
      fetchDailyAccountings(currentAgentId, 0, PAGE_SIZE)
    }
    return () => resetDailyAccountings()
  }, [currentAgentId, fetchDailyAccountings, fetchTodayDailyAccountingForAgent, resetDailyAccountings])

  // Update today's record when dailyAccountings changes
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    const record = dailyAccountings.find(r => r.accountingDate === today)
    setTodayRecord(record || null)
  }, [dailyAccountings])

  // Validate date is not in the future
  const validateDate = (dateStr: string): boolean => {
    if (!dateStr) return true
    try {
      const date = parseLocalDate(dateStr)
      const today = startOfDay(new Date())
      return !isAfter(date, today)
    } catch {
      return false
    }
  }

  // Search with date validation
  const handleSearch = () => {
    setFilterError("")

    const hasStart = Boolean(startDate)
    const hasEnd = Boolean(endDate)

    // Backend contract: both dates required for date-range
    if ((hasStart && !hasEnd) || (!hasStart && hasEnd)) {
      setFilterError("Please provide both Start Date and End Date (backend requires a full date range).")
      return
    }

    // Validate dates are not in the future
    if (hasStart && !validateDate(startDate)) {
      setFilterError("Start Date cannot be in the future.")
      return
    }

    if (hasEnd && !validateDate(endDate)) {
      setFilterError("End Date cannot be in the future.")
      return
    }

    if (currentAgentId) {
      setDailyAccountingPage(0)
      setDailyAccountingDateRange(startDate || null, endDate || null)
      fetchDailyAccountings(currentAgentId, 0, PAGE_SIZE, startDate || undefined, endDate || undefined)
    }
  }

  const handleClearSearch = () => {
    setFilterError("")
    setStartDate("")
    setEndDate("")
    setDailyAccountingDateRange(null, null)
    if (currentAgentId) {
      setDailyAccountingPage(0)
      fetchDailyAccountings(currentAgentId, 0, PAGE_SIZE)
    }
  }

  const handleViewDetail = (record: DailyAccounting) => {
    setSelectedRecord(record)
    setIsDetailDialogOpen(true)
  }

  const handlePageChange = (page: number) => {
    setDailyAccountingPage(page)
    if (currentAgentId) {
      fetchDailyAccountings(currentAgentId, page, PAGE_SIZE, startDate || undefined, endDate || undefined)
    }
  }

  const totals = useMemo(() => {
    return dailyAccountings.reduce(
      (acc, record) => {
        acc.totalDeposit += record.dailyDepositAmount ?? 0
        acc.totalWithdrawal += record.dailyWithdrawalAmount ?? 0
        acc.totalBet += record.dailyBetAmount ?? 0
        acc.totalPrize += record.dailyPrizeAmount ?? 0
        acc.totalCommission += record.dailyCommissionAmount ?? 0
        acc.totalNetIncome += record.netIncome ?? 0
        return acc
      },
      {
        totalDeposit: 0,
        totalWithdrawal: 0,
        totalBet: 0,
        totalPrize: 0,
        totalCommission: 0,
        totalNetIncome: 0,
      }
    )
  }, [dailyAccountings])

  // Role gate — must come after all hooks to keep hook order stable
  if (userRole !== "ADMIN" && userRole !== "AGENT") {
    return (
      <div className="p-2">
        <div className="flex items-center gap-3 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <h1 className="text-xl font-semibold">Access Denied</h1>
        </div>
        <p className="text-muted-foreground mt-2">
          This page is restricted to users with ADMIN or AGENT role only.
        </p>
      </div>
    )
  }

  if (!currentAgentId) {
    return (
      <div className="p-2">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Daily Accounting</h1>
        </div>
        <div className="bg-muted/50 p-8 rounded-lg text-center">
          <h2 className="text-xl font-medium mb-2">Select an Agent</h2>
          <p className="text-muted-foreground mb-4">
            Please select an agent from the sidebar to view their daily accounting records.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-2">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Daily Accounting</h1>
        </div>
        <Badge variant="secondary" className="text-sm">
          {dailyAccountingTotalElements} records
        </Badge>
      </div>

      {/* Date Filter */}
      <div className="mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-md">Filter by Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="startDate">Start Date</Label>
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="endDate">End Date</Label>
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSearch} disabled={dailyAccountingLoading}>
                  <Filter className="h-4 w-4 mr-2" />
                  {dailyAccountingLoading ? "Searching..." : "Search"}
                </Button>
                {(startDate || endDate) && (
                  <Button onClick={handleClearSearch} variant="outline" disabled={dailyAccountingLoading}>
                    <X className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {filterError && (
              <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-destructive text-sm">{filterError}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Today's Summary Card */}
      {todayRecord && (
        <Card className="mb-6 border-blue-200 shadow-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span>Today’s Accounting Summary</span>

              <Badge variant="outline" className="ml-auto">
                {format(parseLocalDate(todayRecord.accountingDate), "MMMM dd, yyyy")}
              </Badge>
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border bg-muted/40 p-4">
                <Label className="text-sm text-muted-foreground">Deposits</Label>
                <p className="mt-1 text-2xl font-bold tabular-nums text-green-600">
                  {formatCurrency(todayRecord.dailyDepositAmount)}
                </p>
              </div>

              <div className="rounded-lg border bg-muted/40 p-4">
                <Label className="text-sm text-muted-foreground">Withdrawals</Label>
                <p className="mt-1 text-2xl font-bold tabular-nums text-red-600">
                  {formatCurrency(todayRecord.dailyWithdrawalAmount)}
                </p>
              </div>

              <div className="rounded-lg border bg-muted/40 p-4">
                <Label className="text-sm text-muted-foreground">Net Income</Label>
                <p
                  className={cn(
                    "mt-1 text-2xl font-bold tabular-nums",
                    todayRecord.netIncome >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  )}
                >
                  {formatCurrency(todayRecord.netIncome)}
                </p>
              </div>

              <div className="rounded-lg border bg-muted/40 p-4">
                <Label className="text-sm text-muted-foreground">Settlement Status</Label>
                <div className="mt-2">
                  {todayRecord.settledAt ? (
                    <Badge className="bg-green-600">
                      <BadgeCheck className="mr-1 h-3 w-3" />
                      Settled
                    </Badge>
                  ) : (
                    <Badge variant="destructive">Pending</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      )}

      {!todayRecord && !dailyAccountingLoading && (
        <Card className="mb-6 border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Info className="h-5 w-5" />
              <p>No accounting record found for today.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              Deposits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totals.totalDeposit)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
              Withdrawals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totals.totalWithdrawal)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              {/* <DollarSign className="h-4 w-4 text-muted-foreground" /> */}
              Net Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totals.totalNetIncome)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <Trophy className="h-4 w-4 text-muted-foreground" />
              Bets / Prizes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totals.totalBet - totals.totalPrize)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500">+{formatCurrency(totals.totalBet)}</span> /{" "}
              <span className="text-red-500">-{formatCurrency(totals.totalPrize)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error message */}
      {dailyAccountingError && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-destructive">{dailyAccountingError.includes(String(404)) ? "No accounting record found for today." : dailyAccountingError}</p>
        </div>
      )}

      {/* Daily Accounting Table */}
      <Card className="w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-lg font-semibold">Daily Accounting Records</CardTitle>
          <CardDescription>All daily accounting records for this agent.</CardDescription>
        </CardHeader>

        <CardContent className="w-full">
          <div className="w-full rounded-md border overflow-hidden">
            {dailyAccountingLoading ? (
              <div className="space-y-2 p-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : dailyAccountings.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No accounting records found for the selected period.
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <Table className="w-full min-w-[1100px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Date</TableHead>
                      <TableHead className="whitespace-nowrap">Deposits</TableHead>
                      <TableHead className="whitespace-nowrap">Withdrawals</TableHead>
                      <TableHead className="whitespace-nowrap">Bets</TableHead>
                      <TableHead className="whitespace-nowrap">Prizes</TableHead>
                      <TableHead className="whitespace-nowrap">Commission</TableHead>
                      <TableHead className="whitespace-nowrap">Net Income</TableHead>
                      <TableHead className="whitespace-nowrap">Status</TableHead>
                      <TableHead className="whitespace-nowrap text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {dailyAccountings.map((record) => (
                      <TableRow
                        key={record.id}
                        className="cursor-pointer transition-colors hover:bg-muted/50"
                        onClick={() => handleViewDetail(record)}
                      >
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {format(parseLocalDate(record.accountingDate), "MMM dd, yyyy")}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="whitespace-nowrap tabular-nums text-green-600">
                          {formatCurrency(record.dailyDepositAmount)}
                        </TableCell>

                        <TableCell className="whitespace-nowrap tabular-nums text-red-600">
                          {formatCurrency(record.dailyWithdrawalAmount)}
                        </TableCell>

                        <TableCell className="whitespace-nowrap tabular-nums">
                          {formatCurrency(record.dailyBetAmount)}
                        </TableCell>

                        <TableCell className="whitespace-nowrap tabular-nums">
                          {formatCurrency(record.dailyPrizeAmount)}
                        </TableCell>

                        <TableCell className="whitespace-nowrap tabular-nums">
                          {formatCurrency(record.dailyCommissionAmount)}
                        </TableCell>

                        <TableCell
                          className={cn(
                            "whitespace-nowrap tabular-nums",
                            record.netIncome >= 0 ? "text-green-600" : "text-red-600"
                          )}
                        >
                          {formatCurrency(record.netIncome)}
                        </TableCell>

                        <TableCell className="whitespace-nowrap">
                          {record.settledAt ? (
                            <Badge className="bg-green-600">
                              <BadgeCheck className="mr-1 h-3 w-3" />
                              Settled
                            </Badge>
                          ) : (
                            <Badge variant="destructive">Pending</Badge>
                          )}
                        </TableCell>

                        <TableCell className="whitespace-nowrap text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            aria-label={`View details for ${format(
                              parseLocalDate(record.accountingDate),
                              "MMM dd, yyyy"
                            )}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleViewDetail(record)
                            }}
                          >
                            <Eye className="mr-1 h-4 w-4" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {dailyAccountingTotalPages > 1 && (
              <div className="flex items-center justify-between border-t p-3">
                <div className="text-sm text-muted-foreground">
                  Page {dailyAccountingPage + 1} of {dailyAccountingTotalPages}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(dailyAccountingPage - 1)}
                    disabled={dailyAccountingPage === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(dailyAccountingPage + 1)}
                    disabled={dailyAccountingPage === dailyAccountingTotalPages - 1}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>



      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Daily Accounting Details
            </DialogTitle>
            <DialogDescription>
              Detailed view of daily accounting record
              {selectedRecord &&
                ` for ${format(
                  parseLocalDate(selectedRecord.accountingDate),
                  "MMMM dd, yyyy"
                )}`}
            </DialogDescription>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Accounting Date</Label>
                  <p className="text-lg font-semibold">
                    {format(
                      parseLocalDate(selectedRecord.accountingDate),
                      "MMMM dd, yyyy"
                    )}
                  </p>
                </div>

                <div>
                  <Label className="text-muted-foreground">Agent ID</Label>
                  <p className="text-lg font-semibold">
                    <Badge variant="outline">{selectedRecord.agentId}</Badge>
                  </p>
                </div>

                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <p className="text-lg font-semibold">
                    {selectedRecord.settledAt ? (
                      <Badge variant="default" className="bg-green-600">
                        <BadgeCheck className="h-3 w-3 mr-1" />
                        Settled
                      </Badge>
                    ) : (
                      <Badge variant="destructive">Pending</Badge>
                    )}
                  </p>
                </div>
              </div>

              {/* Financial Details */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Financial Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Daily Deposits
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(selectedRecord.dailyDepositAmount)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Daily Withdrawals
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(selectedRecord.dailyWithdrawalAmount)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Daily Bets
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">
                        {formatCurrency(selectedRecord.dailyBetAmount)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Daily Prizes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">
                        {formatCurrency(selectedRecord.dailyPrizeAmount)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Daily Commission
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">
                        {formatCurrency(selectedRecord.dailyCommissionAmount)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Net Income
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p
                        className={cn(
                          "text-2xl font-bold",
                          selectedRecord.netIncome >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        )}
                      >
                        {formatCurrency(selectedRecord.netIncome)}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Bot Performance */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Bot Performance</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Bot Win Amount
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(selectedRecord.dailyBotWinAmount)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Bot Loss Amount
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(selectedRecord.dailyBotLossAmount)}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Bonuses */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Bonuses</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Promotional Bonus
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">
                        {formatCurrency(selectedRecord.dailyPromotionalBonusAmount)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Welcome Bonus
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">
                        {formatCurrency(selectedRecord.dailyWelcomeBonusAmount)}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Settlement Information */}
              {selectedRecord.settledAt && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Settlement Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Settled Amount</Label>
                      <p className="text-lg font-semibold text-purple-600">
                        {formatCurrency(selectedRecord.settledAmount)}
                      </p>
                    </div>

                    <div>
                      <Label className="text-muted-foreground">Settled At</Label>
                      <p className="text-lg font-semibold">
                        {format(
                          new Date(selectedRecord.settledAt),
                          "MMM dd, yyyy HH:mm"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Record Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Record Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Created At</Label>
                    <p className="text-sm">
                      {format(
                        new Date(selectedRecord.createdAt),
                        "MMM dd, yyyy HH:mm:ss"
                      )}
                    </p>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">Updated At</Label>
                    <p className="text-sm">
                      {format(
                        new Date(selectedRecord.updatedAt),
                        "MMM dd, yyyy HH:mm:ss"
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  )
}
