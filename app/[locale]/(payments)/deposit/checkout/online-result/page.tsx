'use client'

import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { usePaymentStore } from '@/lib/stores/payment-store'

// Success Component
function SuccessMessage() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center space-y-4 py-6">
      <CheckCircle2 className="text-green-500 w-16 h-16" />
      <h2 className="text-lg font-semibold text-green-600">
        Payment Successful!
      </h2>
      <p className="text-gray-600 text-sm">
        Your payment has been successfully processed.
      </p>

      <div className="flex gap-3 mt-6">
        <Button onClick={() => router.push('/')} className="flex-1 text-white">
          Go To Web
        </Button>

        <Button onClick={() => {
          window.Telegram?.WebApp.close()
        }} className="flex-1 text-white">
          Go To Telegram
        </Button>
      </div>
    </div>
  )
}

// Error Component
function ErrorMessage() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center space-y-4 py-6">
      <XCircle className="text-red-500 w-16 h-16" />
      <h2 className="text-lg font-semibold text-red-600">
        Something went wrong while processing your payment.
      </h2>
      <p className="text-gray-600 text-sm">
        Please try again or contact support if the issue persists.
      </p>

      <div className="flex gap-3 mt-6">
        <Button
          onClick={() => router.push('/')}
          variant="default"
          className="flex-1"
        >
          Go Home
        </Button>
        <Button
          onClick={() => router.push(`/${'en'}/deposit`)}
          variant="outline"
          className="flex-1"
        >
          Try Again
        </Button>
      </div>
    </div>
  )
}

export default function CheckoutResultPage() {
  const { checkoutResult, processing } = usePaymentStore()
  const isSuccess =
    checkoutResult &&
    (checkoutResult.status
      ? checkoutResult.status >= 200 &&
        checkoutResult.status < 300
      : false)

  return (
    <AnimatePresence>
      <motion.div
        key="checkout-result"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
        className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6"
      >
        <Card className="w-full max-w-lg rounded-2xl shadow-xl p-4 text-center">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800 dark:text-white">
              Payment Result
            </CardTitle>
          </CardHeader>

          <CardContent>
            {processing ? (
              <div className="flex flex-col items-center justify-center py-10">
                <Loader2 className="animate-spin w-10 h-10 text-blue-500 mb-4" />
                <p className="">Loading payment result...</p>
              </div>
            ) : checkoutResult ? (
              isSuccess ? <SuccessMessage /> : <ErrorMessage />
            ) : (
              <div className="py-6 text-gray-500">
                No checkout result found. Please try again.
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}
