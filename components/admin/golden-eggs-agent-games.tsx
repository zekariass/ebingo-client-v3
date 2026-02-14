"use client"

import { useEffect, useState } from "react"
import { useExternalGameStore } from "@/lib/stores/external-game-store"
import { useAgentStore } from "@/lib/stores/agent-store"
import { userStore } from "@/lib/stores/user-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { RefreshCw, Trash2, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AgentGameResponse } from "@/lib/types"

export function GoldenEggsAgentGames() {
  const { toast } = useToast()
  const { activeAgentId } = useAgentStore()
  const { user } = userStore()
  const [agentId, setAgentId] = useState<string>(activeAgentId?.toString() || "")
  const [enabledOnly, setEnabledOnly] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedGame, setSelectedGame] = useState<AgentGameResponse | null>(null)

  const {
    agentGamesList,
    gamesLoading,
    gamesError,
    getAgentGames,
    updateAgentGameStatus,
    deleteAgentGame,
    clearGoldenEggsErrors,
  } = useExternalGameStore()

  useEffect(() => {
    if (activeAgentId) {
      setAgentId(activeAgentId.toString())
    }
  }, [activeAgentId])

  const handleFetchGames = () => {
    const agentIdNum = parseInt(agentId)
    if (!agentIdNum || isNaN(agentIdNum)) {
      toast({
        title: "Invalid Agent ID",
        description: "Please enter a valid agent ID",
        variant: "destructive",
      })
      return
    }

    // If user is AGENT, only allow fetching their own data
    if (user?.role === "AGENT" && agentIdNum !== activeAgentId) {
      toast({
        title: "Access Denied",
        description: "You can only view your own agent games",
        variant: "destructive",
      })
      return
    }

    clearGoldenEggsErrors()
    getAgentGames(agentIdNum, enabledOnly)
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Configure your agent games query</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="agentId">Agent ID</Label>
              <Input
                id="agentId"
                type="number"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                placeholder="Enter agent ID"
                disabled={user?.role === "AGENT"}
              />
              {user?.role === "AGENT" && (
                <p className="text-xs text-muted-foreground">
                  You can only view your own agent games
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="enabledOnly">Enabled Only</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="enabledOnly"
                  checked={enabledOnly}
                  onCheckedChange={setEnabledOnly}
                />
                <Label htmlFor="enabledOnly" className="text-sm text-muted-foreground">
                  {enabledOnly ? "Showing enabled only" : "Showing all"}
                </Label>
              </div>
            </div>
          </div>

          <Button onClick={handleFetchGames} disabled={gamesLoading}>
            <RefreshCw className={cn("mr-2 h-4 w-4", gamesLoading && "animate-spin")} />
            Fetch Games
          </Button>
        </CardContent>
      </Card>

      {gamesError && (
        <Alert variant="destructive">
          <AlertDescription>{gamesError}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Agent Games</CardTitle>
          <CardDescription>Manage games for the selected agent</CardDescription>
        </CardHeader>
        <CardContent>
          {gamesLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : agentGamesList.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No agent games found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Agent ID</TableHead>
                    <TableHead>Game Category</TableHead>
                    <TableHead>Game Types</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Updated At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agentGamesList.map((game: AgentGameResponse) => (
                    <TableRow key={game.id}>
                      <TableCell>{game.id}</TableCell>
                      <TableCell>{game.agentId}</TableCell>
                      <TableCell>{game.gameCategory}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {game.gameTypes.map((type, idx) => (
                            <Badge key={idx} variant="outline">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={game.isEnabled}
                            onCheckedChange={() => handleToggleStatus(game.id, game.isEnabled)}
                            disabled={gamesLoading}
                          />
                          <Badge variant={game.isEnabled ? "default" : "secondary"}>
                            {game.isEnabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(game.createdAt).toLocaleString()}</TableCell>
                      <TableCell>{new Date(game.updatedAt).toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewGame(game)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete this agent game configuration.
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(game.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agent Game Details</DialogTitle>
            <DialogDescription>View detailed information about this agent game</DialogDescription>
          </DialogHeader>
          {selectedGame && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">ID</p>
                  <p className="font-medium">{selectedGame.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Agent ID</p>
                  <p className="font-medium">{selectedGame.agentId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Game Category</p>
                  <p className="font-medium">{selectedGame.gameCategory}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={selectedGame.isEnabled ? "default" : "secondary"}>
                    {selectedGame.isEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Game Types</p>
                  <div className="flex gap-1 flex-wrap mt-1">
                    {selectedGame.gameTypes.map((type, idx) => (
                      <Badge key={idx} variant="outline">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created At</p>
                  <p className="font-medium">{new Date(selectedGame.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Updated At</p>
                  <p className="font-medium">{new Date(selectedGame.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
