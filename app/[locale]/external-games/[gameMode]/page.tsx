"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { useExternalGameStore } from "@/lib/stores/external-game-store"
import { useAgentStore } from "@/lib/stores/agent-store"
import { LobbyHeader } from "@/components/lobby/lobby-header"
import { useTelegramInit } from "@/lib/hooks/use-telegram-init"
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ExternalGamePage() {
  useTelegramInit()
  
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Safely extract gameMode from params
  const rawGameMode = params?.gameMode
  
  // Debug logging
  console.log("Raw params object:", params)
  console.log("Raw gameMode value:", rawGameMode)
  console.log("Type of rawGameMode:", typeof rawGameMode)
  console.log("Is array?:", Array.isArray(rawGameMode))
  
  const gameMode = typeof rawGameMode === 'string' 
    ? rawGameMode 
    : (Array.isArray(rawGameMode) ? rawGameMode[0] : '')
  
  const agentId = searchParams.get("agentId")
  
  console.log("Extracted gameMode:", gameMode)
  console.log("Extracted agentId:", agentId)
  
  const { launchGame, gameUrl, launching, error, setGameUrl } = useExternalGameStore()
  const { agentDetails, fetchAgentDetails } = useAgentStore()
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Reset game store state when component mounts
  useEffect(() => {
    // Reset game URL and error state to ensure clean state
    setGameUrl(null)
    return () => {
      // Cleanup on unmount
      setGameUrl(null)
    }
  }, [setGameUrl])

  useEffect(() => {
    let isMounted = true
    
    const loadGame = async () => {
      console.log("Loading game - gameMode:", gameMode, "agentId:", agentId)
      console.log("Params:", params)
      console.log("SearchParams:", searchParams.toString())
      
      if (!gameMode || !agentId) {
        if (isMounted) {
          setLoadError(`Missing game mode or agent ID. GameMode: ${gameMode}, AgentId: ${agentId}`)
          setIsLoading(false)
        }
        return
      }

      if (isMounted) {
        setIsLoading(true)
        setLoadError(null)
        setGameUrl(null) // Reset game URL before launching
      }
      
      try {
        const agentIdNum = parseInt(agentId)
        
        // Fetch agent details
        const agentData = await fetchAgentDetails(agentIdNum)
        
        if (!isMounted) return
        
        if (!agentData) {
          throw new Error("Failed to load agent details")
        }

        // Get Telegram init data
        const initData = typeof window !== "undefined" && window.Telegram?.WebApp?.initData
          ? window.Telegram.WebApp.initData
          : ""

        if (!initData) {
          throw new Error("Telegram initData is required")
        }

        // Get language
        const lang = typeof window !== "undefined" 
          ? (localStorage.getItem("i18nextLng") || "en")
          : "en"

        // Build lobby URL (full URL to game-options page)
        const lobbyUrl = typeof window !== "undefined"
          ? `${window.location.origin}/${lang}/game-options?agentId=${agentId}`
          : ""

        // Build complete launch request
        const request = {
          agentId: agentIdNum,
          gameMode,
          currency: "ETB", 
          initData,
          subId: "redfoxgames",//agentIdNum.toString(), 
          lobbyUrl, 
          brandName: "RedFox Games",//agentData.name, 
          lang,
          adaptive: true,
          isDemoPlay: false,
        }

        await launchGame(request)
      } catch (err) {
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : "Failed to load game"
          setLoadError(errorMessage)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadGame()
    
    return () => {
      isMounted = false
    }
  }, [gameMode, agentId, fetchAgentDetails, launchGame, setGameUrl]) // Include all dependencies

  const handleGoBack = () => {
    router.back()
  }

  if (isLoading || launching) {
    return (
      <div className="fixed inset-0 bg-gray-900">
        <LobbyHeader />
        <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 80px)' }}>
          <div className="text-center">
            <Loader2 className="w-16 h-16 animate-spin text-purple-500 mx-auto mb-4" />
            <p className="text-white text-lg">Loading game...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || loadError) {
    return (
      <div className="fixed inset-0 bg-gray-900">
        <LobbyHeader />
        <div className="flex items-center justify-center p-4" style={{ height: 'calc(100vh - 80px)' }}>
          <div className="text-center max-w-md">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-white text-2xl font-bold mb-2">Failed to Load Game</h2>
            <p className="text-gray-300 mb-6">{error || loadError}</p>
            <button
              onClick={handleGoBack}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!gameUrl) {
    return (
      <div className="fixed inset-0 bg-gray-900">
        <LobbyHeader />
        <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 80px)' }}>
          <div className="text-center">
            <Loader2 className="w-16 h-16 animate-spin text-purple-500 mx-auto mb-4" />
            <p className="text-white text-lg">Preparing game...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    // <div className="fixed inset-0 bg-gray-900">
    //   <LobbyHeader />
    //   <iframe
    //     src={gameUrl}
    //     className="w-full border-0"
    //     style={{ height: 'calc(100vh - 80px)' }}
    //     title="External Game"
    //     allowFullScreen={true}
    //     allow="autoplay fullscreen; payment"
    //     sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
    //   />
    // </div>


    <div className="fixed inset-0 bg-gray-900 flex flex-col">
      <LobbyHeader />
      <iframe
        src={gameUrl}
        className="w-full flex-1 border-0"
        title="External Game"
        allowFullScreen
        allow="autoplay; fullscreen; payment"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
      />
    </div>
  )
}
