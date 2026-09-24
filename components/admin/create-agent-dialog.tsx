"use client"

import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { AlertTriangle, Loader2 } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { InputField, SelectField } from "@/components/ui/form-fields"
import { SelectItem } from "@/components/ui/select"
import {
  agentCreateSchema,
  type AgentCreateFormData,
} from "@/lib/schemas/admin-schemas"
import { userStore } from "@/lib/stores/user-store"
import { AGENT_THEMES, DEFAULT_THEME_KEY } from "@/lib/themes"
import i18n from "@/i18n"

const SERVER_FIELDS = [
  "name",
  "code",
  "phoneNumber",
  "email",
  "contactName",
  "contactAddress",
  "commissionRate",
  "isActive",
  "isMaster",
  "botToken",
  "botUsername",
  "themeKey",
] as const

interface CreateAgentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}

export function CreateAgentDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateAgentDialogProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const [serverFieldErrors, setServerFieldErrors] = useState<Record<string, string>>({})

  const {
    register,
    handleSubmit,
    control,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AgentCreateFormData>({
    resolver: zodResolver(agentCreateSchema),
    defaultValues: {
      name: "",
      code: "",
      phoneNumber: "",
      email: "",
      contactName: "",
      contactAddress: "",
      commissionRate: undefined,
      isActive: true,
      isMaster: false,
      botToken: "",
      botUsername: "",
      themeKey: DEFAULT_THEME_KEY,
    },
  })

  const onSubmit = async (data: AgentCreateFormData) => {
    setServerError(null)
    setServerFieldErrors({})

    const payload: Record<string, unknown> = {
      name: data.name.trim(),
      code: data.code.trim(),
      phoneNumber: data.phoneNumber.trim(),
      email: data.email.trim(),
      isActive: data.isActive,
      isMaster: data.isMaster,
    }
    if (data.contactName?.trim()) payload.contactName = data.contactName.trim()
    if (data.contactAddress?.trim()) payload.contactAddress = data.contactAddress.trim()
    if (data.botToken?.trim()) payload.botToken = data.botToken.trim()
    if (data.botUsername?.trim()) payload.botUsername = data.botUsername.trim()
    if (data.themeKey?.trim()) payload.themeKey = data.themeKey.trim()
    if (data.commissionRate !== undefined) payload.commissionRate = data.commissionRate

    try {
      const res = await fetch(`/${i18n.language}/api/admin/agents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": userStore.getState().user?.role || "",
        },
        body: JSON.stringify(payload),
      })
      const body = await res.json().catch(() => null)

      if (res.ok && body?.success) {
        toast.success(`Agent "${body.data?.name ?? data.name}" created`)
        reset()
        onOpenChange(false)
        onCreated()
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
        const message = body?.message || "Validation failed"
        setServerError(message)
        toast.error(message)
        return
      }

      const message =
        body?.message || body?.error || `Request failed (${res.status})`
      setServerError(message)
      toast.error(message)
    } catch (err) {
      console.error("Create agent request failed:", err)
      setServerError("Network error — could not reach the server")
      toast.error("Network error — could not reach the server")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Create Agent</DialogTitle>
        </DialogHeader>

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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Agent Name"
              placeholder="Example Agent"
              required
              {...register("name")}
              error={errors.name?.message}
            />
            <InputField
              label="Agent Code"
              placeholder="AGT-001"
              required
              {...register("code")}
              error={errors.code?.message}
            />
            <InputField
              label="Email"
              type="email"
              placeholder="agent@example.com"
              required
              {...register("email")}
              error={errors.email?.message}
            />
            <InputField
              label="Phone Number"
              placeholder="251911223344"
              required
              {...register("phoneNumber")}
              error={errors.phoneNumber?.message}
            />
            <InputField
              label="Contact Name"
              placeholder="Optional"
              {...register("contactName")}
              error={errors.contactName?.message}
            />
            <InputField
              label="Contact Address"
              placeholder="Optional"
              {...register("contactAddress")}
              error={errors.contactAddress?.message}
            />
            <InputField
              label="Commission Rate (%)"
              type="number"
              step="0.01"
              min="0"
              max="100"
              placeholder="0"
              {...register("commissionRate", {
                setValueAs: (v) =>
                  v === "" || v === null || v === undefined ? undefined : Number(v),
              })}
              error={errors.commissionRate?.message}
            />
            <InputField
              label="Bot Username"
              placeholder="example_bot"
              {...register("botUsername")}
              error={errors.botUsername?.message}
            />
            <InputField
              label="Bot Token"
              type="password"
              placeholder="Telegram bot token (optional)"
              autoComplete="off"
              {...register("botToken")}
              error={errors.botToken?.message}
            />
            <Controller
              name="themeKey"
              control={control}
              render={({ field }) => (
                <SelectField
                  label="UI Theme"
                  value={field.value ?? DEFAULT_THEME_KEY}
                  onValueChange={field.onChange}
                  error={errors.themeKey?.message}
                >
                  {AGENT_THEMES.map((theme) => (
                    <SelectItem key={theme.key} value={theme.key}>
                      <span className="flex items-center gap-2">
                        <span
                          className="inline-block h-3 w-3 rounded-full border border-black/10"
                          style={{ backgroundColor: theme.swatch }}
                        />
                        {theme.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectField>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <SelectField
                    label="Status"
                    value={String(field.value)}
                    onValueChange={(v) => field.onChange(v === "true")}
                    error={errors.isActive?.message}
                  >
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectField>
                )}
              />
              <Controller
                name="isMaster"
                control={control}
                render={({ field }) => (
                  <SelectField
                    label="Master Agent"
                    value={String(field.value)}
                    onValueChange={(v) => field.onChange(v === "true")}
                    error={errors.isMaster?.message}
                  >
                    <SelectItem value="false">No</SelectItem>
                    <SelectItem value="true">Yes</SelectItem>
                  </SelectField>
                )}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Agent"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
