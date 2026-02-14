"use client"

import { useEffect, useState } from "react"
import { useLobbyStore } from "@/lib/stores/lobby-store"
import { LobbyHeader } from "./lobby-header"
import { RoomTable } from "./room-table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { usePaymentStore } from "@/lib/stores/payment-store"
import { useTelegramInit } from "@/lib/hooks/use-telegram-init"
import { useSystemStore } from "@/lib/stores/system-store"
import { useRoomSocket } from "@/lib/hooks/websockets/use-room-socket"
import { useAgentStore } from "@/lib/stores/agent-store"
import Link from "next/link"

export function Lobby({agentId}: {agentId?: number}) {
  useTelegramInit();
  const { setActiveAgentId, fetchAgentDetails } = useAgentStore();

  const { rooms, loading, error, fetchRooms } = useLobbyStore()
  const {fetchPaymentMethods, fetchTransactions, fetchWallet} = usePaymentStore()
  
  const fetchSystemConfigs = useSystemStore(state => state.fetchSystemConfigs);


  const [currentTxnPage, setCurrentTxnPage] = useState<number>(1)
  const [currentTxnSize, setCurrentTxnSize] = useState<number>(10)

  // Connect to general websocket to receive updates for all rooms (no specific roomId)
  useRoomSocket({ roomId: undefined, enabled: true })

    
  useEffect(() => {
    if (agentId !== undefined) {
      setActiveAgentId(agentId);
    } else {
      setActiveAgentId(null);
    }
  }, [agentId]);

  const getAllFromDB = async () => {
     Promise.all([
      await fetchAgentDetails(agentId!),
      await fetchRooms(agentId!),
      await fetchSystemConfigs(agentId!),
     ]);
  }

  useEffect(() => {  
    if (agentId !== undefined && agentId !== null) {
      getAllFromDB()
    }
  }, [fetchRooms])


  // Fetch all payment data
  async function fetchPaymentData() {
    await Promise.all([
      // fetchUserProfile(),
      fetchWallet(true, agentId!),
      fetchPaymentMethods(),
      fetchTransactions(agentId!, currentTxnPage, currentTxnSize, true),
    ])  
  }

useEffect(() => {
      fetchPaymentData();
  }, []);


  // async function verifyTele() {
  //   const receiptUrl = "https://transactioninfo.ethiotelecom.et/receipt/CL67P7WRET";

  //   const res = await fetch(`/${i18n.language}/api/telebirr-verify`, {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ receiptUrl }),
  //   });

  //   const data = await res.json();
  //   alert(JSON.stringify(data, null, 2));
  // }


  async function verifyTele(reference: string) {
    try {
      const res = await fetch("https://verifyapi.leulzenebe.pro/verify-telebirr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.NEXT_PUBLIC_VERIFY_API_KEY || "",
        },
        body: JSON.stringify({ reference }), // Telebirr
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`API request failed: ${res.status} ${text}`);
      }

      const data = await res.json();
      alert(JSON.stringify(data, null, 2));
      return data;
    } catch (err) {
      console.error("Error verifying Telebirr:", err);
      alert(`Error verifying Telebirr: ${(err as Error).message}`);
      return null;
    }
}



async function verifyCBE(reference: string) {
    try {
      const res = await fetch("https://verifyapi.leulzenebe.pro/verify-cbe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.NEXT_PUBLIC_VERIFY_API_KEY || "",
        },
        // body: JSON.stringify({ reference }), // Telebirr
        body: JSON.stringify({ 
              "reference": "FT25341BSPRK",
              "accountSuffix": "54378314"
            }), // CBE Bank
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`API request failed: ${res.status} ${text}`);
      }

      const data = await res.json();
      alert(JSON.stringify(data, null, 2));
      return data;
    } catch (err) {
      console.error("Error verifying Telebirr:", err);
      alert(`Error verifying Telebirr: ${(err as Error).message}`);
      return null;
    }
}




  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <LobbyHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-lg text-muted-foreground">Loading rooms...</div>
          </div>
        </div>
      </div>
    )
  }

  

  return (
    <div className="min-h-screen bg-background">
      <LobbyHeader />

      {/* <div className="flex items-center justify-center">
        <Button onClick={()=>verifyTele("CLA0SSRCTQ")}>Tele</Button>
      </div>

      <div className="flex items-center justify-center">
        <Button onClick={()=>verifyCBE("")}>CBE</Button>
      </div> */}

      <main className="container mx-auto px-4 py-4 space-y-8">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* {rooms?.length >=8 && <LobbyFilters />} */}
          <RoomTable rooms={rooms} loading={loading} />
        </div>
      </main>
    </div>
  )
}
