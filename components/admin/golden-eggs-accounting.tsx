"use client"

import { useEffect, useState } from "react"
import { useExternalGameStore } from "@/lib/stores/external-game-store"
import { useAgentStore } from "@/lib/stores/agent-store"
import { userStore } from "@/lib/stores/user-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, RefreshCw } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { GoldenEggsDailyAccounting } from "@/lib/types"

type FilterType = "all" | "unsettled" | "date" | "range"

export function GoldenEggsAccounting() {
  const { toast } = useToast()
  const { activeAgentId } = useAgentStore()
  const { user } = userStore()
  const [agentId, setAgentId] = useState<string>(activeAgentId?.toString() || "")
  const [filterType, setFilterType] = useState<FilterType>("all")
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()

  const {
    goldenEggsTotalAccounting,
    goldenEggsDailyAccountingList,
    accountingLoading,
    accountingError,
    getGoldenEggsTotalAccounting,
    getGoldenEggsDailyAccounting,
    getGoldenEggsDailyAccountingByDate,
    getGoldenEggsDailyAccountingByRange,
    getGoldenEggsUnsettledDailyAccounting,
    settleGoldenEggsDailyAccounting,
    unsettleGoldenEggsDailyAccounting,
    clearGoldenEggsErrors,
  } = useExternalGameStore()

  useEffect(() => {
    if (activeAgentId) {
      setAgentId(activeAgentId.toString())
    }
  }, [activeAgentId])

  const handleFetchData = () => {
    const agentIdNum = parseInt(agentId)
    if (!agentIdNum || isNaN(agentIdNum)) {
      toast({
        title: "Invalid Agent ID",
        description: "Please enter a valid agent ID",
        variant: "destructive",
      })
      return
    }

    // If user is AGENT, only allow fetching their own data
    if (user?.role === "AGENT" && agentIdNum !== activeAgentId) {
      toast({
        title: "Access Denied",
        description: "You can only view your own accounting data",
        variant: "destructive",
      })
      return
    }

    clearGoldenEggsErrors()
    getGoldenEggsTotalAccounting(agentIdNum)

    if (filterType === "all") {
      getGoldenEggsDailyAccounting(agentIdNum)
    } else if (filterType === "unsettled") {
      getGoldenEggsUnsettledDailyAccounting(agentIdNum)
    } else if (filterType === "date" && selectedDate) {
      const dateStr = format(selectedDate, "yyyy-MM-dd")
      getGoldenEggsDailyAccountingByDate(agentIdNum, dateStr)
    } else if (filterType === "range" && startDate && endDate) {
      const startStr = format(startDate, "yyyy-MM-dd")
      const endStr = format(endDate, "yyyy-MM-dd")
      getGoldenEggsDailyAccountingByRange(agentIdNum, startStr, endStr)
    }
  }

  const handleSettle = async (id: number) => {
    if (user?.role !== "ADMIN") {
      toast({
        title: "Access Denied",
        description: "Only administrators can settle accounting records",
        variant: "destructive",
      })
      return
    }

    try {
      await settleGoldenEggsDailyAccounting(id)
      toast({
        title: "Success",
        description: "Daily accounting settled successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to settle",
        variant: "destructive",
      })
    }
  }

  const handleUnsettle = async (id: number) => {
    if (user?.role !== "ADMIN") {
      toast({
        title: "Access Denied",
        description: "Only administrators can unsettle accounting records",
        variant: "destructive",
      })
      return
    }

    try {
      await unsettleGoldenEggsDailyAccounting(id)
      toast({
        title: "Success",
        description: "Daily accounting unsettled successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to unsettle",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Configure your accounting query</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="agentId">Agent ID</Label>
              <Input
                id="agentId"
                type="number"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                placeholder="Enter agent ID"
                disabled={user?.role === "AGENT"}
              />
              {user?.role === "AGENT" && (
                <p className="text-xs text-muted-foreground">
                  You can only view your own accounting data
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Filter Type</Label>
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant={filterType === "all" ? "default" : "outline"}
                  onClick={() => setFilterType("all")}
                >
                  All Daily
                </Button>
                <Button
                  size="sm"
                  variant={filterType === "unsettled" ? "default" : "outline"}
                  onClick={() => setFilterType("unsettled")}
                >
                  Unsettled
                </Button>
                <Button
                  size="sm"
                  variant={filterType === "date" ? "default" : "outline"}
                  onClick={() => setFilterType("date")}
                >
                  By Date
                </Button>
                <Button
                  size="sm"
                  variant={filterType === "range" ? "default" : "outline"}
                  onClick={() => setFilterType("range")}
                >
                  By Range
                </Button>
              </div>
            </div>

            {filterType === "date" && (
              <div className="space-y-2">
                <Label>Select Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {filterType === "range" && (
              <>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "End date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </>
            )}
          </div>

          <Button onClick={handleFetchData} disabled={accountingLoading}>
            <RefreshCw className={cn("mr-2 h-4 w-4", accountingLoading && "animate-spin")} />
            Fetch Data
          </Button>
        </CardContent>
      </Card>

      {accountingError && (
        <Alert variant="destructive">
          <AlertDescription>{accountingError}</AlertDescription>
        </Alert>
      )}

      {goldenEggsTotalAccounting && (
        <Card>
          <CardHeader>
            <CardTitle>Total Accounting Summary</CardTitle>
            <CardDescription>Overall Golden Eggs accounting for Agent {agentId}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Bets Count</p>
                <p className="text-2xl font-bold">{goldenEggsTotalAccounting.totalBetsCount}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Bets Amount</p>
                <p className="text-2xl font-bold">{goldenEggsTotalAccounting.totalBetsAmount.toFixed(2)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Wins</p>
                <p className="text-2xl font-bold text-green-600">{goldenEggsTotalAccounting.totalWinsAmount.toFixed(2)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Loss</p>
                <p className="text-2xl font-bold text-red-600">{goldenEggsTotalAccounting.totalLossAmount.toFixed(2)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Net Profit</p>
                <p className={cn("text-2xl font-bold", goldenEggsTotalAccounting.totalNetProfitAmount >= 0 ? "text-green-600" : "text-red-600")}>
                  {goldenEggsTotalAccounting.totalNetProfitAmount.toFixed(2)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Rollback Count</p>
                <p className="text-2xl font-bold">{goldenEggsTotalAccounting.totalRollbackCount}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Rollback Amount</p>
                <p className="text-2xl font-bold">{goldenEggsTotalAccounting.totalRollbackAmount.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Daily Accounting</CardTitle>
          <CardDescription>Daily breakdown of Golden Eggs accounting</CardDescription>
        </CardHeader>
        <CardContent>
          {accountingLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : goldenEggsDailyAccountingList.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No daily accounting records found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Bets Count</TableHead>
                    <TableHead>Bets Amount</TableHead>
                    <TableHead>Wins</TableHead>
                    <TableHead>Loss</TableHead>
                    <TableHead>Net Profit</TableHead>
                    <TableHead>Rollback Count</TableHead>
                    <TableHead>Rollback Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {goldenEggsDailyAccountingList.map((record: GoldenEggsDailyAccounting) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.accountingDate}</TableCell>
                      <TableCell>{record.dailyBetsCount}</TableCell>
                      <TableCell>{record.dailyBetsAmount.toFixed(2)}</TableCell>
                      <TableCell className="text-green-600">{record.dailyWinsAmount.toFixed(2)}</TableCell>
                      <TableCell className="text-red-600">{record.dailyLossAmount.toFixed(2)}</TableCell>
                      <TableCell className={record.dailyNetProfitAmount >= 0 ? "text-green-600" : "text-red-600"}>
                        {record.dailyNetProfitAmount.toFixed(2)}
                      </TableCell>
                      <TableCell>{record.dailyRollbackCount}</TableCell>
                      <TableCell>{record.dailyRollbackAmount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={record.isSettled ? "default" : "secondary"}>
                          {record.isSettled ? "Settled" : "Unsettled"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user?.role === "ADMIN" ? (
                          <div className="flex gap-2">
                            {record.isSettled ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUnsettle(record.id)}
                                disabled={accountingLoading}
                              >
                                Unsettle
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleSettle(record.id)}
                                disabled={accountingLoading}
                              >
                                Settle
                              </Button>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Admin only
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
