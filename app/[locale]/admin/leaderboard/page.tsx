import { LeaderboardTabs } from "@/components/admin/leaderboard-tabs"

interface AdminLeaderboardPageProps {
  searchParams: Promise<{
    tab?: string
  }>
}

export default async function AdminLeaderboardPage({ searchParams }: AdminLeaderboardPageProps) {
  const resolvedSearchParams = await searchParams
  return <LeaderboardTabs initialTab={resolvedSearchParams.tab} />
}
