"use client"

import { useEffect, useState } from "react"
import { useAdminStore } from "@/lib/stores/admin-store"
import { userStore } from "@/lib/stores/user-store"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Loader2, Eye, Edit, ChevronLeft, ChevronRight, ArrowLeftIcon } from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { TransactionStatus, TransactionType } from "@/lib/types"
import { useRouter, useSearchParams } from "next/navigation"
import i18n from "@/i18n"
import Link from "next/link"
import { useAgentStore } from "@/lib/stores/agent-store"

export default function PaymentOrdersPage() {
  const { activeAgentId, setActiveAgentId } = useAgentStore();
  const searchParams = useSearchParams()
  const agentId = Number(searchParams.get("agentId")) || activeAgentId
  const { user } = userStore.getState()
  const role = user?.role

  const {
    orders,
    page,
    totalPages,
    isLoading,
    error,
    getPaymentOrders,
  } = useAdminStore()

  const [txnType, setTxnType] = useState<TransactionType>("DEPOSIT")
  const [status, setStatus] = useState<TransactionStatus>("COMPLETED")
  const [phoneNumber, setPhoneNumber] = useState("")

  useEffect(() => {
    const urlAgentId = Number(searchParams.get("agentId"))
    if (urlAgentId && urlAgentId !== activeAgentId) {
      setActiveAgentId(urlAgentId)
    }
  }, [searchParams, activeAgentId, setActiveAgentId])

  useEffect(() => {
    if (agentId) {
      getPaymentOrders(agentId, txnType, status, 0, 10, phoneNumber)
    }
  }, [agentId])

  useEffect(() => {
    if (error) toast.error(error)
  }, [error])

  const handleSearch = () => {
    if (agentId) {
      getPaymentOrders(agentId, txnType, status, 0, 10, phoneNumber)
    }
  }

  const handlePageChange = (newPage: number) => {
    if (agentId && newPage >= 0 && newPage < totalPages) {
      getPaymentOrders(agentId, txnType, status, newPage, 10, phoneNumber)
    }
  }

  const router = useRouter()

  const handleView = (id: number) => {
    router.push(`/${i18n.language}/admin/payment-orders/${id}?agentId=${agentId}`)
}

  const handleUpdate = (id: number) => {
    router.push(`/${i18n.language}/admin/payment-orders/${id}/update?agentId=${agentId}`)
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <Link
          href={`/${i18n.language}/admin/rooms?agentId=${agentId}`}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 font-medium"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back To Dashboard
      </Link>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Payment Orders</h1>

        <div className="flex flex-wrap gap-2 items-center">
          <select
            className="border border-gray-100 dark:border-gray-100 rounded-xl px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition "
            value={txnType}
            onChange={(e) => setTxnType(e.target.value as any)}
          >
            <option value="DEPOSIT" className="text-primary-foreground">Deposits</option>
            <option value="WITHDRAWAL" className="text-primary-foreground">Withdrawals</option>
          </select>

          <select
            className="border border-gray-100 dark:border-gray-100 rounded-xl px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
          >
            <option value="PENDING" className="text-primary-foreground">Pending</option>
            <option value="INITIATED" className="text-primary-foreground">Initiated</option>
            <option value="AWAITING_APPROVAL" className="text-primary-foreground">Awaiting Approval</option>
            <option value="COMPLETED" className="text-primary-foreground">Completed</option>
            <option value="FAILED" className="text-primary-foreground">Failed</option>
            <option value="REJECTED" className="text-primary-foreground">Rejected</option>
            <option value="CANCELLED" className="text-primary-foreground">Cancelled</option>
          </select>

          <input
            type="text"
            placeholder="Phone number"
            className="border border-gray-100 dark:border-gray-100 rounded-xl px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />

          <Button onClick={handleSearch}>Search</Button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="rounded-2xl border bg-[var(--card)] overflow-hidden shadow-sm">
        <div className="hidden md:block">
          <Table>
            <TableHeader className="bg-[var(--background)] sticky top-0">
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Txn Ref</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-500" />
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6 text-gray-500">
                    No results found
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                  >
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.userId}</TableCell>
                    <TableCell className="font-mono text-sm text-gray-700 dark:text-gray-300">{order.txnRef}</TableCell>
                    <TableCell>{order.txnType}</TableCell>
                    <TableCell>{order.amount} {order.currency}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "COMPLETED"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(order.createdAt ?? "").toLocaleString()}</TableCell>
                    <TableCell className="flex gap-2 justify-center">
                      <Button size="sm" onClick={() => handleView(order.id)}>
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                      <Button size="sm" onClick={() => handleUpdate(order.id)}>
                        <Edit className="h-4 w-4 mr-1" /> Update
                      </Button>
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Tabular View */}
        <div className="md:hidden divide-y">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              No results found
            </div>
          ) : (
            orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="p-4"
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-3">
                  <div className="font-semibold text-base">
                    #{order.id}
                  </div>

                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : order.status === "COMPLETED"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Two-column table-like layout */}
                <div className="grid grid-cols-2 text-sm gap-y-2 border rounded-lg p-3 bg-[var(--background)]">
                  <div className="font-medium text-gray-700 dark:text-gray-300">User ID</div>
                  <div className="text-right">{order.userId}</div>

                  <div className="font-medium text-gray-700 dark:text-gray-300">Txn Ref</div>
                  <div className="text-right font-mono">{order.txnRef}</div>

                  <div className="font-medium text-gray-700 dark:text-gray-300">Type</div>
                  <div className="text-right">{order.txnType}</div>

                  <div className="font-medium text-gray-700 dark:text-gray-300">Amount</div>
                  <div className="text-right">
                    {order.amount} {order.currency}
                  </div>

                  <div className="font-medium text-gray-700 dark:text-gray-300">Created</div>
                  <div className="text-right">
                    {new Date(order.createdAt ?? "").toLocaleString()}
                  </div>
                </div>

                <div className="flex gap-2 justify-end mt-3">
                  <Button size="sm" onClick={() => handleView(order.id)}>
                    <Eye className="h-4 w-4 mr-1" /> View
                  </Button>
                  <Button size="sm" onClick={() => handleUpdate(order.id)}>
                    <Edit className="h-4 w-4 mr-1" /> Update
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-3">
        <Button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 0 || isLoading}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </Button>

        <span className="text-sm text-gray-600">
          Page {page + 1} of {Math.max(1, totalPages)}
        </span>

        <Button
          onClick={() => handlePageChange(page + 1)}
          disabled={page >= totalPages - 1 || isLoading}
          className="flex items-center gap-1"
        >
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
