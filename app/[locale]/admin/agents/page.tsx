import { AdminAgents } from "@/components/admin/admin-agents"

interface AdminAgentsPageProps {
  searchParams: Promise<{
    agentId?: number
  }>
}

export default async function AdminAgentsPage({ searchParams }: AdminAgentsPageProps) {
  const resolvedSearchParams = await searchParams
  return <AdminAgents agentId={resolvedSearchParams.agentId} />
}
