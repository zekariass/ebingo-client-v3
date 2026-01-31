"use client"

import { useEffect, useState } from "react"
import { usePaymentStore } from "@/lib/stores/payment-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  RefreshCw,
  History,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { GameTransactionStatus, GameTransactionType } from "@/lib/types"
import { useAgentStore } from "@/lib/stores/agent-store"

export function GameTransactionHistory() {
  const {activeAgentId} = useAgentStore()
  const {
    gameTransactions,
    fetchGameTransactions,
    loading,
    setLoading,
    gameTxnError,
    setGameTxnError,
  } = usePaymentStore()

  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [hasMore, setHasMore] = useState(true)

  const txns = Array.isArray(gameTransactions)
    ? gameTransactions
    : gameTransactions ?? []

  const loadTransactions = async (refresh = false, newPage = page) => {
      try {
        setLoading(true)
        setGameTxnError(null)
        await fetchGameTransactions(activeAgentId || 0, newPage, pageSize, "createdAt", refresh)
      } catch (err) {
        setGameTxnError(
          err instanceof Error ? err.message : "Failed to load game transactions"
        )
      } finally {
        setLoading(false)
      }
    }

    // ✅ When transactions change, update hasMore
    useEffect(() => {
      // If the API returns fewer than `pageSize` items, it means no more data
      setHasMore(gameTransactions?.length === pageSize)
    }, [gameTransactions, pageSize])

    useEffect(() => {
      loadTransactions(true, page)
    }, [page])

  const getTransactionIcon = (type: GameTransactionType) => {
    switch (type) {
      case GameTransactionType.GAME_FEE:
        return <ArrowDownLeft className="h-4 w-4 text-blue-600" />
      case GameTransactionType.PRIZE_PAYOUT:
        return <ArrowUpRight className="h-4 w-4 text-green-600" />
      case GameTransactionType.REFUND:
        return <CreditCard className="h-4 w-4 text-red-600" />
      default:
        return <CreditCard className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: GameTransactionStatus) => {
    switch (status) {
      case GameTransactionStatus.SUCCESS:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case GameTransactionStatus.AWAITING_APPROVAL:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case GameTransactionStatus.PENDING:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case GameTransactionStatus.FAIL:
      case GameTransactionStatus.CANCELLED:
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const formatAmount = (amount: number, type: GameTransactionType) => {
    const isPositive = amount > 0 || type === GameTransactionType.PRIZE_PAYOUT
    const prefix = isPositive ? "+" : ""
    const color = isPositive
      ? "text-green-600 dark:text-green-400"
      : "text-red-600 dark:text-red-400"

    return (
      <span className={`font-semibold ${color}`}>
        {prefix}${Math.abs(amount).toFixed(2)}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Game Transaction History
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadTransactions(true, page)}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {gameTxnError && (
          <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg mb-4">
            <p className="text-red-700 dark:text-red-300 text-sm">
              {gameTxnError}
            </p>
          </div>
        )}

        {loading && (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-12 bg-muted/50 animate-pulse rounded-lg"
              />
            ))}
          </div>
        )}

        {!loading && txns.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No transactions yet</p>
            <p className="text-sm">Your transaction history will appear here</p>
          </div>
        )}

        {!loading && txns.length > 0 && (
          <>
            <ScrollArea className="h-96 overflow-x-auto">
              <div className="space-y-3 min-w-full">
                {txns.map((transaction, index) => (
                  <div key={transaction.id ?? index}>
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        {getTransactionIcon(transaction.txnType)}
                        <div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="secondary"
                              className={`text-xs ${getStatusColor(transaction.txnStatus)}`}
                            >
                              {transaction.txnType}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(transaction.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {formatAmount(
                          transaction.txnAmount,
                          transaction.txnType
                        )}
                      </div>
                    </div>

                    {index < txns.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Pagination controls */}
            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1 || loading}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Prev
              </Button>

              <span className="text-sm text-muted-foreground">Page {page}</span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasMore || loading}
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
