"use client"

import { useEffect, useMemo } from "react"
import Link from "next/link"
import { ArrowLeftIcon, CreditCard, Loader2, User, Wallet } from "lucide-react"

import { useAdminStore } from "@/lib/stores/admin-store"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import i18n from "@/i18n"

/* ------------------------------------------------------------------
   Types
------------------------------------------------------------------- */
type BankMetaData = {
  phoneNumber?: string
  accountName?: string
  bankName?: string
  accountNumber?: string
}

/* ------------------------------------------------------------------
   Utils
------------------------------------------------------------------- */
const formatLabel = (key: string) =>
  key.replace(/([A-Z])/g, " $1").replace(/^./, c => c.toUpperCase())

function parseBankMetaData(value: unknown): BankMetaData | null {
  if (!value) return null

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value)
      return typeof parsed === "object" && parsed !== null
        ? parsed as BankMetaData
        : null
    } catch {
      return null
    }
  }

  if (typeof value === "object") {
    return value as BankMetaData
  }

  return null
}

/* ------------------------------------------------------------------
   Components
------------------------------------------------------------------- */
function BankDetails({ data }: { data: BankMetaData }) {
  return (
    <div className="rounded-lg border bg-[var(--background)] p-3 space-y-2">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="flex justify-between gap-4">
          <span className="text-sm text-gray-600">
            {formatLabel(key)}
          </span>
          <span className="text-sm font-medium text-gray-900">
            {value ?? "-"}
          </span>
        </div>
      ))}
    </div>
  )
}

function LabelItem({
  label,
  value,
  mono,
}: {
  label: string
  value: React.ReactNode
  mono?: boolean
}) {
  return (
    <div className="flex justify-between items-start border-b border-gray-700 py-2 break-words">
      <span className="text-gray-300 font-medium">{label}</span>
      <span className={`${mono ? "font-mono text-white" : "text-white"} break-words text-right`}>
        {value ?? "-"}
      </span>
    </div>
  )
}

/* ------------------------------------------------------------------
   Page
------------------------------------------------------------------- */
export default function PaymentOrderDetailPage({ id }: { id: number }) {
  const {
    orderDetail,
    isDetailLoading,
    detailError,
    fetchPaymentOrderDetail
  } = useAdminStore()

  useEffect(() => {
    fetchPaymentOrderDetail(Number(id))
  }, [id, fetchPaymentOrderDetail])

  const bankMetaData = useMemo(
    () => parseBankMetaData(orderDetail?.metaData),
    [orderDetail?.metaData]
  )

  if (isDetailLoading) {
    return (
      <div className="flex justify-center items-center py-20 bg-[var(--background)] min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-gray-300" />
      </div>
    )
  }

  if (!orderDetail) {
    return (
      <div className="text-center text-gray-300 py-20 text-lg bg-[var(--background)] min-h-screen">
        {detailError || "No data found"}
      </div>
    )
  }

  const order = orderDetail
  const user = order.userProfile
  const wallet = order.wallet

  return (
    <div className="w-full p-4 md:p-6 space-y-6 bg-[var(--background)] min-h-screen">

      <Link
        href={`/${i18n.language}/admin/payment-orders?agentId=${order.agentId}`}
        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
      >
        <ArrowLeftIcon className="w-4 h-4 mr-2" />
        Back To Orders List
      </Link>

      <h1 className="text-3xl font-semibold text-white">
        Payment Order Details
      </h1>

      {/* ---------------- ORDER INFO ---------------- */}
      <Card className="border border-gray-700">
        <CardHeader className="flex items-center space-x-2">
          <CreditCard className="w-5 h-5 text-blue-400" />
          <CardTitle className="text-white">Payment Order</CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <LabelItem label="Order ID" value={order.id} />
          <LabelItem label="User ID" value={order.userId} />
          <LabelItem label="Txn Ref" value={order.txnRef} mono />
          <LabelItem label="Provider Ref" value={order.providerOrderRef} />
          <LabelItem label="Amount" value={`${order.amount} ${order.currency}`} />
          <LabelItem label="Type" value={order.txnType} />
          <LabelItem label="Status" value={order.status} />
          <LabelItem label="Phone" value={order.phoneNumber} />
          <LabelItem label="Reason" value={order.reason || "-"} />
          <LabelItem label="Nonce" value={order.nonce || "-"} />
          <LabelItem label="Payment Method ID" value={order.paymentMethod.id} />
          <LabelItem label="Payment Method Name" value={order.paymentMethod.name} />
          <LabelItem label="Instructions URL" value={order.instructionsUrl || "-"} />

          {bankMetaData && order.txnType === "WITHDRAWAL" && (
            <LabelItem
              label="Bank Details"
              value={<BankDetails data={bankMetaData} />}
            />
          )}
        </CardContent>
      </Card>

      {/* ---------------- USER INFO ---------------- */}
      <Card className="border border-gray-700">
        <CardHeader className="flex items-center space-x-2">
          <User className="w-5 h-5 text-green-400" />
          <CardTitle className="text-white">User Profile</CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <LabelItem label="User ID" value={user?.id} />
          <LabelItem label="Telegram ID" value={user?.telegramId} />
          <LabelItem label="First Name" value={user?.firstName} />
          <LabelItem label="Last Name" value={user?.lastName} />
          <LabelItem label="Nickname" value={user?.nickname} />
          <LabelItem label="Phone" value={user?.phoneNumber} />
          <LabelItem label="Role" value={user?.role} />
          <LabelItem label="Status" value={user?.status} />
          <LabelItem label="Has Password" value={user?.hasPassword ? "Yes" : "No"} />
        </CardContent>
      </Card>

      {/* ---------------- WALLET INFO ---------------- */}
      <Card className="border border-gray-700">
        <CardHeader className="flex items-center space-x-2">
          <Wallet className="w-5 h-5 text-yellow-400" />
          <CardTitle className="text-white">Wallet</CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <LabelItem label="Wallet ID" value={wallet?.id} />
          <LabelItem label="Total Balance" value={wallet?.totalAvailableBalance} />
          <LabelItem label="Available to Withdraw" value={wallet?.availableToWithdraw} />
          <LabelItem label="Pending Withdrawal" value={wallet?.pendingWithdrawal} />
          <LabelItem label="Welcome Bonus" value={wallet?.welcomeBonus} />
          <LabelItem label="Available Welcome Bonus" value={wallet?.availableWelcomeBonus} />
          <LabelItem label="Referral Bonus" value={wallet?.referralBonus} />
          <LabelItem label="Available Referral Bonus" value={wallet?.availableReferralBonus} />
          <LabelItem label="Prize Amount" value={wallet?.totalPrizeAmount} />
          <LabelItem label="Locked Amount" value={wallet?.lockedAmount} />
          <LabelItem label="Deposit Bonus" value={wallet?.depositBonus} />
          <LabelItem label="Promo Bonus" value={wallet?.promotionalBonus} />
          <LabelItem label="Last Payment From" value={wallet?.lastPaymentFrom || "-"} />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => history.back()}>
          Back
        </Button>
      </div>
    </div>
  )
}
