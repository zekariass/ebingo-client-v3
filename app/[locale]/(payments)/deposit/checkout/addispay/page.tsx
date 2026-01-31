"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { CheckoutData, ProviderPaymentMethod } from "@/lib/types"
import { usePaymentStore } from "@/lib/stores/payment-store"
import { useRouter } from "next/navigation"
import i18n from "@/i18n"

export default function CheckoutPage() {
  const { paymentOrderData, checkout } = usePaymentStore()
  const [selectedMethod, setSelectedMethod] = useState<ProviderPaymentMethod | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showError, setShowError] = useState(false)

  const router = useRouter()

  useEffect(() => {
    if (paymentOrderData) {
      const timeout = setTimeout(() => setIsLoading(false), 300)
      return () => clearTimeout(timeout)
    } else {
      setIsLoading(true)
      const errorTimeout = setTimeout(() => setShowError(true), 3000)
      return () => clearTimeout(errorTimeout)
    }
  }, [paymentOrderData])

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-600 font-medium">Loading checkout data...</p>
        </div>
      </div>
    )
  }

  if (!paymentOrderData && showError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 text-center shadow-lg">
          <CardTitle className="text-lg font-semibold text-gray-700">
            No checkout data found
          </CardTitle>
          <p className="text-sm text-gray-500 mt-2">
            Please try again.
          </p>
        </Card>
      </div>
    )
  }

  if (!paymentOrderData) return null

  const paymentMethods: ProviderPaymentMethod[] = [
    ...(paymentOrderData.checkData.data.payment_methods || []),
    // ...(checkoutData.checkData.data.bank || []),
  ]

  const totalAmount = paymentOrderData.amount?.toFixed(2) ?? "0.00"
  const phone = paymentOrderData.checkData.data.phone_number || "N/A"

  const handlePay = async () => {
    if (!selectedMethod) return

    const checkoutData: CheckoutData = {
      uuid: paymentOrderData.providerUuid,
      phoneNumber: paymentOrderData.checkData.data.phone_number,
      encryptedTotalAmount: paymentOrderData.amount,
      merchantName: paymentOrderData.checkData.data.merchant_name,
      selectedService: selectedMethod.service,
      selectedBank: selectedMethod.name,
    }


    await checkout(checkoutData)
    router.replace(`/${i18n.language}/deposit/checkout/online-result`)

    // const url = paymentOrderData.checkoutUrl ?? paymentOrderData.instructionsUrl
    // if (url) window.open(url, "_blank", "noopener,noreferrer")
  }

  return (
    <AnimatePresence>
      <motion.div
        key="checkout"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen  flex flex-col items-center justify-center p-6"
      >
        <Card className="w-full max-w-2xl shadow-xl rounded-2xl">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-xl font-bold text-white">
              Checkout
            </CardTitle>
            <p className="text-white">
              Paying from phone number:{" "}
              <span className="font-semibold text-white">{phone}</span>
            </p>
            <p className="text-white">
              Total Amount:{" "}
              <span className="font-bold text-green-600">{totalAmount} ETB</span>
            </p>
          </CardHeader>

          <CardContent>
            <h2 className="text-sm font-semibold mb-3 text-white text-center">
              Select a Payment Method
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {paymentMethods.map((method) => (
                <motion.div
                  key={method.name}
                  whileHover={{ scale: 1.03 }}
                  className={`cursor-pointer rounded-xl border p-4 flex flex-col items-center justify-center shadow-sm transition-all ${
                    selectedMethod?.name === method.name
                      ? "border-3 border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white"
                  }`}
                  onClick={() => setSelectedMethod(method)}
                >
                  {method.photo && (
                    <div className="relative w-24 h-24 flex items-center justify-center overflow-hidden rounded-lg ">
                      <img
                        src={method.photo}
                        alt={method.name}
                        className="absolute inset-0 w-full h-full object-contain"
                      />
                    </div>

                  )}
                  {/* <p className="text-sm font-medium capitalize">{method.name}</p> */}
                  {/* <p className="text-xs text-gray-500">
                    Fee: {method.fee?.toFixed(2) ?? 0}%
                  </p> */}
                  {selectedMethod?.name === method.name && (
                    <CheckCircle2 className="text-blue-500 w-5 h-5 mt-1" />
                  )}
                </motion.div>
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <Button
                disabled={!selectedMethod}
                className="px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md"
                onClick={handlePay}
              >
                {selectedMethod
                  ? `Pay with ${selectedMethod.name.toUpperCase()}`
                  : "Select a method to pay"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}
