import { AdminRooms } from "@/components/admin/admin-rooms"

interface AdminRoomsPageProps {
  searchParams: Promise<{
    agentId?: number
  }>
}

export default async function AdminRoomsPage({ searchParams }: AdminRoomsPageProps) {
  const resolvedSearchParams = await searchParams
  return <AdminRooms agentId={resolvedSearchParams.agentId} />
}
