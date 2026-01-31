"use client"

import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"
import { useAgentStore } from "@/lib/stores/agent-store"
import { useEffect } from "react"
import i18n from "@/i18n"

export default function WithdrawFailedPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const agentId = searchParams.get("agentId")
  const {setActiveAgentId} = useAgentStore()

  useEffect(() => {
    if (agentId !== null) {
      setActiveAgentId(Number(agentId));
    } else {
      setActiveAgentId(null);
    }
  }, [agentId, setActiveAgentId]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="bg-[var(--card)] rounded-2xl shadow-xl p-8 max-w-md text-center">
        <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />

        <h1 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
          Withdrawal Failed ❌
        </h1>

        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Something went wrong while processing your withdrawal.  
          Please try again or contact support if the issue persists.
        </p>

        <div className="flex flex-col gap-3">
          <Button
            onClick={() => router.replace(`/${i18n.language}/withdraw?agentId=${agentId || ""}`)}
            className="w-full"
          >
            Try Again
          </Button>

          <Button
            onClick={() => router.replace(`/${i18n.language}/wallet?agentId=${agentId || ""}`)}
            className="w-full"
          >
            View Wallet
          </Button>

          <Button
            onClick={() => window.Telegram?.WebApp.close()}
            className="w-full"
          >
            Back To Telegram
          </Button>
        </div>
      </div>
    </div>
  )
}
