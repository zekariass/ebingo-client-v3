"use client"

import { useEffect, useState } from "react"
import { useExternalGameStore } from "@/lib/stores/external-game-store"
import { userStore } from "@/lib/stores/user-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { RefreshCw, Trash2, Eye, ArrowLeft, Save } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import type { AgentGameResponse, AgentDto } from "@/lib/types"
import i18n from "@/i18n"

const AVAILABLE_GAME_MODES = [
  "chicken-road-vegas",
  "aviafly",
  "chicken-road",
  "chicken-road-zombies",
  "squid-game",
  "twist-new-year",
  "platform-mines",
  "roulette",
  "sugar-daddy",
  "chicken-road-new-year",
  "ballonix",
  "crash",
  "cryptos",
  "diver",
  "mine-slot",
  "chicken-royal",
  "forest-fortune-v2",
  "forest-fortune-v1",
  "hamster-run",
  "stairs",
  "wheel",
  "bubbles",
  "coinflip",
  "hot-mines",
  "jogo-do-bicho",
  "limbo",
  "lucky-mines",
  "new-double",
  "plinko",
  "plinko-aztec",
  "tower",
  "triple",
  "twist",
  "robo-dice",
  "chicken-road-gold",
  "pengu-sport",
  "chicken-road-race",
  "cricket-road",
  "chicken-road-two",
]

interface AgentGamesDetailConfigProps {
  agentId: number
}

export function AgentGamesDetailConfig({ agentId }: AgentGamesDetailConfigProps) {
  const { toast } = useToast()
  const router = useRouter()
  const { user } = userStore()
  const [enabledOnly, setEnabledOnly] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedGame, setSelectedGame] = useState<AgentGameResponse | null>(null)
  const [agentDetails, setAgentDetails] = useState<AgentDto | null>(null)
  const [loadingAgent, setLoadingAgent] = useState(true)
  const [selectedGameModes, setSelectedGameModes] = useState<string[]>([])
  const [hasLoadedSettings, setHasLoadedSettings] = useState(false)

  const {
    agentGamesList,
    gamesLoading,
    gamesError,
    getAgentGames,
    updateAgentGameStatus,
    deleteAgentGame,
    clearGoldenEggsErrors,
    agentGameSettings,
    gameSettingsLoading,
    gameSettingsError,
    getAgentGameSettings,
    updateAgentGameSettings,
    clearGameSettingsError,
  } = useExternalGameStore()

  useEffect(() => {
    if (agentId) {
      fetchAgentDetails()
      handleFetchGames()
      handleFetchGameSettings()
    }
  }, [agentId])

  useEffect(() => {
    if (agentGameSettings) {
      setSelectedGameModes(agentGameSettings.gameModes || [])
      setHasLoadedSettings(true)
    }
  }, [agentGameSettings])

  const fetchAgentDetails = async () => {
    setLoadingAgent(true)
    try {
      const initData = typeof window !== "undefined" && window.Telegram?.WebApp?.initData
        ? window.Telegram.WebApp.initData
        : ""

      const lang = typeof window !== "undefined" 
        ? (localStorage.getItem("i18nextLng") || "en")
        : "en"

      const response = await fetch(`/${lang}/api/agents/${agentId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-init-data": initData,
        },
        cache: "no-store",
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setAgentDetails(result.data)
      }
    } catch (error) {
      console.error("Failed to fetch agent details:", error)
    } finally {
      setLoadingAgent(false)
    }
  }

  const handleFetchGames = () => {
    clearGoldenEggsErrors()
    getAgentGames(agentId, enabledOnly)
  }

  const handleFetchGameSettings = async () => {
    try {
      clearGameSettingsError()
      await getAgentGameSettings(agentId)
    } catch (error) {
      console.error("Failed to fetch game settings:", error)
    }
  }

  const handleToggleGameMode = (gameMode: string) => {
    setSelectedGameModes((prev) =>
      prev.includes(gameMode)
        ? prev.filter((mode) => mode !== gameMode)
        : [...prev, gameMode]
    )
  }

  const handleSelectAll = () => {
    setSelectedGameModes(AVAILABLE_GAME_MODES)
  }

  const handleDeselectAll = () => {
    setSelectedGameModes([])
  }

  const handleSaveGameSettings = async () => {
    try {
      await updateAgentGameSettings({
        agentId: agentId,
        gameModes: selectedGameModes,
      })

      toast({
        title: "Success",
        description: "Game settings updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update game settings",
        variant: "destructive",
      })
    }
  }

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await updateAgentGameStatus(id, !currentStatus)
      toast({
        title: "Success",
        description: `Game ${!currentStatus ? "enabled" : "disabled"} successfully`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update status",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteAgentGame(id)
      toast({
        title: "Success",
        description: "Game deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete game",
        variant: "destructive",
      })
    }
  }

  const handleViewGame = (game: AgentGameResponse) => {
    setSelectedGame(game)
    setViewDialogOpen(true)
  }

  const handleBack = () => {
    const lang = i18n.language || "en"
    router.push(`/${lang}/admin/agent-games-config`)
  }

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              You do not have permission to access this page.
            </p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Search
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configure Agent Games</h1>
          <p className="text-muted-foreground">
            Manage games for the selected agent
          </p>
        </div>
      </div>

      {loadingAgent ? (
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      ) : agentDetails && (
        <Card>
          <CardHeader>
            <CardTitle>Agent Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-semibold">{agentDetails.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Code</p>
                <p className="font-mono font-semibold">{agentDetails.code}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contact</p>
                <p>{agentDetails.contactName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="flex gap-2">
                  <Badge variant={agentDetails.isActive ? "default" : "secondary"}>
                    {agentDetails.isActive ? "Active" : "Inactive"}
                  </Badge>
                  {agentDetails.isMaster && (
                    <Badge variant="outline">Master</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Game Mode Configuration</CardTitle>
          <CardDescription>Select which game modes are enabled for this agent</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {gameSettingsError && (
            <Alert variant="destructive">
              <AlertDescription>{gameSettingsError}</AlertDescription>
            </Alert>
          )}

          {gameSettingsLoading && !hasLoadedSettings ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : hasLoadedSettings ? (
            <>
              {selectedGameModes.length > 0 && (
                <div className="mb-4 p-4 bg-muted rounded-lg">
                  <h3 className="text-sm font-semibold mb-2">Currently Selected Game Modes ({selectedGameModes.length}):</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedGameModes.map((mode) => (
                      <span
                        key={mode}
                        className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded-md"
                      >
                        {mode}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={gameSettingsLoading}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeselectAll}
                  disabled={gameSettingsLoading}
                >
                  Deselect All
                </Button>
                <div className="ml-auto text-sm text-muted-foreground">
                  {selectedGameModes.length} of {AVAILABLE_GAME_MODES.length} selected
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {AVAILABLE_GAME_MODES.map((gameMode) => {
                  const isSelected = selectedGameModes.includes(gameMode)
                  return (
                    <div
                      key={gameMode}
                      className={`flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent transition-colors ${
                        isSelected ? 'bg-primary/10 border-primary' : ''
                      }`}
                    >
                      <Checkbox
                        id={`mode-${gameMode}`}
                        checked={isSelected}
                        onCheckedChange={() => handleToggleGameMode(gameMode)}
                        disabled={gameSettingsLoading}
                      />
                      <label
                        htmlFor={`mode-${gameMode}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                      >
                        {gameMode}
                      </label>
                    </div>
                  )
                })}
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleSaveGameSettings}
                  disabled={gameSettingsLoading}
                >
                  {gameSettingsLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Game Settings
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Loading game settings...
            </div>
          )}
        </CardContent>
      </Card>

      

      {gamesError && (
        <Alert variant="destructive">
          <AlertDescription>{gamesError}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
