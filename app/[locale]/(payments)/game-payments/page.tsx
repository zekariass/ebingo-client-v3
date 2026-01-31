'use client'
import { GameTransactionHistory } from "@/components/payment/game-transaction-history";
import { Button } from "@/components/ui/button";
import i18n from "@/lib/i18n/config";
import { useAgentStore } from "@/lib/stores/agent-store";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";


export default function GameHistoryModal() {

  const {activeAgentId} = useAgentStore();
  const router = useRouter()

  const handleClose = () => {
    router.push(`/${i18n.language}?agentId=${activeAgentId}`);
  };

  return (
     <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 relative">
        {/* Header with title and close icon */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Game fees and prizes</h2>
          <button
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
            onClick={handleClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal content */}
        <GameTransactionHistory />

        {/* Optional footer */}
        <div className="flex justify-end mt-4">
          <Button onClick={handleClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}
