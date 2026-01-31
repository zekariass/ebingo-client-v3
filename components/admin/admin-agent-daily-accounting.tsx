"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { userStore } from "@/lib/stores/user-store"
import { useAgentStore } from "@/lib/stores/agent-store"
import { DailyAccounting } from "@/lib/stores/agent-store"
import { 
  BarChart3, 
  AlertCircle, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  Eye, 
  User,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Search,
  Filter,
  RefreshCw,
  X,
  BadgeCheck
} from "lucide-react"
import { format, isAfter, startOfDay } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

// interface AdminAgentDailyAccountingProps {
//   agentId: number
//   targetAgentId: number
// }

const PAGE_SIZE = 10

// ✅ LocalDate (YYYY-MM-DD) safe parse (prevents timezone off-by-one)
function parseLocalDate(dateStr: string) {
  // dateStr expected "YYYY-MM-DD"
  const [y, m, d] = dateStr.split("-").map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

export function AdminAgentDailyAccounting() {
  const router = useRouter()
  const { user } = userStore.getState()
  const userRole = user?.role

  const searchParams = useSearchParams()
  const agentId = Number(searchParams.get("agentId") || 0)
  const targetAgentId = Number(searchParams.get("targetAgentId") || 0)

  const {
    dailyAccountings,
    dailyAccountingLoading,
    dailyAccountingError,
    dailyAccountingPage,
    dailyAccountingTotalPages,
    dailyAccountingTotalElements,
    fetchDailyAccountings,
    fetchTodayDailyAccountingForAgent,
    settleDailyAccounting,
    setDailyAccountingPage,
    resetDailyAccountings,
  } = useAgentStore()

  // UI state
  const [isSettling, setIsSettling] = useState<boolean>(false)
  const [selectedAccountingId, setSelectedAccountingId] = useState<number | null>(null)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState<boolean>(false)
  const [selectedRecord, setSelectedRecord] = useState<DailyAccounting | null>(null)
  const [todayRecord, setTodayRecord] = useState<DailyAccounting | null>(null)
  
  // Search state
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [filterError, setFilterError] = useState<string | null>(null)
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 2
    }).format(amount ?? 0)
  }

  // Load today's record and initial data when component mounts
  useEffect(() => {
    // Fetch today's record for the target agent
    fetchTodayDailyAccountingForAgent(targetAgentId)
      .then(() => {
        // After fetching today's record, fetch the paginated list
        fetchDailyAccountings(targetAgentId, 0, PAGE_SIZE)
      })
    
    return () => resetDailyAccountings()
  }, [targetAgentId, fetchTodayDailyAccountingForAgent, fetchDailyAccountings, resetDailyAccountings])

  // Check if user has ADMIN role
  if (userRole !== "ADMIN") {
    return (
      <div className="p-1">
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

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setDailyAccountingPage(newPage)
    fetchDailyAccountings(targetAgentId, newPage, PAGE_SIZE, startDate || undefined, endDate || undefined)
  }

  // Handle row click to view record details
  const handleRowClick = (record: DailyAccounting) => {
    setSelectedRecord(record)
  }

  // Handle search
  const handleSearch = () => {
    // Validate dates
    if (startDate && endDate) {
      const start = parseLocalDate(startDate)
      const end = parseLocalDate(endDate)
      const today = startOfDay(new Date())

      if (isAfter(start, today) || isAfter(end, today)) {
        setFilterError("Dates cannot be in the future")
        return
      }

      if (isAfter(start, end)) {
        setFilterError("Start date cannot be after end date")
        return
      }
    }

    setFilterError(null)
    setDailyAccountingPage(0)
    fetchDailyAccountings(targetAgentId, 0, PAGE_SIZE, startDate || undefined, endDate || undefined)
  }

  // Handle clear search
  const handleClearSearch = () => {
    setStartDate("")
    setEndDate("")
    setFilterError(null)
    setDailyAccountingPage(0)
    fetchDailyAccountings(targetAgentId, 0, PAGE_SIZE)
  }

  // Handle settlement
  const handleSettleClick = (id: number) => {
    setSelectedAccountingId(id)
    setIsConfirmDialogOpen(true)
  }

  const handleSettleConfirm = async () => {
    if (selectedAccountingId) {
      try {
        setIsSettling(true)
        await settleDailyAccounting(selectedAccountingId)
        setIsConfirmDialogOpen(false)
        setSelectedAccountingId(null)
      } catch (error) {
        console.error("Error settling daily accounting:", error)
      } finally {
        setIsSettling(false)
      }
    }
  }

  // Check if accounting can be settled (not from today and not already settled)
  const canBeSettled = (accounting: DailyAccounting) => {
    const today = new Date().toISOString().split('T')[0]
    return accounting.accountingDate !== today && !accounting.settledAt
  }

  // Get settlement tooltip message
  const getSettlementTooltip = (accounting: DailyAccounting) => {
    const today = new Date().toISOString().split('T')[0]
    
    if (accounting.settledAt) {
      return "This record has already been settled"
    }
    
    if (accounting.accountingDate === today) {
      return "Today's records cannot be settled until tomorrow"
    }
    
    return "Click to settle this accounting record"
  }

  // Get today's record from the store
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    const record = dailyAccountings.find(r => r.accountingDate === today)
    if (record && record.agentId === targetAgentId) {
      setTodayRecord(record)
    }
  }, [dailyAccountings, targetAgentId])

  return (
    <div className="p-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 sm:gap-4">
          {searchParams.get("agentId") && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className=" sm:inline">Back</span>
            </Button>
          )}
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <h1 className="text-lg sm:text-2xl font-bold">Agent Daily Accounting</h1>
            <Badge variant="outline" className="ml-2 text-xs sm:text-sm">
              Agent #{targetAgentId}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => fetchDailyAccountings(targetAgentId, dailyAccountingPage, PAGE_SIZE, startDate || undefined, endDate || undefined)}
            disabled={dailyAccountingLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", dailyAccountingLoading && "animate-spin")} />
            <span className=" sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Search Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search Filters
          </CardTitle>
          <CardDescription>
            Filter accounting records by date range
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate" className="text-sm font-medium">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate || ""}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="endDate" className="text-sm font-medium">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate || ""}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button 
              onClick={handleSearch}
              disabled={dailyAccountingLoading}
              className="flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              <span className=" sm:inline">Filter</span>
            </Button>
            <Button 
              variant="outline"
              onClick={handleClearSearch}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              <span className=" sm:inline">Clear</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Today's Summary Card */}
      {todayRecord && (
        <Card className="mb-6 border-blue-200 shadow-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="flex min-w-0 flex-wrap items-center gap-2">
              <Calendar className="h-5 w-5 shrink-0 text-muted-foreground" />
              <span className="min-w-0 truncate">Today&apos;s Accounting Summary</span>

              <Badge variant="outline" className="ml-auto shrink-0">
                {format(parseLocalDate(todayRecord.accountingDate), "MMMM dd, yyyy")}
              </Badge>
            </CardTitle>
          </CardHeader>

          <CardContent>
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
                    todayRecord.netIncome >= 0 ? "text-green-600" : "text-red-600"
                  )}
                >
                  {formatCurrency(todayRecord.netIncome)}
                </p>
              </div>

              <div className="rounded-lg border bg-muted/40 p-4">
                <Label className="text-sm text-muted-foreground">Status</Label>
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

      {/* Error message */}
      {dailyAccountingError && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-destructive">{dailyAccountingError}</p>
        </div>
      )}

      {/* Daily Accounting Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Daily Accounting Records
          </CardTitle>
          {/* <CardDescription>
            Click on any row to view detailed information about that accounting record
          </CardDescription> */}
        </CardHeader>
        <CardContent>
          {dailyAccountingLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : dailyAccountings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No accounting records found for the selected period.</p>
            </div>
          ) : (
            <div className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    {/* <TableHead className="min-w-[100px]">Date</TableHead> */}
                    <TableHead className="min-w-[80px]">Deposits</TableHead>
                    <TableHead className=" md:table-cell min-w-[80px]">Withdrawals</TableHead>
                    <TableHead className=" lg:table-cell min-w-[80px]">Bets</TableHead>
                    <TableHead className=" lg:table-cell min-w-[80px]">Prizes</TableHead>
                    <TableHead className=" xl:table-cell min-w-[80px]">Commission</TableHead>
                    <TableHead className="min-w-[80px]">Net Income</TableHead>
                    <TableHead className=" sm:table-cell min-w-[80px]">Status</TableHead>
                    {/* <TableHead className=" md:table-cell min-w-[80px]">Is Settled</TableHead> */}
                    <TableHead className="text-center min-w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dailyAccountings.map((accounting) => (
                    <TableRow 
                      key={accounting.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleRowClick(accounting)}
                    >
                      {/* <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span className=" sm:inline">{format(parseLocalDate(accounting.accountingDate), "MMM dd, yyyy")}</span>
                          <span className="sm:">{format(parseLocalDate(accounting.accountingDate), "MMM dd")}</span>
                        </div>
                      </TableCell> */}
                      <TableCell className="text-green-600 font-medium">
                        {formatCurrency(accounting.dailyDepositAmount)}
                      </TableCell>
                      <TableCell className=" md:table-cell text-red-600 font-medium">
                        {formatCurrency(accounting.dailyWithdrawalAmount)}
                      </TableCell>
                      <TableCell className=" lg:table-cell">{formatCurrency(accounting.dailyBetAmount)}</TableCell>
                      <TableCell className=" lg:table-cell text-orange-600">
                        {formatCurrency(accounting.dailyPrizeAmount)}
                      </TableCell>
                      <TableCell className=" xl:table-cell">{formatCurrency(accounting.dailyCommissionAmount)}</TableCell>
                      <TableCell className={cn(
                        "font-medium",
                        accounting.netIncome >= 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {formatCurrency(accounting.netIncome)}
                      </TableCell>
                      <TableCell className=" sm:table-cell">
                        {accounting.settledAt ? (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Settled
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      {/* <TableCell className=" md:table-cell">
                        {accounting.settledAt ? (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            YES
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Clock className="h-3 w-3 mr-1" />
                            NO
                          </Badge>
                        )}
                      </TableCell> */}
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSettleClick(accounting.id)
                          }}
                          disabled={!canBeSettled(accounting)}
                          className={cn(
                            "opacity-100 p-1 sm:p-2",
                            !canBeSettled(accounting) && "opacity-50 cursor-not-allowed"
                          )}
                          title={!canBeSettled(accounting) ? getSettlementTooltip(accounting) : undefined}
                        >
                          <span className="sm:inline ml-1">Settle</span>
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
              <div className="text-sm text-muted-foreground text-center sm:text-left">
                <div>Page {dailyAccountingPage + 1} of {dailyAccountingTotalPages}</div>
                <div className="text-xs">{dailyAccountingTotalElements} total records</div>
              </div>
              <div className="flex gap-2 justify-center sm:justify-end">
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
        </CardContent>
      </Card>

      {/* Record Detail Dialog */}
      <Dialog
          open={!!selectedRecord}
        onOpenChange={(open) => !open && setSelectedRecord(null)}
      > 
        <DialogContent className="w-[calc(100vw-1.5rem)] max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader className="space-y-2">
            <DialogTitle className="flex min-w-0 flex-wrap items-center gap-2">
              <BarChart3 className="h-5 w-5 shrink-0 text-muted-foreground" />
              <span className="min-w-0 truncate">Daily Accounting Details</span>
            </DialogTitle>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="min-w-0">
                  <Label className="text-sm text-muted-foreground">Agent ID</Label>
                  <p className="flex items-center gap-2 text-lg font-semibold tabular-nums">
                    <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 truncate">{selectedRecord.agentId}</span>
                  </p>
                </div>

                <div className="min-w-0">
                  <Label className="text-sm text-muted-foreground">Accounting Date</Label>
                  <p className="text-lg font-semibold">
                    {format(parseLocalDate(selectedRecord.accountingDate), "MMMM dd, yyyy")}
                  </p>
                </div>

                <div className="min-w-0">
                  <Label className="text-sm text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    {selectedRecord.settledAt ? (
                      <Badge className="bg-green-600">
                        <CheckCircle className="mr-1 h-3 w-3" />
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
              </div>

              {/* Financial Details */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg border bg-green-50 p-4">
                  <Label className="text-sm font-medium text-green-700">Deposits</Label>
                  <p className="mt-1 text-2xl font-bold tabular-nums text-green-700">
                    {formatCurrency(selectedRecord.dailyDepositAmount)}
                  </p>
                </div>

                <div className="rounded-lg border bg-red-50 p-4">
                  <Label className="text-sm font-medium text-red-700">Withdrawals</Label>
                  <p className="mt-1 text-2xl font-bold tabular-nums text-red-700">
                    {formatCurrency(selectedRecord.dailyWithdrawalAmount)}
                  </p>
                </div>

                <div className="rounded-lg border bg-blue-50 p-4">
                  <Label className="text-sm font-medium text-blue-700">Bets</Label>
                  <p className="mt-1 text-2xl font-bold tabular-nums text-blue-700">
                    {formatCurrency(selectedRecord.dailyBetAmount)}
                  </p>
                </div>

                <div className="rounded-lg border bg-orange-50 p-4">
                  <Label className="text-sm font-medium text-orange-700">Prizes</Label>
                  <p className="mt-1 text-2xl font-bold tabular-nums text-orange-700">
                    {formatCurrency(selectedRecord.dailyPrizeAmount)}
                  </p>
                </div>

                <div className="rounded-lg border bg-purple-50 p-4">
                  <Label className="text-sm font-medium text-purple-700">Commission</Label>
                  <p className="mt-1 text-2xl font-bold tabular-nums text-purple-700">
                    {formatCurrency(selectedRecord.dailyCommissionAmount)}
                  </p>
                </div>

                <div
                  className={cn(
                    "rounded-lg border p-4",
                    selectedRecord.netIncome >= 0
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  )}
                >
                  <Label
                    className={cn(
                      "text-sm font-medium",
                      selectedRecord.netIncome >= 0 ? "text-green-700" : "text-red-700"
                    )}
                  >
                    Net Income
                  </Label>
                  <p
                    className={cn(
                      "mt-1 text-3xl font-bold tabular-nums",
                      selectedRecord.netIncome >= 0 ? "text-green-700" : "text-red-700"
                    )}
                  >
                    {formatCurrency(selectedRecord.netIncome)}
                  </p>
                </div>
              </div>

              {/* Additional Information */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg border bg-muted/40 p-4">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Bot Performance
                  </Label>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Wins</span>
                      <span className="font-medium tabular-nums text-green-600">
                        {formatCurrency(selectedRecord.dailyBotWinAmount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Losses</span>
                      <span className="font-medium tabular-nums text-red-600">
                        {formatCurrency(selectedRecord.dailyBotLossAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border bg-muted/40 p-4">
                  <Label className="text-sm font-medium text-muted-foreground">Bonuses</Label>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Promotional</span>
                      <span className="font-medium tabular-nums text-blue-600">
                        {formatCurrency(selectedRecord.dailyPromotionalBonusAmount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Welcome</span>
                      <span className="font-medium tabular-nums text-purple-600">
                        {formatCurrency(selectedRecord.dailyWelcomeBonusAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Settlement Information */}
              {selectedRecord.settledAt && (
                <div className="rounded-lg border bg-green-50 p-4">
                  <Label className="text-sm font-medium text-green-700">
                    Settlement Information
                  </Label>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Settled at</span>
                      <span className="font-medium">
                        {format(new Date(selectedRecord.settledAt), "MMM dd, yyyy HH:mm")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Settled amount</span>
                      <span className="font-medium tabular-nums text-green-700">
                        {formatCurrency(selectedRecord.settledAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Record Timestamps */}
              <div className="rounded-lg border bg-muted/40 p-4">
                <Label className="text-sm font-medium text-muted-foreground">
                  Record Timestamps
                </Label>

                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Created</span>
                    <span className="font-medium">
                      {format(new Date(selectedRecord.createdAt), "MMM dd, yyyy HH:mm")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Last updated</span>
                    <span className="font-medium">
                      {format(new Date(selectedRecord.updatedAt), "MMM dd, yyyy HH:mm")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>


      {/* Settlement Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Settlement</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)} disabled={isSettling}>
              Cancel
            </Button>
            <Button onClick={handleSettleConfirm} disabled={isSettling}>
              {isSettling ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Settling...
                </>
              ) : (
                'Confirm Settlement'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
