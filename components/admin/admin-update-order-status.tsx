"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon, Loader2 } from "lucide-react"
import { useAdminStore } from "@/lib/stores/admin-store"
import Link from "next/link"
import { useAgentStore } from "@/lib/stores/agent-store"
import i18n from "@/i18n"

interface UpdatePaymentOrderPageProps {
  orderId: number
}

export default function UpdatePaymentOrderPage({ orderId }: UpdatePaymentOrderPageProps) {
  const { orderDetail, isDetailLoading, detailError, fetchPaymentOrderDetail, updatePaymentOrderStatus } = useAdminStore()

  const {activeAgentId} = useAgentStore();
  const [approve, setApprove] = useState<string>("") // "true" or "false"
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Fetch order detail on page load
  useEffect(() => {
    fetchPaymentOrderDetail(orderId)
  }, [orderId])

  const handleUpdate = async () => {
    setError(null)
    setSuccess(null)

    if (!approve) {
      setError("Please select Approve or Reject")
      return
    }
    if (approve === "false" && reason.trim() === "") {
      setError("Reason is required for rejection")
      return
    }

    setLoading(true)
    try {
      await updatePaymentOrderStatus({
        agentId: activeAgentId!,
        orderId,
        approve: approve === "true",
        reason: reason.trim() || undefined,
      })

      setSuccess(`Order ${approve === "true" ? "approved" : "rejected"} successfully`)
      setApprove("")
      setReason("")
      await fetchPaymentOrderDetail(orderId)
    } catch (err: any) {
      setError(err.message || "Failed to update status")
    } finally {
      setLoading(false)
    }
  }

  if (isDetailLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[var(--background)]">
        <Loader2 className="w-10 h-10 animate-spin text-gray-300" />
      </div>
    )
  }

  if (!orderDetail) {
    return (
      <div className="text-center text-gray-300 min-h-screen flex items-center justify-center">
        {detailError || "No order data found"}
      </div>
    )
  }

  const order = orderDetail
  const user = order.userProfile
  const wallet = order.wallet

  // Determine if dropdown should be disabled
  const isFinalized = order.status === "COMPLETED" || order.status === "REJECTED"

  return (
    <div className="min-h-screen bg-[var(--background)] p-4 flex flex-col items-center space-y-6 text-white">
       <Link
          href={`/${i18n.language}/admin/payment-orders?agentId=${activeAgentId}`}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 font-medium"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back To Orders List
      </Link>
      <h1 className="text-3xl font-semibold">Payment Order #{order.id}</h1>

      {/* ---------------- ORDER DETAILS ---------------- */}
      <div className="w-full max-w-2xl bg-[var(--card)] p-6 rounded-lg shadow-md space-y-4">
        <h2 className="text-xl font-semibold">Order Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <LabelItem label="Status" value={order.status} />
          <LabelItem label="Amount" value={`${order.amount} ${order.currency}`} />
          <LabelItem label="Payment Method" value={order.paymentMethod.name}/>
          <LabelItem label="Txn Ref" value={order.txnRef} mono />
          <LabelItem label="Provider Ref" value={order.providerOrderRef} />
          <LabelItem label="Phone" value={order.phoneNumber} />
          <LabelItem label="Reason" value={order.reason || "-"} />
        </div>
      </div>

      {/* ---------------- USER DETAILS ---------------- */}
      {user && (
        <div className="w-full max-w-2xl bg-[var(--card)] p-6 rounded-lg shadow-md space-y-4">
          <h2 className="text-xl font-semibold">User Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <LabelItem label="Name" value={`${user.firstName} ${user.lastName}`} />
            <LabelItem label="Phone" value={user.phoneNumber} />
            <LabelItem label="Role" value={user.role} />
            <LabelItem label="Status" value={user.status} />
          </div>
        </div>
      )}

      {/* ---------------- WALLET DETAILS ---------------- */}
      {wallet && (
        <div className="w-full max-w-2xl bg-[var(--card)] p-6 rounded-lg shadow-md space-y-4">
          <h2 className="text-xl font-semibold">Wallet</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <LabelItem label="Total Balance" value={wallet.totalAvailableBalance} />
            <LabelItem label="Available to Withdraw" value={wallet.availableToWithdraw} />
            <LabelItem label="Pending Withdrawal" value={wallet.pendingWithdrawal} />
          </div>
        </div>
      )}

      {/* ---------------- UPDATE STATUS ---------------- */}
      <div className="w-full max-w-2xl bg-[var(--card)] p-6 rounded-lg shadow-md space-y-4">
        <h2 className="text-xl font-semibold">Update Status</h2>

        <div className="flex flex-col space-y-2">
          {error && <p className="text-red-400">{error}</p>}
          {success && <p className="text-green-400">{success}</p>}

          {isFinalized && (
            <p className="text-yellow-400">
              This order is already {order.status.toLowerCase()} and cannot be updated.
            </p>
          )}

          <div className="flex flex-col">
            <label className="text-gray-300 mb-1">Action</label>
            <select
              value={approve}
              onChange={(e) => setApprove(e.target.value)}
              className="bg-[var(--background)] text-white p-2 rounded"
              disabled={isFinalized}
            >
              <option value="">Select action</option>
              <option value="true">Approve</option>
              <option value="false">Reject</option>
            </select>
          </div>

          {approve === "false" && (
            <div className="flex flex-col">
              <label className="text-gray-300 mb-1">Reason</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for rejection"
                className="bg-gray-700 text-white p-2 rounded"
                disabled={isFinalized}
              />
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={handleUpdate}
              disabled={loading || isFinalized}
              className="flex items-center space-x-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Update Status</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function LabelItem({ label, value, mono }: { label: string; value: any; mono?: boolean }) {
  return (
    <div className="flex justify-between border-b border-gray-700 py-1 break-words">
      <span className="text-gray-300 font-medium">{label}</span>
      <span className={`${mono ? "font-mono" : ""} break-words text-white text-right`}>{value ?? "-"}</span>
    </div>
  )
}
