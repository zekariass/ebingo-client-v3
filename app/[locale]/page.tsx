import { Lobby } from "@/components/lobby/lobby"
interface HomePageProps {
  searchParams: Promise<{
    agentId?: number
  }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = await searchParams
  const agentId = resolvedSearchParams.agentId

  return <Lobby agentId={agentId} />
}
