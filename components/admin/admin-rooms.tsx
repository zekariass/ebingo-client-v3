"use client"

import { useState, useEffect, useMemo } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SelectItem } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Search, DoorOpen, AlertCircle } from "lucide-react"
import { useAdminStore, type Room } from "@/lib/stores/admin-store"
import { InputField, SelectField } from "@/components/ui/form-fields"
import { roomPatterns, roomSchema, roomStatuses, type RoomFormData } from "@/lib/schemas/admin-schemas"
import { useGameStore } from "@/lib/stores/game-store"
import { useTelegramInit } from "@/lib/hooks/use-telegram-init"
import { useToast } from "@/hooks/use-toast"
import { userStore } from "@/lib/stores/user-store"

const DEFAULT_VALUES: RoomFormData = {
  name: "",
  entryFee: 10,
  capacity: 100,
  minPlayers: 2,
  pattern: "LINE_AND_CORNERS",
  status: "OPEN",
  botAllowed: false,
  minBots: 0,
  maxBots: 0,
  maxCards: 1,
  minDraws: 6,
  maxDraws: 12,
  fakeWinEnabled: false,
  commissionRate: 0,
}

function formatPattern(pattern: Room["pattern"] | string | undefined) {
  return String(pattern ?? "Unknown")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatCommission(rate: number | undefined) {
  if (rate == null) return "—"
  return `${Math.round(rate * 100)}%`
}

export function AdminRooms({ agentId }: { agentId: number | undefined }) {
  const { rooms, isLoading, error, createRoom, updateRoom, deleteRoom, loadRooms } = useAdminStore()
  const resetGameState = useGameStore((state) => state.resetGameState)
  useTelegramInit()

  const { toast } = useToast()
  const { user } = userStore()

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null)
  const [search, setSearch] = useState("")

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
    defaultValues: DEFAULT_VALUES,
  })

  const botAllowed = watch("botAllowed")

  useEffect(() => {
    if (!agentId) return
    loadRooms(agentId)
  }, [agentId, loadRooms])

  const filteredRooms = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rooms
    return rooms.filter((room) => room.name.toLowerCase().includes(q))
  }, [rooms, search])

  const openCount = useMemo(() => rooms.filter((r) => r.status === "OPEN").length, [rooms])

  const onSubmit = async (data: RoomFormData) => {
    if (!agentId) {
      toast({
        title: "Error",
        description: "Agent ID not found",
        variant: "destructive",
      })
      return
    }

    try {
      let action: "created" | "updated"
      if (editingRoom) {
        await updateRoom(String(editingRoom.id), agentId, data)
        action = "updated"
      } else if (user?.role === "ADMIN") {
        await createRoom(data, agentId)
        action = "created"
      } else {
        toast({
          title: "Permission denied",
          description: "You don't have permission to create rooms. Ask an admin to create one for you.",
          variant: "destructive",
        })
        return
      }

      // Store reports API failures via `error` state rather than throwing
      const storeError = useAdminStore.getState().error
      if (storeError) {
        toast({ title: `Failed to save room`, description: storeError, variant: "destructive" })
        return
      }

      toast({ title: `Room ${action}`, description: `"${data.name}" was ${action} successfully.` })
      setEditingRoom(null)
      reset(DEFAULT_VALUES)
      setIsCreateDialogOpen(false)
    } catch (err) {
      toast({
        title: "Failed to save room",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (room: Room) => {
    setEditingRoom(room)
    reset({
      name: room.name,
      entryFee: room.entryFee,
      capacity: room.capacity,
      minPlayers: room.minPlayers,
      pattern: room.pattern,
      status: room.status,
      botAllowed: room.botAllowed ?? false,
      minBots: room.minBots,
      maxBots: room.maxBots,
      maxCards: room.maxCards,
      minDraws: room.minDraws,
      maxDraws: room.maxDraws,
      fakeWinEnabled: room.fakeWinEnabled ?? false,
      commissionRate: room.commissionRate,
    })
    setIsCreateDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!roomToDelete || !agentId) return
    try {
      await deleteRoom(roomToDelete.id, agentId)
      const storeError = useAdminStore.getState().error
      if (storeError) {
        toast({ title: "Failed to delete room", description: storeError, variant: "destructive" })
        return
      }
      resetGameState() // Reset game state after deleting a room
      toast({ title: "Room deleted", description: `"${roomToDelete.name}" was deleted.` })
    } catch (err) {
      toast({
        title: "Failed to delete room",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setRoomToDelete(null)
    }
  }

  const handleCancel = () => {
    setIsCreateDialogOpen(false)
    setEditingRoom(null)
    reset(DEFAULT_VALUES)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Room Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Create and manage bingo rooms
            {rooms.length > 0 && (
              <span className="ml-2">
                · {rooms.length} total, {openCount} open
              </span>
            )}
          </p>
        </div>
        <Dialog
          open={isCreateDialogOpen}
          onOpenChange={(open) => {
            setIsCreateDialogOpen(open)
            if (!open) {
              handleCancel()
            }
          }}
        >
          {user?.role === "ADMIN" && (
            <DialogTrigger asChild>
              <Button disabled={isLoading} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Create Room
              </Button>
            </DialogTrigger>
          )}
          <DialogContent className="w-[95vw] sm:max-w-2xl mx-auto">
            <DialogHeader>
              <DialogTitle>{editingRoom ? "Edit Room" : "Create New Room"}</DialogTitle>
              <DialogDescription>
                {editingRoom
                  ? `Update settings for "${editingRoom.name}"`
                  : "Set up a new bingo room with custom settings"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 overflow-y-auto max-h-[75vh] pr-2">
              {/* Basics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <InputField
                    label="Room Name"
                    placeholder="Enter room name"
                    required
                    {...register("name")}
                    error={errors.name?.message}
                  />
                </div>
                <InputField
                  label="Entry Fee (ETB)"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1000"
                  placeholder="10.00"
                  required
                  {...register("entryFee", { valueAsNumber: true })}
                  error={errors.entryFee?.message}
                />
                <InputField
                  label="Commission Rate"
                  type="number"
                  min="0"
                  max="1"
                  step="0.01"
                  placeholder="0.10"
                  {...register("commissionRate", { valueAsNumber: true })}
                  error={errors.commissionRate?.message}
                />
              </div>

              {/* Players & limits */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                  Players &amp; Limits
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Capacity"
                    type="number"
                    min="1"
                    max="500"
                    placeholder="100"
                    required
                    {...register("capacity", { valueAsNumber: true })}
                    error={errors.capacity?.message}
                  />
                  <InputField
                    label="Minimum Players"
                    type="number"
                    min="1"
                    placeholder="2"
                    required
                    {...register("minPlayers", { valueAsNumber: true })}
                    error={errors.minPlayers?.message}
                  />
                  <InputField
                    label="Maximum Cards"
                    type="number"
                    min="1"
                    max="2"
                    placeholder="1"
                    {...register("maxCards", { valueAsNumber: true })}
                    error={errors.maxCards?.message}
                  />
                  <Controller
                    name="pattern"
                    control={control}
                    render={({ field }) => (
                      <SelectField
                        label="Winning Pattern"
                        value={field.value}
                        onValueChange={field.onChange}
                        error={errors.pattern?.message}
                      >
                        {roomPatterns.map((pattern) => (
                          <SelectItem key={pattern} value={pattern}>
                            {formatPattern(pattern)}
                          </SelectItem>
                        ))}
                      </SelectField>
                    )}
                  />
                  {editingRoom && (
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <SelectField
                          label="Room Status"
                          value={field.value}
                          onValueChange={field.onChange}
                          error={errors.status?.message}
                        >
                          {roomStatuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectField>
                      )}
                    />
                  )}
                </div>
              </div>

              {/* Bots */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Bots
                  </p>
                  <Controller
                    name="botAllowed"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center gap-2">
                        <Label htmlFor="bot-allowed" className="text-sm font-normal">
                          Allow bots
                        </Label>
                        <Switch
                          id="bot-allowed"
                          checked={field.value ?? false}
                          onCheckedChange={field.onChange}
                        />
                      </div>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Minimum Bots"
                    type="number"
                    min="0"
                    placeholder="0"
                    disabled={!botAllowed}
                    {...register("minBots", { valueAsNumber: true })}
                    error={errors.minBots?.message}
                  />
                  <InputField
                    label="Maximum Bots"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0"
                    disabled={!botAllowed}
                    {...register("maxBots", { valueAsNumber: true })}
                    error={errors.maxBots?.message}
                  />
                </div>
                {errors.botAllowed && (
                  <p className="text-sm text-red-600 mt-2" role="alert">
                    {errors.botAllowed.message}
                  </p>
                )}
              </div>

              {/* Gameplay */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Gameplay
                  </p>
                  <Controller
                    name="fakeWinEnabled"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center gap-2">
                        <Label htmlFor="auto-win" className="text-sm font-normal">
                          Enable auto wins
                        </Label>
                        <Switch
                          id="auto-win"
                          checked={field.value ?? false}
                          onCheckedChange={field.onChange}
                        />
                      </div>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Minimum Draws"
                    type="number"
                    min="5"
                    max="75"
                    placeholder="6"
                    {...register("minDraws", { valueAsNumber: true })}
                    error={errors.minDraws?.message}
                  />
                  <InputField
                    label="Maximum Draws"
                    type="number"
                    min="5"
                    max="75"
                    placeholder="12"
                    {...register("maxDraws", { valueAsNumber: true })}
                    error={errors.maxDraws?.message}
                  />
                </div>
                {errors.fakeWinEnabled && (
                  <p className="text-sm text-red-600 mt-2" role="alert">
                    {errors.fakeWinEnabled.message}
                  </p>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || isLoading}>
                  {isSubmitting ? "Saving..." : editingRoom ? "Update Room" : "Create Room"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-lg sm:text-xl">All Rooms</CardTitle>
              <CardDescription className="text-sm">Manage existing bingo rooms</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search rooms..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-1 sm:p-6">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[160px]">Room</TableHead>
                    <TableHead className="min-w-[90px]">Entry Fee</TableHead>
                    <TableHead className="min-w-[90px]">Players</TableHead>
                    <TableHead className="min-w-[90px]">Bots</TableHead>
                    <TableHead className="min-w-[90px]">Draws</TableHead>
                    <TableHead className="min-w-[80px]">Auto Win</TableHead>
                    <TableHead className="min-w-[90px]">Commission</TableHead>
                    <TableHead className="min-w-[80px]">Status</TableHead>
                    <TableHead className="min-w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRooms.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="py-10">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <DoorOpen className="h-8 w-8" />
                          <p className="text-sm">
                            {search ? `No rooms matching "${search}"` : "No rooms yet"}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRooms.map((room) => (
                      <TableRow key={room.id}>
                        <TableCell>
                          <div className="font-medium">{room.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatPattern(room.pattern)} · {room.maxCards} card
                            {room.maxCards === 1 ? "" : "s"}
                          </div>
                        </TableCell>
                        <TableCell>{room.entryFee} ETB</TableCell>
                        <TableCell>
                          {room.minPlayers}–{room.capacity}
                        </TableCell>
                        <TableCell>
                          {room.botAllowed ? (
                            `${room.minBots}–${room.maxBots}`
                          ) : (
                            <span className="text-muted-foreground">Off</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {room.minDraws}–{room.maxDraws}
                        </TableCell>
                        <TableCell>
                          {room.fakeWinEnabled ? (
                            <Badge variant="secondary" className="text-xs">
                              Yes
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">No</span>
                          )}
                        </TableCell>
                        <TableCell>{formatCommission(room.commissionRate)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={room.status === "OPEN" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {room.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(room)}
                              className="h-8 w-8 p-0"
                              title="Edit room"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setRoomToDelete(room)}
                              disabled={isLoading}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              title="Delete room"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!roomToDelete} onOpenChange={(open) => !open && setRoomToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete room?</AlertDialogTitle>
            <AlertDialogDescription>
              {roomToDelete
                ? `This will permanently delete "${roomToDelete.name}". This action cannot be undone.`
                : "This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
