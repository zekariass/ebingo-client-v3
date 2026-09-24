"use client"

import { useEffect, useMemo } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  ArrowLeftIcon,
  AlertCircle,
  CreditCard,
  Landmark,
  Loader2,
  User,
  Wallet,
} from "lucide-react"
import { format } from "date-fns"

import { useAdminStore } from "@/lib/stores/admin-store"
import { useAgentStore } from "@/lib/stores/agent-store"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import i18n from "@/i18n"

type BankMetaData = {
  phoneNumber?: string
  accountName?: string
  bankName?: string
  accountNumber?: string
  [key: string]: unknown
}

const formatLabel = (key: string) =>
  key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())

const formatDate = (value?: string | null) =>
  value ? format(new Date(value), "PPpp") : "-"

function parseMetaData(value: unknown): Record<string, unknown> | null {
  if (!value) return null
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value)
      return typeof parsed === "object" && parsed !== null
        ? (parsed as Record<string, unknown>)
        : null
    } catch {
      return null
    }
  }
  return typeof value === "object" ? (value as Record<string, unknown>) : null
}

const statusStyles: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  INITIATED: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  AWAITING_APPROVAL: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  FAILED: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  REJECTED: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  CANCELLED: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
}

function StatusBadge({ status }: { status?: string }) {
  return (
    <span
      className={cn(
        "px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide",
        statusStyles[status ?? ""] ?? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
      )}
    >
      {status?.replace(/_/g, " ") ?? "UNKNOWN"}
    </span>
  )
}

function DetailItem({
  label,
  value,
  mono,
}: {
  label: string
  value: React.ReactNode
  mono?: boolean
}) {
  return (
    <div className="flex justify-between items-start gap-4 py-2 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
      <span className="text-sm text-gray-500 dark:text-gray-400 shrink-0">{label}</span>
      <span
        className={cn(
          "text-sm font-medium text-right break-all",
          mono && "font-mono text-xs sm:text-sm"
        )}
      >
        {value ?? "-"}
      </span>
    </div>
  )
}

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType
  title: string
  children: React.ReactNode
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-2 py-3 border-b border-gray-100 dark:border-gray-800">
        <Icon className="w-4 h-4 text-blue-500" />
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 py-2">
        {children}
      </CardContent>
    </Card>
  )
}

function DetailSkeleton() {
  return (
    <div className="w-full px-3 sm:px-4 py-4 space-y-4 max-w-7xl mx-auto">
      <Skeleton className="h-5 w-40" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-7 w-24 rounded-full" />
      </div>
      {[0, 1, 2].map((i) => (
        <Card key={i} className="p-4 space-y-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </Card>
      ))}
    </div>
  )
}

export default function PaymentOrderDetailPage({ id }: { id: number }) {
  const {
    orderDetail,
    isDetailLoading,
    detailError,
    fetchPaymentOrderDetail,
  } = useAdminStore()

  const { activeAgentId } = useAgentStore()
  const searchParams = useSearchParams()
  const agentId = Number(searchParams.get("agentId")) || activeAgentId

  useEffect(() => {
    if (agentId) {
      fetchPaymentOrderDetail(Number(id), agentId)
    }
  }, [id, agentId, fetchPaymentOrderDetail])

  const metaData = useMemo(
    () => parseMetaData(orderDetail?.metaData),
    [orderDetail?.metaData]
  )

  const backHref = `/${i18n.language}/admin/payment-orders?agentId=${agentId}`

  if (isDetailLoading) {
    return <DetailSkeleton />
  }

  if (!orderDetail) {
    return (
      <div className="w-full px-3 sm:px-4 py-4 max-w-7xl mx-auto">
        <Link
          href={backHref}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium mb-6"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back To Orders List
        </Link>
        <Card className="py-16 flex flex-col items-center gap-3 text-center">
          <AlertCircle className="w-10 h-10 text-gray-400" />
          <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
            {detailError || "No data found"}
          </p>
          <p className="text-sm text-gray-400">
            The order could not be loaded. It may not exist or you may not have access.
          </p>
        </Card>
      </div>
    )
  }

  const order = orderDetail
  const user = order.userProfile
  const wallet = order.wallet
  const bankMeta = metaData as BankMetaData | null
  const showBankCard =
    order.txnType === "WITHDRAWAL" && bankMeta && Object.keys(bankMeta).length > 0

  return (
    <div className="w-full px-3 sm:px-4 py-4 space-y-4 max-w-7xl mx-auto">
      <Link
        href={backHref}
        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
      >
        <ArrowLeftIcon className="w-4 h-4 mr-2" />
        Back To Orders List
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Payment Order #{order.id}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mt-0.5 break-all">
            {order.txnRef}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "px-2.5 py-1 rounded-full text-xs font-semibold",
              order.txnType === "DEPOSIT"
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                : "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300"
            )}
          >
            {order.txnType}
          </span>
          <StatusBadge status={order.status} />
        </div>
      </div>

      {/* Amount summary */}
      <Card className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Amount
          </p>
          <p className="text-2xl sm:text-3xl font-bold tabular-nums">
            {order.amount} <span className="text-base font-semibold">{order.currency}</span>
          </p>
        </div>
        <div className="text-right text-sm text-gray-500 dark:text-gray-400 space-y-0.5">
          <p>
            Method: <span className="font-medium text-[var(--foreground)]">{order.paymentMethod?.name ?? "-"}</span>
          </p>
          <p>Created: {formatDate(order.createdAt)}</p>
        </div>
      </Card>

      {/* Order info */}
      <SectionCard icon={CreditCard} title="Payment Order">
        <DetailItem label="Order ID" value={order.id} />
        <DetailItem label="User ID" value={order.userId} />
        <DetailItem label="Txn Ref" value={order.txnRef} mono />
        <DetailItem label="Provider Ref" value={order.providerOrderRef} mono />
        <DetailItem label="Type" value={order.txnType} />
        <DetailItem label="Status" value={<StatusBadge status={order.status} />} />
        <DetailItem label="Phone" value={order.phoneNumber} />
        <DetailItem label="Reason" value={order.reason || "-"} />
        <DetailItem label="Nonce" value={order.nonce || "-"} mono />
        <DetailItem
          label="Payment Method"
          value={order.paymentMethod ? `${order.paymentMethod.name} (#${order.paymentMethod.id})` : "-"}
        />
        <DetailItem
          label="Instructions"
          value={
            order.instructionsUrl ? (
              <a
                href={order.instructionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Open link
              </a>
            ) : (
              "-"
            )
          }
        />
        <DetailItem label="Approved By" value={order.approvedBy ?? "-"} />
        <DetailItem label="Created" value={formatDate(order.createdAt)} />
        <DetailItem label="Updated" value={formatDate(order.updatedAt)} />
      </SectionCard>

      {/* Bank / meta details */}
      {showBankCard && (
        <SectionCard icon={Landmark} title="Bank Details">
          {Object.entries(bankMeta).map(([key, value]) => (
            <DetailItem
              key={key}
              label={formatLabel(key)}
              value={value == null ? "-" : String(value)}
            />
          ))}
        </SectionCard>
      )}
      {!showBankCard && metaData && Object.keys(metaData).length > 0 && (
        <SectionCard icon={Landmark} title="Additional Details">
          {Object.entries(metaData).map(([key, value]) => (
            <DetailItem
              key={key}
              label={formatLabel(key)}
              value={value == null ? "-" : String(value)}
            />
          ))}
        </SectionCard>
      )}

      {/* User info */}
      <SectionCard icon={User} title="User Profile">
        <DetailItem label="User ID" value={user?.id} />
        <DetailItem label="Telegram ID" value={user?.telegramId} />
        <DetailItem label="First Name" value={user?.firstName} />
        <DetailItem label="Last Name" value={user?.lastName} />
        <DetailItem label="Nickname" value={user?.nickname} />
        <DetailItem label="Phone" value={user?.phoneNumber} />
        <DetailItem label="Role" value={user?.role} />
        <DetailItem label="Status" value={user?.status} />
        <DetailItem label="Has Password" value={user ? (user.hasPassword ? "Yes" : "No") : "-"} />
      </SectionCard>

      {/* Wallet info */}
      <SectionCard icon={Wallet} title="Wallet">
        <DetailItem label="Wallet ID" value={wallet?.id} />
        <DetailItem label="Total Balance" value={wallet?.totalAvailableBalance} />
        <DetailItem label="Available to Withdraw" value={wallet?.availableToWithdraw} />
        <DetailItem label="Pending Withdrawal" value={wallet?.pendingWithdrawal} />
        <DetailItem label="Welcome Bonus" value={wallet?.welcomeBonus} />
        <DetailItem label="Available Welcome Bonus" value={wallet?.availableWelcomeBonus} />
        <DetailItem label="Referral Bonus" value={wallet?.referralBonus} />
        <DetailItem label="Available Referral Bonus" value={wallet?.availableReferralBonus} />
        <DetailItem label="Prize Amount" value={wallet?.totalPrizeAmount} />
        <DetailItem label="Locked Amount" value={wallet?.lockedAmount} />
        <DetailItem label="Deposit Bonus" value={wallet?.depositBonus} />
        <DetailItem label="Promo Bonus" value={wallet?.promotionalBonus} />
        <DetailItem label="Last Payment From" value={wallet?.lastPaymentFrom || "-"} />
      </SectionCard>

      <div className="flex justify-end pb-2">
        <Button variant="outline" onClick={() => history.back()}>
          Back
        </Button>
      </div>
    </div>
  )
}
