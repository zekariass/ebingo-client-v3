'use client'
import { TransactionHistory } from "@/components/payment/transaction-history";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Transactions() {
  const router = useRouter();

  const handleClose = () => {
    router.push('/'); // Close modal
  };

  return (
     <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 relative">
        {/* Header with title and close icon */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Deposits and Withdrawals</h2>
          <button
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 pe-3 cursor-pointer"
            onClick={handleClose}
          >
            <X className="h-5 w-5 cursor-pointer" />
          </button>
        </div>

        {/* Transaction history */}
        <TransactionHistory />

        {/* Optional footer */}
        <div className="flex justify-end mt-4">
          <Button onClick={handleClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}
