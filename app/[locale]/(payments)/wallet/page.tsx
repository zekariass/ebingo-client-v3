'use client'
import { WalletBalance } from "@/components/payment/wallet-balance";
import { Button } from "@/components/ui/button";
import i18n from "@/i18n";
import { useAgentStore } from "@/lib/stores/agent-store";
import { X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function WalletModal() {

  const {activeAgentId} = useAgentStore();

  const searchParams = useSearchParams();
  const agentId = Number(searchParams.get("agentId")) || activeAgentId || 0;

  const router = useRouter()

  const handleClose = () => {
    router.push(`/${i18n.language}?agentId=${agentId}`);
  };

  return (
     <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl shadow-lg p-6 relative">
        {/* Header with title and X icon */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Your Wallet</h2>
          <button
            className="relative z-50 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
            onClick={handleClose}
          >
            <X className="h-5 w-5" />
          </button>

        </div>

        {/* Wallet balance content */}
        <WalletBalance agentId={agentId}/>

        {/* Optional footer */}
        <div className="flex justify-end mt-4">
          <Button onClick={handleClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}
