"use client"

import { XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import i18n from "@/i18n"


export default function TransferFailurePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const agentId = searchParams.get("agentId")
  const reason = searchParams.get("reason") || "Something went wrong during your transfer."

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <Card className="max-w-md w-full p-2 text-center">
        <div className="rounded-2xl shadow-xl p-8 max-w-md text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />

          <h1 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
            Transfer Failed 😞
          </h1>

          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {reason}
          </p>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => router.push(`/${i18n.language}/transfer?agentId=${agentId}`)}
              className="w-full"
            >
              Try Again
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push(`/${i18n.language}/wallet?agentId=${agentId}`)}
              className="w-full"
            >
              Go to Wallet
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
