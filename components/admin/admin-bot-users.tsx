"use client"

import { useEffect, useMemo, useState } from "react"
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { InputField, SelectField } from "@/components/ui/form-fields"
import { SelectItem } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { botUsersSchema, type BotUsersFormData } from "@/lib/schemas/admin-schemas"
import { userStore } from "@/lib/stores/user-store"
import type { Agent } from "@/lib/stores/agent-store"
import type { Room } from "@/lib/stores/admin-store"
import i18n from "@/i18n"

const PREVIEW_LIMIT = 10

interface BotUsersResult {
  createdCount: number
  firstId: number
  lastId: number
  firstPhone: string
  lastPhone: string
  botRoomId: number
  agentId: number
  initialBalance: number
}

const SERVER_FIELDS = [
  "startId",
  "startPhone",
  "botRoomId",
  "agentId",
  "count",
  "initialBalance",
] as const

export function AdminBotUsers({ defaultAgentId }: { defaultAgentId?: number }) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [agentsLoading, setAgentsLoading] = useState(true)
  const [rooms, setRooms] = useState<Room[]>([])
  const [roomsLoading, setRoomsLoading] = useState(false)
  const [roomsError, setRoomsError] = useState(false)
  const [namesOpen, setNamesOpen] = useState(false)
  const [result, setResult] = useState<BotUsersResult | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const [serverFieldErrors, setServerFieldErrors] = useState<Record<string, string>>({})
  const [conflictWarning, setConflictWarning] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BotUsersFormData>({
    resolver: zodResolver(botUsersSchema),
    defaultValues: {
      startId: undefined,
      startPhone: undefined,
      botRoomId: undefined,
      agentId: defaultAgentId || undefined,
      count: 10,
      initialBalance: 1_000_000_000,
      names: [],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: "names" })

  const [startId, startPhone, count, names, selectedAgentId] = useWatch({
    control,
    name: ["startId", "startPhone", "count", "names", "agentId"],
  })

  useEffect(() => {
    const loadAgents = async () => {
      try {
        const res = await fetch(`/${i18n.language}/api/agents/active`, {
          headers: { "x-user-role": userStore.getState().user?.role || "" },
          cache: "no-store",
        })
        const body = await res.json()
        if (res.ok && body?.success && Array.isArray(body.data)) {
          setAgents(body.data)
        }
      } catch (err) {
        console.error("Failed to load active agents:", err)
      } finally {
        setAgentsLoading(false)
      }
    }
    loadAgents()
  }, [])

  // Fetch rooms whenever the selected agent changes
  useEffect(() => {
    setRooms([])
    setRoomsError(false)
    setValue("botRoomId", undefined as unknown as number)

    const agentId = Number(selectedAgentId)
    if (!Number.isFinite(agentId) || agentId <= 0) return

    let cancelled = false
    const loadRooms = async () => {
      setRoomsLoading(true)
      try {
        const res = await fetch(
          `/${i18n.language}/api/rooms?agentId=${agentId}`,
          {
            headers: { "x-user-role": userStore.getState().user?.role || "" },
            cache: "no-store",
          }
        )
        const body = await res.json()
        if (cancelled) return
        if (res.ok && body?.success && Array.isArray(body.data)) {
          setRooms(body.data)
        } else {
          setRoomsError(true)
        }
      } catch (err) {
        console.error("Failed to load rooms for agent:", err)
        if (!cancelled) setRoomsError(true)
      } finally {
        if (!cancelled) setRoomsLoading(false)
      }
    }
    loadRooms()
    return () => {
      cancelled = true
    }
  }, [selectedAgentId, setValue])

  const previewRows = useMemo(() => {
    const n = Number(count)
    const id0 = Number(startId)
    const phone0 = Number(startPhone)
    if (!Number.isFinite(n) || n < 1 || !Number.isFinite(id0) || !Number.isFinite(phone0)) {
      return []
    }
    const usableNames = (names ?? []).filter((nm) => nm?.firstName?.trim())
    const rows = Math.min(n, PREVIEW_LIMIT)
    return Array.from({ length: rows }, (_, i) => {
      const nm = usableNames.length ? usableNames[i % usableNames.length] : null
      const displayName = nm
        ? [nm.firstName, nm.lastName].filter(Boolean).join(" ") +
          (nm.nickname ? ` (${nm.nickname})` : "")
        : null
      return {
        id: id0 + i,
        phone: String(phone0 + i),
        name: displayName,
      }
    })
  }, [startId, startPhone, count, names])

  const onSubmit = async (data: BotUsersFormData) => {
    setResult(null)
    setServerError(null)
    setServerFieldErrors({})
    setConflictWarning(null)

    const cleanNames = (data.names ?? [])
      .map((nm) => ({
        firstName: nm.firstName?.trim() ?? "",
        lastName: nm.lastName?.trim() || undefined,
        nickname: nm.nickname?.trim() || undefined,
      }))
      .filter((nm) => nm.firstName)

    const payload: Record<string, unknown> = {
      startId: data.startId,
      startPhone: data.startPhone,
      botRoomId: data.botRoomId,
      agentId: data.agentId,
      count: data.count,
      initialBalance: Number.isFinite(data.initialBalance)
        ? data.initialBalance
        : 1_000_000_000,
      ...(cleanNames.length ? { names: cleanNames } : {}),
    }

    try {
      const res = await fetch(`/${i18n.language}/api/admin/bot-users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": userStore.getState().user?.role || "",
        },
        body: JSON.stringify(payload),
      })
      const body = await res.json().catch(() => null)

      if (res.status === 201 && body?.success) {
        setResult(body.data as BotUsersResult)
        toast.success(`Created ${body.data.createdCount} bot users`, {
          description: `IDs ${body.data.firstId}–${body.data.lastId}`,
        })
        return
      }

      if (res.status === 400) {
        const fieldErrors: Record<string, string> = body?.errors ?? {}
        setServerFieldErrors(fieldErrors)
        for (const [field, message] of Object.entries(fieldErrors)) {
          if ((SERVER_FIELDS as readonly string[]).includes(field)) {
            setError(field as (typeof SERVER_FIELDS)[number], {
              type: "server",
              message: String(message),
            })
          }
        }
        setServerError(body?.message || "Validation failed")
        toast.error(body?.message || "Validation failed")
        return
      }

      if (res.status === 409) {
        setConflictWarning(
          body?.message ||
            "ID/phone range already in use — nothing was inserted. Do not retry the same payload; pick a new startId."
        )
        toast.warning("Range already in use — nothing inserted")
        return
      }

      if (res.status === 404) {
        const message = body?.message || "Agent not found"
        setError("agentId", { type: "server", message })
        setServerError(message)
        toast.error(message)
        return
      }

      const message = body?.message || body?.error || `Request failed (${res.status})`
      setServerError(message)
      toast.error(message)
    } catch (err) {
      console.error("Bot users request failed:", err)
      setServerError("Network error — could not reach the server")
      toast.error("Network error — could not reach the server")
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
          <Bot className="h-7 w-7" /> Bot Users
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Bulk-create bot user profiles and wallets for a room
        </p>
      </div>

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>All-or-nothing, not idempotent</AlertTitle>
        <AlertDescription>
          Either every bot is created or none are. A <strong>409</strong> means the
          id/phone range is already taken — nothing was inserted and{" "}
          <strong>do not retry the same payload</strong>. Choose a new Start ID
          instead (existing seeds use <code>100001xxxx</code> blocks per room).
        </AlertDescription>
      </Alert>

      {conflictWarning && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Range already in use — nothing inserted</AlertTitle>
          <AlertDescription>{conflictWarning}</AlertDescription>
        </Alert>
      )}

      {serverError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Request failed</AlertTitle>
          <AlertDescription>
            {serverError}
            {Object.keys(serverFieldErrors).length > 0 && (
              <ul className="mt-2 list-disc pl-5">
                {Object.entries(serverFieldErrors).map(([field, message]) => (
                  <li key={field}>
                    <span className="font-medium">{field}</span>: {message}
                  </li>
                ))}
              </ul>
            )}
          </AlertDescription>
        </Alert>
      )}

      {result && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Bot users created</AlertTitle>
          <AlertDescription>
            <div className="mt-1 grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-3">
              <span>
                Created: <strong>{result.createdCount}</strong>
              </span>
              <span>
                IDs: <strong>{result.firstId}–{result.lastId}</strong>
              </span>
              <span>
                Phones: <strong>{result.firstPhone}–{result.lastPhone}</strong>
              </span>
              <span>
                Room: <strong>{result.botRoomId}</strong>
              </span>
              <span>
                Agent: <strong>{result.agentId}</strong>
              </span>
              <span>
                Balance: <strong>{Number(result.initialBalance ?? 0).toLocaleString()}</strong>
              </span>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Create Bot Users</CardTitle>
            <CardDescription className="text-sm">
              IDs and phones increment by 1 per record
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Start ID"
                  type="number"
                  min="1"
                  placeholder="1000017001"
                  required
                  {...register("startId", { valueAsNumber: true })}
                  error={errors.startId?.message}
                />
                <InputField
                  label="Start Phone"
                  type="number"
                  min="1"
                  placeholder="251900017013"
                  required
                  {...register("startPhone", { valueAsNumber: true })}
                  error={errors.startPhone?.message}
                />
                {!Number.isFinite(Number(selectedAgentId)) || Number(selectedAgentId) <= 0 ? (
                  <InputField
                    label="Bot Room"
                    placeholder="Select an agent first"
                    required
                    disabled
                    error={errors.botRoomId?.message}
                  />
                ) : rooms.length > 0 ? (
                  <Controller
                    name="botRoomId"
                    control={control}
                    render={({ field }) => (
                      <SelectField
                        label="Bot Room"
                        required
                        placeholder={roomsLoading ? "Loading rooms..." : "Select room"}
                        value={field.value ? String(field.value) : ""}
                        onValueChange={(v) => field.onChange(Number(v))}
                        error={errors.botRoomId?.message}
                      >
                        {rooms.map((room) => (
                          <SelectItem key={room.id} value={String(room.id)}>
                            {room.name} — #{room.id}
                          </SelectItem>
                        ))}
                      </SelectField>
                    )}
                  />
                ) : (
                  <InputField
                    label="Bot Room ID"
                    type="number"
                    min="1"
                    placeholder={
                      roomsLoading
                        ? "Loading rooms..."
                        : roomsError
                          ? "Couldn't load rooms — enter ID"
                          : "No rooms found — enter ID"
                    }
                    required
                    {...register("botRoomId", { valueAsNumber: true })}
                    error={errors.botRoomId?.message}
                  />
                )}
                {agents.length > 0 ? (
                  <Controller
                    name="agentId"
                    control={control}
                    render={({ field }) => (
                      <SelectField
                        label="Agent"
                        required
                        placeholder={agentsLoading ? "Loading agents..." : "Select agent"}
                        value={field.value ? String(field.value) : ""}
                        onValueChange={(v) => field.onChange(Number(v))}
                        error={errors.agentId?.message}
                      >
                        {agents.map((agent) => (
                          <SelectItem key={agent.id} value={String(agent.id)}>
                            {agent.name} ({agent.code}) — #{agent.id}
                          </SelectItem>
                        ))}
                      </SelectField>
                    )}
                  />
                ) : (
                  <InputField
                    label="Agent ID"
                    type="number"
                    min="1"
                    placeholder={agentsLoading ? "Loading agents..." : "1"}
                    required
                    {...register("agentId", { valueAsNumber: true })}
                    error={errors.agentId?.message}
                  />
                )}
                <InputField
                  label="Count"
                  type="number"
                  min="1"
                  max="500"
                  placeholder="10"
                  required
                  {...register("count", { valueAsNumber: true })}
                  error={errors.count?.message}
                />
                <InputField
                  label="Initial Balance"
                  type="number"
                  min="0"
                  placeholder="1000000000"
                  {...register("initialBalance", { valueAsNumber: true })}
                  error={errors.initialBalance?.message}
                />
              </div>

              <Collapsible open={namesOpen} onOpenChange={setNamesOpen}>
                <CollapsibleTrigger asChild>
                  <Button type="button" variant="outline" className="w-full justify-between">
                    <span className="flex items-center gap-2">
                      Names (optional)
                      {fields.length > 0 && (
                        <Badge variant="secondary">{fields.length}</Badge>
                      )}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${namesOpen ? "rotate-180" : ""}`}
                    />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-3 space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Names are assigned in order and cycle if fewer than the count.
                    Leave empty to use the built-in Ethiopian name pool.
                  </p>
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-end gap-2">
                      <div className="grid flex-1 grid-cols-3 gap-2">
                        <InputField
                          label="First name"
                          placeholder="Lensa"
                          {...register(`names.${index}.firstName` as const)}
                          error={errors.names?.[index]?.firstName?.message}
                        />
                        <InputField
                          label="Last name"
                          placeholder="Merga"
                          {...register(`names.${index}.lastName` as const)}
                          error={errors.names?.[index]?.lastName?.message}
                        />
                        <InputField
                          label="Nickname"
                          placeholder="Lensi"
                          {...register(`names.${index}.nickname` as const)}
                          error={errors.names?.[index]?.nickname?.message}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => remove(index)}
                        className="h-8 w-8 p-0 mb-1"
                        aria-label={`Remove name ${index + 1}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({ firstName: "", lastName: "", nickname: "" })
                    }
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add name
                  </Button>
                </CollapsibleContent>
              </Collapsible>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  `Create ${Number.isFinite(Number(count)) ? Number(count) : ""} Bot Users`
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Preview</CardTitle>
            <CardDescription className="text-sm">
              First {Math.min(previewRows.length, PREVIEW_LIMIT)} of{" "}
              {Number.isFinite(Number(count)) ? Number(count) : 0} records that will
              be created
            </CardDescription>
          </CardHeader>
          <CardContent className="p-1 sm:p-6">
            {previewRows.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Enter Start ID, Start Phone and Count to preview
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[110px]">ID / Telegram ID</TableHead>
                      <TableHead className="min-w-[120px]">Phone</TableHead>
                      <TableHead className="min-w-[140px]">Name</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewRows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-mono text-sm">{row.id}</TableCell>
                        <TableCell className="font-mono text-sm">{row.phone}</TableCell>
                        <TableCell className="text-sm">
                          {row.name ?? (
                            <span className="text-muted-foreground italic">
                              default pool
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {Number(count) > PREVIEW_LIMIT && (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center text-muted-foreground text-sm"
                        >
                          … +{Number(count) - PREVIEW_LIMIT} more
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
