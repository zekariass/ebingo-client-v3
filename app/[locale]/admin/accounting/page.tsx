import { AccountingTabs } from "@/components/admin/accounting-tabs"

interface AdminAccountingPageProps {
  searchParams: Promise<{
    agentId?: string
    tab?: string
  }>
}

export default async function AdminAccountingPage({ searchParams }: AdminAccountingPageProps) {
  const resolvedSearchParams = await searchParams
  const agentId = Number(resolvedSearchParams.agentId)
  return (
    <AccountingTabs
      agentId={Number.isFinite(agentId) && agentId > 0 ? agentId : undefined}
      initialTab={resolvedSearchParams.tab}
    />
  )
}
