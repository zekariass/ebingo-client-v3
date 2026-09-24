import { redirect } from "next/navigation"

interface PageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ agentId?: string }>
}

export default async function TotalLeaderboardRedirect({ params, searchParams }: PageProps) {
  const { locale } = await params
  const sp = await searchParams
  const q = new URLSearchParams({ tab: "total" })
  if (sp.agentId) q.set("agentId", String(sp.agentId))
  redirect(`/${locale}/admin/leaderboard?${q}`)
}
