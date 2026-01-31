import { AdminDailyAccountings } from "@/components/admin/admin-daily-accountings"

interface AdminDailyAccountingsPageProps {
  searchParams: Promise<{
    agentId?: number
  }>
}

export default async function AdminDailyAccountingsPage({ searchParams }: AdminDailyAccountingsPageProps) {
  const resolvedSearchParams = await searchParams
  return <AdminDailyAccountings agentId={resolvedSearchParams.agentId} />
}
