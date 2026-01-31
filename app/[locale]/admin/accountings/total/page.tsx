import { AdminTotalAccountings } from "@/components/admin/admin-total-accountings"

interface AdminTotalAccountingsPageProps {
  searchParams: Promise<{
    agentId?: number
  }>
}

export default async function AdminTotalAccountingsPage({ searchParams }: AdminTotalAccountingsPageProps) {
  const resolvedSearchParams = await searchParams
  return <AdminTotalAccountings agentId={resolvedSearchParams.agentId} />
}
