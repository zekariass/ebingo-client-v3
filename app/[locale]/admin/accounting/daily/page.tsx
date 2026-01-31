import { AdminDailyAccounting } from "@/components/admin/admin-daily-accounting"

interface AdminDailyAccountingPageProps {
  searchParams: Promise<{
    agentId?: number
  }>
}

export default async function AdminDailyAccountingPage({ searchParams }: AdminDailyAccountingPageProps) {
  const resolvedSearchParams = await searchParams
  return <AdminDailyAccounting agentId={resolvedSearchParams.agentId} />
}
