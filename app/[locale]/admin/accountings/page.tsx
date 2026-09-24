import { AccountingsTabs } from "@/components/admin/accountings-tabs"

interface AdminAccountingsPageProps {
  searchParams: Promise<{
    agentId?: string
    tab?: string
  }>
}

export default async function AdminAccountingsPage({ searchParams }: AdminAccountingsPageProps) {
  const resolvedSearchParams = await searchParams
  const agentId = Number(resolvedSearchParams.agentId)
  return (
    <AccountingsTabs
      agentId={Number.isFinite(agentId) && agentId > 0 ? agentId : undefined}
      initialTab={resolvedSearchParams.tab}
    />
  )
}
