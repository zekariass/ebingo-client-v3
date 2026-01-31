'use client'

import { usePaymentStore } from "@/lib/stores/payment-store"

export default function TelebirrInstructions() {
  const { paymentOrderData } = usePaymentStore()

  if (!paymentOrderData) {
    return (
      <div className="p-6 rounded-2xl bg-gray-100 shadow-sm max-w-md mx-auto text-center">
        <p className="text-gray-600">Loading payment details...</p>
      </div>
    )
  }

  const {
    orderId,
    txnRef,
    status,
    amount
  } = paymentOrderData

  return (
    <div className="p-4 my-5 rounded-2xl bg-gray-800 shadow-lg mx-2">
      <h1 className="text-lg font-bold text-center text-gray-300 mb-4">
        Telebirr Payment Instructions
      </h1>

      <div className="bg-white p-2 rounded-lg shadow-md mb-6 text-gray-800 text-sm">
        <p><strong>Order ID:</strong> {orderId}</p>
        <p><strong>Transaction Reference:</strong> {txnRef}</p>
        <p><strong>Status:</strong> {status}</p>
        <p><strong>Amount:</strong> {amount.toLocaleString()} ETB</p>
      </div>

      <ol className="list-decimal list-inside space-y-3 text-gray-300 text-sm">
        <li>Open your <strong>Telebirr</strong> app on your phone.</li>
        <li>Select <strong>Send Money</strong> or <strong>Merchant Payment</strong>.</li>
        <li>Enter the merchant number provided.</li>
        <li>Enter the exact amount: <strong>{amount.toLocaleString()} ETB</strong>.</li>
        <li>Confirm the payment and keep your transaction reference: <strong>{txnRef}</strong>.</li>
      </ol>

      <p className="mt-6 text-xs text-center text-gray-300">
        After completing the payment, please click “I’ve Paid” in the app.
      </p>
    </div>
  )
}
