'use client'

import { usePaymentStore } from "@/lib/stores/payment-store"

export default function CbeBankInstructions() {
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
        CBE Bank Deposit Instructions
      </h1>

      <div className="bg-white p-2 rounded-lg shadow-md mb-6 text-gray-800 text-sm">
        <p><strong>Order ID:</strong> {orderId}</p>
        <p><strong>Transaction Reference:</strong> {txnRef}</p>
        <p><strong>Status:</strong> {status}</p>
        <p><strong>Amount:</strong> {amount.toLocaleString()} ETB</p>
      </div>

      <ol className="list-decimal list-inside space-y-3 text-gray-300 text-sm">
        <li>Visit your nearest <strong>Commercial Bank of Ethiopia (CBE)</strong> branch or ATM.</li>
        <li>Choose <strong>Deposit</strong> if using an ATM, or request a teller-assisted deposit.</li>
        <li>Deposit the exact amount: <strong>{amount.toLocaleString()} ETB</strong> to the merchant’s account number provided.</li>
        <li>Include your <strong>Order Reference / Session ID</strong>: <strong>{txnRef}</strong> in the deposit remark if possible.</li>
        <li>Keep the deposit slip or receipt as proof of payment.</li>
      </ol>

      <p className="mt-6 text-xs text-center text-gray-300">
        After completing the deposit, click <strong>“I’ve Paid”</strong> on this page to confirm and upload your receipt for verification.
      </p>
    </div>
  )
}
