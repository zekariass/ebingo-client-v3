"use client"

import { useEffect, useState } from "react"
import { useExternalGameStore } from "@/lib/stores/external-game-store"
import { useAgentStore } from "@/lib/stores/agent-store"
import { userStore } from "@/lib/stores/user-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { RefreshCw, Save } from "lucide-react"

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

export function AdminGames() {
  const { toast } = useToast()
  const { activeAgentId } = useAgentStore()
  const { user } = userStore()
  const [selectedGameModes, setSelectedGameModes] = useState<string[]>([])
  const [hasLoaded, setHasLoaded] = useState(false)

  // Debug: Log whenever selectedGameModes changes
  useEffect(() => {
    console.log("=== SELECTED GAME MODES CHANGED ===")
    console.log("Current selectedGameModes:", selectedGameModes)
    console.log("Count:", selectedGameModes.length)
  }, [selectedGameModes])

  const {
    agentGameSettings,
    gameSettingsLoading,
    gameSettingsError,
    getAgentGameSettings,
    updateAgentGameSettings,
    clearGameSettingsError,
  } = useExternalGameStore()

  useEffect(() => {
    if (activeAgentId) {
      handleFetchSettings()
    }
  }, [activeAgentId])

  useEffect(() => {
    if (agentGameSettings) {
      console.log("=== LOADING GAME SETTINGS ===")
      console.log("Agent Game Settings:", agentGameSettings)
      console.log("Game Modes from API:", agentGameSettings.gameModes)
      console.log("Type of gameModes:", typeof agentGameSettings.gameModes)
      console.log("Is Array:", Array.isArray(agentGameSettings.gameModes))
      
      const modes = agentGameSettings.gameModes || []
      console.log("Setting selected game modes to:", modes)
      setSelectedGameModes(modes)
      setHasLoaded(true)
    }
  }, [agentGameSettings])

  const handleFetchSettings = async () => {
    if (!activeAgentId) {
      toast({
        title: "Error",
        description: "Agent ID not found",
        variant: "destructive",
      })
      return
    }

    try {
      clearGameSettingsError()
      await getAgentGameSettings(activeAgentId)
      toast({
        title: "Success",
        description: "Game settings loaded successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load game settings",
        variant: "destructive",
      })
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

  const handleSaveSettings = async () => {
    if (!activeAgentId) {
      toast({
        title: "Error",
        description: "Agent ID not found",
        variant: "destructive",
      })
      return
    }

    try {
      await updateAgentGameSettings({
        agentId: activeAgentId,
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

  if (!user || (user.role !== "ADMIN" && user.role !== "AGENT")) {
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Game Settings</h1>
        <p className="text-muted-foreground">
          Manage agent game mode configurations
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agent Game Settings</CardTitle>
          <CardDescription>
            Configure which game modes are enabled for an agent
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {gameSettingsError && (
            <Alert variant="destructive">
              <AlertDescription>{gameSettingsError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium">Agent ID: {activeAgentId}</p>
                <p className="text-xs text-muted-foreground">
                  Managing game settings for your agent
                </p>
              </div>
              <Button
                onClick={handleFetchSettings}
                disabled={gameSettingsLoading}
                variant="outline"
                size="sm"
              >
                {gameSettingsLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </>
                )}
              </Button>
            </div>

            {gameSettingsLoading && !hasLoaded ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : hasLoaded ? (
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
                          id={gameMode}
                          checked={isSelected}
                          onCheckedChange={() => handleToggleGameMode(gameMode)}
                          disabled={gameSettingsLoading}
                        />
                        <label
                          htmlFor={gameMode}
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
                    onClick={handleSaveSettings}
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
                        Save Settings
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
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
