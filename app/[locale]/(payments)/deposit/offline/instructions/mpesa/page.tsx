'use client'

import { usePaymentStore } from "@/lib/stores/payment-store"

export default function MpesaInstructions() {
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
    <div className="p-4 my-5 rounded-2xl bg-gray-800 shadow-lg mx-2 ">
      <h1 className="text-lg font-bold text-center text-gray-300 mb-4">
        M-Pesa Payment Instructions
      </h1>

      <div className="bg-white p-2 rounded-lg shadow-md mb-6 text-gray-800 text-sm">
        <p><strong>Order ID:</strong> {orderId}</p>
        <p><strong>Transaction Reference:</strong> {txnRef}</p>
        <p><strong>Status:</strong> {status}</p>
        <p><strong>Amount:</strong> {amount.toLocaleString()} KES</p>
      </div>

      <ol className="list-decimal list-inside space-y-3 text-gray-300 text-sm">
        <li>Open the <strong>M-Pesa</strong> app or dial <strong>*334#</strong> on your phone.</li>
        <li>Select <strong>Lipa na M-Pesa</strong> (Pay with M-Pesa).</li>
        <li>Choose <strong>Pay Bill</strong> and enter the provided <strong>Business Number</strong>.</li>
        <li>Enter your <strong>Account Number</strong> or <strong>Order Reference</strong>: <strong>{txnRef}</strong>.</li>
        <li>Enter the exact amount: <strong>{amount.toLocaleString()} KES</strong> and confirm the payment.</li>
        <li>Keep the M-Pesa confirmation message as proof of payment.</li>
      </ol>

      <p className="mt-6 text-xs text-center text-gray-300">
        After completing the payment, please click <strong>“I’ve Paid”</strong> in the app to confirm your deposit.
      </p>
    </div>
  )
}
