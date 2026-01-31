import { AdminTotalAccounting } from "@/components/admin/admin-total-accounting"

interface AdminTotalAccountingPageProps {
  searchParams: Promise<{
    agentId?: number
  }>
}

export default async function AdminTotalAccountingPage({ searchParams }: AdminTotalAccountingPageProps) {
  const resolvedSearchParams = await searchParams
  return <AdminTotalAccounting agentId={resolvedSearchParams.agentId} />
}
