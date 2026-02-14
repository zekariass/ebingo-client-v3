"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useExternalGameStore } from "@/lib/stores/external-game-store"
import { GameOptionsGrid } from "@/components/game-options/game-options-grid"
import { LobbyHeader } from "@/components/lobby/lobby-header"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { useAgentStore } from "@/lib/stores/agent-store"
import { usePaymentStore } from "@/lib/stores/payment-store"
import { useTelegramInit } from "@/lib/hooks/use-telegram-init"

export default function GameOptionsPage() {
  useTelegramInit()
  
  const searchParams = useSearchParams()
  const agentId = Number(searchParams.get("agentId"))
  const { gameModes, loading, error, fetchGameModes } = useExternalGameStore()
  const { setActiveAgentId, fetchAgentDetails } = useAgentStore();

  const {fetchPaymentMethods, fetchTransactions, fetchWallet} = usePaymentStore()

   // Fetch all payment data
  async function fetchPaymentData() {
    await Promise.all([
      // fetchUserProfile(),
      fetchWallet(true, agentId!),
      fetchPaymentMethods(),
      fetchTransactions(agentId!, 1, 10, true),
    ])  
  }

useEffect(() => {
      fetchPaymentData();
  }, []);
  
  useEffect(() => {
    setActiveAgentId(Number(agentId))
    fetchAgentDetails(Number(agentId))
  }, [agentId])

  useEffect(() => {
    fetchGameModes()
  }, [fetchGameModes])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 dark:text-purple-400" />
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Loading games...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <LobbyHeader />
      <div className="container mx-auto px-4 py-8">
        <GameOptionsGrid gameModes={gameModes} agentId={agentId} />
      </div>
    </div>
  )
}
