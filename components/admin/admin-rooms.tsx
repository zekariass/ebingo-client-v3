"use client"

import { useState, useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SelectItem } from "@/components/ui/select"
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
import { Plus, Edit, Trash2, Users } from "lucide-react"
import { useAdminStore } from "@/lib/stores/admin-store"
import { InputField, SelectField } from "@/components/ui/form-fields"
import { roomPatterns, roomSchema, roomStatuses, type RoomFormData } from "@/lib/schemas/admin-schemas"
import { useGameStore } from "@/lib/stores/game-store"
import { useTelegramInit } from "@/lib/hooks/use-telegram-init"
import { useAgentStore } from "@/lib/stores/agent-store"
import { userStore } from "@/lib/stores/user-store"

export function AdminRooms({agentId}: {agentId: number | undefined}) {
const { rooms, isLoading, error, createRoom, updateRoom, deleteRoom, loadRooms } = useAdminStore()
const resetGameState = useGameStore(state => state.resetGameState)
// const {activeAgentId} = useAgentStore();
useTelegramInit()

const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
const [editingRoom, setEditingRoom] = useState<any>(null)
const {user} = userStore()

const {
  register,
  handleSubmit,
  reset,
  control,
  formState: { errors, isSubmitting },
  } = useForm<RoomFormData>({
  resolver: zodResolver(roomSchema),
  defaultValues: {
  name: "",
  entryFee: 10,
  capacity: 100,
  minPlayers: 2,
  pattern: "LINE_AND_CORNERS",
  status: editingRoom ? editingRoom.status : "OPEN",
  botAllowed: false,
  minBots: 0,
  maxBots: 0,
  maxCards: 1,
  minDraws: 6,
  maxDraws: 12,
  fakeWinEnabled: false,
  commissionRate: 0,
  },            
})

useEffect(() => {
  if (!agentId) return
  loadRooms(agentId)
}, [agentId, loadRooms])

// const onSubmit = async (data: RoomFormData) => {
//   try {
//   if (editingRoom) {
//     await updateRoom(editingRoom.id, activeAgentId!, data)
//     setEditingRoom(null)
//     } else {
//     await createRoom(data)
//   }
//   reset()
//   setIsCreateDialogOpen(false)
//   } catch (error) {
//   console.error("Failed to save room:", error)
//   }
// }

const onSubmit = async (data: RoomFormData) => {
    if (!agentId) {
      console.error("Missing Agent ID")
      return
    }

    const payload = {
      ...data,
    }

    try {
      if (editingRoom) {
        await updateRoom(editingRoom.id, agentId, payload)
        setEditingRoom(null)
      } else if (!editingRoom && user?.role === "ADMIN"){
        await createRoom(payload, agentId)
      } else {
        alert("You don't have permission to create rooms. Request the ADMIN to create for you.")
        return
      }

      reset()
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error("Failed to save room:", error)
    }
  }


const handleEdit = (room: any) => {
  setEditingRoom(room)
  reset({
  name: room.name,
  entryFee: room.entryFee,
  capacity: room.capacity,
  minPlayers: room.minPlayers,
  pattern: room.pattern,
  status: room.status,
  botAllowed: room.botAllowed,
  minBots: room.minBots,
  maxBots: room.maxBots,
  maxCards: room.maxCards,
  minDraws: room.minDraws,
  maxDraws: room.maxDraws,
  fakeWinEnabled: room.fakeWinEnabled,
  commissionRate: room.commissionRate,
  })
  setIsCreateDialogOpen(true)
}

const handleDelete = async (roomId: number) => {
  if (confirm("Are you sure you want to delete this room? This action cannot be undone.")) {
  await deleteRoom(roomId, agentId!)
  resetGameState() // Reset game state after deleting a room
  }
}

const handleCancel = () => {
  setIsCreateDialogOpen(false)
  setEditingRoom(null)
  reset()
  }

return ( 
  <div className="space-y-4 sm:space-y-6"> 
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"> 
      <div> 
        <h1 className="text-2xl sm:text-3xl font-bold">Room Management</h1> 
        <p className="text-sm sm:text-base text-muted-foreground">Create and manage bingo rooms</p> 
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
        {user?.role === "ADMIN" && <DialogTrigger asChild>
          <Button disabled={isLoading} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            {editingRoom ? "Edit Room" : "Create Room"}
          </Button>
        </DialogTrigger>}
        <DialogContent className="w-[96vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>{editingRoom ? "Edit Room" : "Create New Room"}</DialogTitle>
            <DialogDescription>
              {editingRoom ? "Update room settings" : "Set up a new bingo room with custom settings"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 overflow-y-auto max-h-[80vh] pr-2">
            <InputField
              label="Room Name"
              placeholder="Enter room name"
              required
              {...register("name")}
              error={errors.name?.message}
            />

            <InputField
              label="Entry Fee ($)"
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

            <Controller
              name="pattern"
              control={control}
              defaultValue="LINE"
              render={({ field }) => (
                <SelectField
                  label="Winning Pattern"
                  value={field.value}
                  onValueChange={field.onChange}
                  error={errors.pattern?.message}
                >
                  {roomPatterns.map((pattern) => (
                    <SelectItem key={pattern} value={pattern}>
                      {pattern.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectField>
              )}
            />

            {editingRoom && (
              <Controller
                name="status"
                control={control}
                defaultValue={editingRoom.status || ""}
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

            {/* NEW BOT FIELDS */}
            <Controller
              name="botAllowed"
              control={control}
              defaultValue={false}
              render={({ field }) => (
                <SelectField
                  label="Allow Bots?"
                  value={field.value ? "true" : "false"}
                  onValueChange={(v) => field.onChange(v === "true")}
                  error={errors.botAllowed?.message}
                >
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectField>
              )}
            />

            <InputField
              label="Minimum Bots"
              type="number"
              min="0"
              placeholder="0"
              {...register("minBots", { valueAsNumber: true })}
              error={errors.minBots?.message}
            />

            <InputField
              label="Maximum Bots"
              type="number"
              min="0"
              max="100"
              placeholder="0"
              {...register("maxBots", { valueAsNumber: true })}
              error={errors.maxBots?.message}
            />

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

            <Controller
              name="fakeWinEnabled"
              control={control}
              defaultValue={false}
              render={({ field }) => (
                <SelectField
                  label="Enable Awuto Wins?"
                  value={field.value ? "true" : "false"}
                  onValueChange={(v) => field.onChange(v === "true")}
                  error={errors.fakeWinEnabled?.message}
                >
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectField>
              )}
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

            {error && <div className="text-red-700 px-4 py-3 rounded">{error}</div>}

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

    {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">All Rooms</CardTitle>
        <CardDescription className="text-sm">Manage existing bingo rooms</CardDescription>
      </CardHeader>
      <CardContent className="p-1 sm:p-6">
        {isLoading ? (
          <div className="text-center py-8">Loading rooms...</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">Name</TableHead>
                  <TableHead className="min-w-[80px]">Entry Fee</TableHead>
                  <TableHead className="min-w-[100px]">Min Players</TableHead>
                  <TableHead className="min-w-[80px]">Capacity</TableHead>
                  <TableHead className="min-w-[80px]">Bots Allowed</TableHead>
                  <TableHead className="min-w-[80px]">Min Bots</TableHead>
                  <TableHead className="min-w-[80px]">Max Bots</TableHead>
                  <TableHead className="min-w-[80px]">Min Draws</TableHead>
                  <TableHead className="min-w-[80px]">Max Draws</TableHead>
                  <TableHead className="min-w-[100px]">Auto Win</TableHead>
                  <TableHead className="min-w-[100px]">Commission</TableHead>
                  <TableHead className="min-w-[100px]">Max Cards</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[100px]">Pattern</TableHead>
                  <TableHead className="min-w-[140px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rooms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={14} className="text-center py-6 text-muted-foreground">
                      No rooms data
                    </TableCell>
                  </TableRow>
                ) : (
                  rooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell className="font-medium">{room.name}</TableCell>
                      <TableCell>${room.entryFee}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span className="text-sm">{room.minPlayers}</span>
                        </div>
                      </TableCell>
                      <TableCell>{room.capacity}</TableCell>
                      <TableCell>{room.botAllowed ? "Yes" : "No"}</TableCell>
                      <TableCell>{room.minBots}</TableCell>
                      <TableCell>{room.maxBots}</TableCell>
                      <TableCell>{room.minDraws}</TableCell>
                      <TableCell>{room.maxDraws}</TableCell>
                      <TableCell>{room.fakeWinEnabled ? "Yes" : "No"}</TableCell>
                      <TableCell>{room.commissionRate}</TableCell>
                      <TableCell>{room.maxCards}</TableCell>
                      <TableCell>
                        <Badge
                          variant={room.status === "OPEN" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {room.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {typeof room.pattern === "string" ? room.pattern : room.pattern || "Unknown"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(room)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(room.id)}
                            disabled={isLoading}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
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
  </div>
  )
}