'use client'

import { usePaymentStore } from "@/lib/stores/payment-store"

export default function CbebirrInstructions() {
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
        CBE Birr Payment Instructions
      </h1>

      <div className="bg-white p-2 rounded-lg shadow-md mb-6 text-gray-800 text-sm">
        <p><strong>Order ID:</strong> {orderId}</p>
        <p><strong>Transaction Reference:</strong> {txnRef}</p>
        <p><strong>Status:</strong> {status}</p>
        <p><strong>Amount:</strong> {amount.toLocaleString()} ETB</p>
      </div>

      <ol className="list-decimal list-inside space-y-3 text-gray-300 text-sm">
        <li>Open the <strong>CBE Birr</strong> app on your mobile device.</li>
        <li>Log in with your registered phone number and PIN.</li>
        <li>Select <strong>Send Money</strong> or <strong>Pay Merchant</strong>.</li>
        <li>Enter the merchant’s account or business number provided by the system.</li>
        <li>Enter the exact payment amount: <strong>{amount.toLocaleString()} ETB</strong>.</li>
        <li>Review the payment summary and tap <strong>Confirm</strong>.</li>
        <li>Keep the confirmation message or receipt as proof of payment.</li>
      </ol>

      <p className="mt-6 text-xs text-center text-gray-300">
        After completing your payment, click <strong>“I’ve Paid”</strong> on this page to notify us and verify your deposit.
      </p>
    </div>
  )
}
