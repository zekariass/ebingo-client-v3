"use client"

import { useEffect, useState } from "react"
import { userStore } from "@/lib/stores/user-store"
import { useAgentStore } from "@/lib/stores/agent-store"
import { TotalAccounting } from "@/lib/stores/agent-store"
import { 
  DollarSign, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  User,
  CheckCircle, 
  Clock,
  RefreshCw,
  Eye,
  ArrowUpDown
} from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface AdminTotalAccountingsProps {
  agentId?: number
}

const PAGE_SIZE = 10

const SORT_OPTIONS = [
  { value: "id", label: "ID" },
  { value: "netIncome", label: "Net Income" },
  { value: "lastSettledAt", label: "Last Settled" },
  { value: "createdAt", label: "Created Date" },
  { value: "updatedAt", label: "Updated Date" },
]

export function AdminTotalAccountings({ agentId }: AdminTotalAccountingsProps) {
  const { user } = userStore.getState()
  const userRole = user?.role
  
  const {
    totalAccountings,
    totalAccountingLoading,
    totalAccountingError,
    totalAccountingPage,
    totalAccountingTotalPages,
    totalAccountingTotalElements,
    fetchAllTotalAccountings,
    fetchTotalAccountingById,
    setTotalAccountingPage,
    resetTotalAccountings,
  } = useAgentStore()
  
  // UI state
  const [selectedRecord, setSelectedRecord] = useState<TotalAccounting | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState<boolean>(false)
  const [sortBy, setSortBy] = useState<string>("id")
  const [detailLoading, setDetailLoading] = useState<boolean>(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 2
    }).format(amount ?? 0)
  }

  // Fetch data on component mount and when sort changes
  useEffect(() => {
    fetchAllTotalAccountings(0, PAGE_SIZE, sortBy)
    
    return () => resetTotalAccountings()
  }, [sortBy])

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setTotalAccountingPage(newPage)
    fetchAllTotalAccountings(newPage, PAGE_SIZE, sortBy)
  }

  // Handle sort change
  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy)
    setTotalAccountingPage(0)
    fetchAllTotalAccountings(0, PAGE_SIZE, newSortBy)
  }

  // Handle row click to view details
  const handleRowClick = async (record: TotalAccounting) => {
    try {
      setDetailLoading(true)
      setDetailError(null)
      
      const detailedRecord = await fetchTotalAccountingById(record.id)
      setSelectedRecord(detailedRecord)
      setIsDetailDialogOpen(true)
    } catch (err) {
      setDetailError(err instanceof Error ? err.message : "Failed to fetch record details")
    } finally {
      setDetailLoading(false)
    }
  }

  // Close detail dialog
  const handleCloseDetailDialog = () => {
    setIsDetailDialogOpen(false)
    setSelectedRecord(null)
    setDetailError(null)
  }

  // Check if user has ADMIN role
  if (userRole !== "ADMIN") {
    return (
      <div className="p-6">
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          <h1 className="text-lg sm:text-2xl font-bold">Total Accountings</h1>
          <Badge variant="outline" className="ml-2 text-xs sm:text-sm">
            {totalAccountingTotalElements} records
          </Badge>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4" />
            <Label htmlFor="sort" className="text-sm font-medium whitespace-nowrap">Sort:</Label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-3 py-1 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
              disabled={totalAccountingLoading}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => fetchAllTotalAccountings(totalAccountingPage, PAGE_SIZE, sortBy)}
            disabled={totalAccountingLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", totalAccountingLoading && "animate-spin")} />
            <span className=" sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Error message */}
      {totalAccountingError && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>{totalAccountingError}</p>
          </div>
        </div>
      )}

      {/* Total Accounting Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            All Agents Total Accounting
          </CardTitle>
        </CardHeader>
        <CardContent>
          {totalAccountingLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : totalAccountings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No total accounting records found.</p>
            </div>
          ) : (
            <div className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[60px]">ID</TableHead>
                    <TableHead className=" sm:table-cell min-w-[80px]">Agent ID</TableHead>
                    <TableHead className="min-w-[80px]">Deposits</TableHead>
                    <TableHead className=" md:table-cell min-w-[80px]">Withdrawals</TableHead>
                    <TableHead className=" lg:table-cell min-w-[80px]">Bets</TableHead>
                    <TableHead className=" lg:table-cell min-w-[80px]">Prizes</TableHead>
                    <TableHead className=" xl:table-cell min-w-[80px]">Commission</TableHead>
                    <TableHead className="min-w-[80px]">Net Income</TableHead>
                    <TableHead className=" sm:table-cell min-w-[80px]">Status</TableHead>
                    <TableHead className="text-right min-w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {totalAccountings.map((accounting) => (
                    <TableRow 
                      key={accounting.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleRowClick(accounting)}
                    >
                      <TableCell className="font-medium">#{accounting.id}</TableCell>
                      <TableCell className=" sm:table-cell">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {accounting.agentId}
                        </div>
                      </TableCell>
                      <TableCell className="text-green-600 font-medium">
                        {formatCurrency(accounting.totalDepositAmount)}
                      </TableCell>
                      <TableCell className=" md:table-cell text-red-600 font-medium">
                        {formatCurrency(accounting.totalWithdrawalAmount)}
                      </TableCell>
                      <TableCell className=" lg:table-cell">{formatCurrency(accounting.totalBetAmount)}</TableCell>
                      <TableCell className=" lg:table-cell text-orange-600">
                        {formatCurrency(accounting.totalPrizeAmount)}
                      </TableCell>
                      <TableCell className=" xl:table-cell">{formatCurrency(accounting.totalCommissionAmount)}</TableCell>
                      <TableCell className={cn(
                        "font-medium",
                        accounting.totalNetIncome >= 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {formatCurrency(accounting.totalNetIncome)}
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
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRowClick(accounting)
                          }}
                          className="p-1 sm:p-2"
                        >
                          <Eye className="h-4 w-4" />
                          <span className=" sm:inline ml-1">View</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalAccountingTotalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
              <div className="text-sm text-muted-foreground text-center sm:text-left">
                <div>Page {totalAccountingPage + 1} of {totalAccountingTotalPages}</div>
                <div className="text-xs">{totalAccountingTotalElements} total records</div>
              </div>
              <div className="flex gap-2 justify-center sm:justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(totalAccountingPage - 1)}
                  disabled={totalAccountingPage === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(totalAccountingPage + 1)}
                  disabled={totalAccountingPage === totalAccountingTotalPages - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={(open) => !open && handleCloseDetailDialog()}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[85vh] sm:max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="truncate">Total Accounting Details</span>
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Complete details of total accounting record{selectedRecord && ` #${selectedRecord.id}`}
            </DialogDescription>
          </DialogHeader>
          
          {detailLoading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            </div>
          ) : detailError ? (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <p>{detailError}</p>
              </div>
            </div>
          ) : selectedRecord ? (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs sm:text-sm">Agent ID</Label>
                  <p className="text-base sm:text-lg font-semibold flex items-center gap-2">
                    <User className="h-3 w-3 sm:h-4 sm:w-4" />
                    {selectedRecord.agentId}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs sm:text-sm">Status</Label>
                  <p className="text-base sm:text-lg font-semibold">
                    {selectedRecord.settledAt ? (
                      <Badge variant="default" className="bg-green-600 text-xs sm:text-sm">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Settled
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs sm:text-sm">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs sm:text-sm">Settled Amount</Label>
                  <p className="text-base sm:text-lg font-semibold text-green-600">
                    {formatCurrency(selectedRecord.settledAmount)}
                  </p>
                </div>
              </div>

              {/* Main Financial Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <div className="bg-green-50 p-4 sm:p-6 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                    <span className="text-xs text-green-600 font-medium">DEPOSITS</span>
                  </div>
                  <p className="text-xl sm:text-3xl font-bold text-green-700">
                    {formatCurrency(selectedRecord.totalDepositAmount)}
                  </p>
                </div>

                <div className="bg-red-50 p-4 sm:p-6 rounded-lg border border-red-200">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                    <span className="text-xs text-red-600 font-medium">WITHDRAWALS</span>
                  </div>
                  <p className="text-xl sm:text-3xl font-bold text-red-700">
                    {formatCurrency(selectedRecord.totalWithdrawalAmount)}
                  </p>
                </div>

                <div className="bg-blue-50 p-4 sm:p-6 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    <span className="text-xs text-blue-600 font-medium">BETS</span>
                  </div>
                  <p className="text-xl sm:text-3xl font-bold text-blue-700">
                    {formatCurrency(selectedRecord.totalBetAmount)}
                  </p>
                </div>

                <div className={cn(
                  "p-4 sm:p-6 rounded-lg border",
                  selectedRecord.totalNetIncome >= 0 
                    ? "bg-green-50 border-green-200" 
                    : "bg-red-50 border-red-200"
                )}>
                  <div className="flex items-center justify-between mb-2">
                    {selectedRecord.totalNetIncome >= 0 ? (
                      <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                    )}
                    <span className={cn(
                      "text-xs font-medium",
                      selectedRecord.totalNetIncome >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                      NET INCOME
                    </span>
                  </div>
                  <p className={cn(
                    "text-xl sm:text-3xl font-bold",
                    selectedRecord.totalNetIncome >= 0 ? "text-green-700" : "text-red-700"
                  )}>
                    {formatCurrency(selectedRecord.totalNetIncome)}
                  </p>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                <div className="bg-orange-50 p-3 sm:p-4 rounded-lg border border-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs sm:text-sm font-medium text-orange-700">Prizes Paid</span>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-orange-700">
                    {formatCurrency(selectedRecord.totalPrizeAmount)}
                  </p>
                </div>

                <div className="bg-purple-50 p-3 sm:p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs sm:text-sm font-medium text-purple-700">Commission Earned</span>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-purple-700">
                    {formatCurrency(selectedRecord.totalCommissionAmount)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs sm:text-sm font-medium text-gray-700">Bot Performance</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-600">Wins:</span>
                      <span className="font-medium text-green-600">{(selectedRecord as any)?.totalWins || 0}</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-600">Losses:</span>
                      <span className="font-medium text-red-600">{(selectedRecord as any)?.totalLosses || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-50 p-3 sm:p-4 rounded-lg border border-indigo-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs sm:text-sm font-medium text-indigo-700">Promotional Bonuses</span>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-indigo-700">
                    {formatCurrency(selectedRecord.totalPromotionalBonusAmount || 0)}
                  </p>
                </div>

                <div className="bg-teal-50 p-3 sm:p-4 rounded-lg border border-teal-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs sm:text-sm font-medium text-teal-700">Welcome Bonuses</span>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-teal-700">
                    {formatCurrency(selectedRecord.totalWelcomeBonusAmount || 0)}
                  </p>
                </div>
              </div>

              {/* Record Timestamps */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium">Created:</span>
                    <div className="break-all">{format(new Date(selectedRecord.createdAt), "MMM dd, yyyy 'at' h:mm a")}</div>
                  </div>
                  <div>
                    <span className="font-medium">Updated:</span>
                    <div className="break-all">{format(new Date(selectedRecord.updatedAt), "MMM dd, yyyy 'at' h:mm a")}</div>
                  </div>
                  <div>
                    <span className="font-medium">Settled:</span>
                    <div className="break-all">
                      {selectedRecord.settledAt 
                        ? format(new Date(selectedRecord.settledAt), "MMM dd, yyyy 'at' h:mm a")
                        : "Not settled yet"
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* Record Timestamps */}
              {/* <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Created: {format(new Date(selectedRecord.createdAt), "MMM dd, yyyy HH:mm")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    <span>Updated: {format(new Date(selectedRecord.updatedAt), "MMM dd, yyyy HH:mm")}</span>
                  </div>
                  {selectedRecord.settledAt && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Settled: {format(new Date(selectedRecord.settledAt), "MMM dd, yyyy HH:mm")}</span>
                    </div>
                  )}
                </div>
              </div> */}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
