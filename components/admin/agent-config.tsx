"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Landmark, Loader2, Palette, RefreshCw } from "lucide-react"
import { SelectField } from "@/components/ui/form-fields"
import { SelectItem } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { AGENT_THEMES, DEFAULT_THEME_KEY, isThemeKey } from "@/lib/themes"
import i18n from "@/i18n"

// Matches AgentConfigDto returned by the admin config endpoints
interface AgentBotConfig {
  agentId: number
  name: string | null
  adminIds: string | null
  logoName: string | null
  supportContact: string | null
  supportUsername: string | null
  supportChannel: string | null
  bankDetails: Record<string, Record<string, any>> | null
  themeKey?: string | null
  hideName: boolean
}

interface AgentConfigProps {
  agentId: number
}

function ReadOnlyField({ label, value, mono = false }: { label: string; value: string | null; mono?: boolean }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <p className={`rounded-md border bg-muted px-3 py-2 text-sm min-h-10 ${mono ? "font-mono" : ""}`}>
        {value || <span className="text-muted-foreground">Not set</span>}
      </p>
    </div>
  )
}

export function AgentConfig({ agentId }: AgentConfigProps) {
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [config, setConfig] = useState<AgentBotConfig | null>(null)
  const [themeKey, setThemeKey] = useState<string>(DEFAULT_THEME_KEY)
  const [hideName, setHideName] = useState(false)
  const [saving, setSaving] = useState(false)

  const fetchConfig = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/${i18n.language}/api/admin/agents/${agentId}/config`, {
        cache: "no-store",
      })
      const result = await response.json()

      if (response.status === 404) {
        setNotFound(true)
        setConfig(null)
        return
      }
      if (!response.ok || !result.success) {
        throw new Error(result.message || result.error || "Failed to fetch agent config")
      }

      setNotFound(false)
      setConfig(result.data as AgentBotConfig)
      setThemeKey(
        isThemeKey(result.data?.themeKey) ? result.data.themeKey : DEFAULT_THEME_KEY
      )
      setHideName(result.data?.hideName === true)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch agent config",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConfig()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId])

  const saveConfig = async (title: string, description: string) => {
    setSaving(true)
    try {
      // PUT has replace semantics on the backend — send the full config.
      const response = await fetch(`/${i18n.language}/api/admin/agents/${agentId}/config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: config?.name ?? null,
          adminIds: config?.adminIds ?? null,
          logoName: config?.logoName ?? null,
          supportContact: config?.supportContact ?? null,
          supportUsername: config?.supportUsername ?? null,
          supportChannel: config?.supportChannel ?? null,
          bankDetails: config?.bankDetails ?? null,
          themeKey,
          hideName,
        }),
      })
      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || result.error || "Failed to save config")
      }

      setConfig(result.data as AgentBotConfig)
      toast({ title, description })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save config",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const bankDetails = config?.bankDetails ?? {}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agent Config</h1>
          <p className="text-muted-foreground">
            Bot brand and support settings for agent #{agentId}
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchConfig} disabled={loading}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {notFound && (
        <Alert>
          <AlertDescription>
            No config exists for this agent yet.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            UI Theme
          </CardTitle>
          <CardDescription>
            Player-facing color palette. Applies to everyone opening the app through this agent&apos;s link.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1 max-w-sm">
            <SelectField label="Palette" value={themeKey} onValueChange={setThemeKey}>
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
          </div>
          <Button
            onClick={() => saveConfig("Theme saved", "Players will see it on next page load.")}
            disabled={saving || themeKey === (isThemeKey(config?.themeKey) ? config.themeKey : DEFAULT_THEME_KEY)}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Theme"
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Brand &amp; Support</CardTitle>
          <CardDescription>Shown in bot messages and deposit instructions</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <ReadOnlyField label="Brand Name" value={config?.name ?? null} />
          <ReadOnlyField label="Support Contact" value={config?.supportContact ?? null} />
          <ReadOnlyField label="Support Username" value={config?.supportUsername ? `@${config.supportUsername}` : null} />
          <ReadOnlyField label="Support Channel" value={config?.supportChannel ? `@${config.supportChannel}` : null} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Landmark className="h-5 w-5" />
            Deposit Bank Details
          </CardTitle>
          <CardDescription>
            Payment methods shown to players during deposit.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <Switch id="hide-name" checked={hideName} onCheckedChange={setHideName} />
              <div className="space-y-1">
                <Label htmlFor="hide-name">Hide receiver name</Label>
                <p className="text-sm text-muted-foreground">
                  Don&apos;t show the receiver/account name in Telebirr and CBE deposit instructions.
                </p>
              </div>
            </div>
            <Button
              onClick={() => saveConfig("Setting saved", "Applies to the next deposit instructions the bot sends.")}
              disabled={saving || hideName === (config?.hideName === true)}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>

          {Object.entries(bankDetails).map(([method, fields]) => (
            <div key={method} className="rounded-lg border p-4 space-y-3">
              <Badge variant="secondary" className="font-mono">{method}</Badge>
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.entries(fields ?? {}).map(([field, value]) => (
                  <ReadOnlyField
                    key={field}
                    label={field}
                    value={value == null ? null : String(value)}
                    mono
                  />
                ))}
              </div>
            </div>
          ))}

          {Object.keys(bankDetails).length === 0 && (
            <p className="text-sm text-muted-foreground">No payment methods configured.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
