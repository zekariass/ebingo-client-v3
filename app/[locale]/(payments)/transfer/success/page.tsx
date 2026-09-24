"use client"

import { useEffect } from "react"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"
import { useAgentStore } from "@/lib/stores/agent-store"
import { Card } from "@/components/ui/card"
import i18n from "@/lib/i18n/config"

export default function TransferSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const agentId = searchParams.get("agentId") ? Number(searchParams.get("agentId")) : undefined
  const {setActiveAgentId} = useAgentStore()

  useEffect(() => {
    setActiveAgentId(agentId ?? null);
  }, [agentId, setActiveAgentId]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <Card className="max-w-md w-full p-2 text-center">
          <div className="rounded-2xl shadow-xl p-8 max-w-md text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />

          <h1 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
            Transfer Successful 🎉
          </h1>

          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Your funds have been successfully transferred to the recipient.
          </p>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => router.push(`/${i18n.language}/wallet?agentId=${agentId}`)}
              className="w-full"
            >
              View Wallet
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push(`/${i18n.language}?agentId=${agentId}`)}
              className="w-full"
            >
              Back to Home
            </Button>

            <Button
              variant="outline"
              onClick={() => window.Telegram?.WebApp.close()}
              className="w-full"
            >
              Back To Telegram
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
