"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Lock, Palette, RefreshCw, Save, UserCog } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AGENT_THEMES, DEFAULT_THEME_KEY, isThemeKey } from "@/lib/themes"
import { useAgentStore } from "@/lib/stores/agent-store"

interface AgentProfileProps {
  agentId: number
}

function agentThemeKey(key: unknown): string {
  return isThemeKey(key) ? key : DEFAULT_THEME_KEY
}

function ReadOnlyField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1.5">
        <Lock className="h-3 w-3 text-muted-foreground" />
        {label}
      </Label>
      <p className="rounded-md border bg-muted px-3 py-2 text-sm min-h-10">
        {value || <span className="text-muted-foreground">Not set</span>}
      </p>
    </div>
  )
}

export function AgentProfile({ agentId }: AgentProfileProps) {
  const { toast } = useToast()
  const { agentDetails, loading, error, fetchAgentDetails, updateOwnAgent } = useAgentStore()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [contactName, setContactName] = useState("")
  const [contactAddress, setContactAddress] = useState("")
  const [themeKey, setThemeKey] = useState<string>(DEFAULT_THEME_KEY)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchAgentDetails(agentId).catch(() => {})
  }, [agentId, fetchAgentDetails])

  useEffect(() => {
    if (!agentDetails || agentDetails.id !== agentId) return
    setName(agentDetails.name ?? "")
    setEmail(agentDetails.email ?? "")
    setPhoneNumber(agentDetails.phoneNumber ?? "")
    setContactName(agentDetails.contactName ?? "")
    setContactAddress(agentDetails.contactAddress ?? "")
    setThemeKey(agentThemeKey(agentDetails.themeKey))
  }, [agentDetails, agentId])

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateOwnAgent(agentId, {
        name,
        email,
        phoneNumber,
        contactName,
        contactAddress,
        themeKey,
      })
      toast({ title: "Profile saved", description: "Your agent profile was updated." })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save profile",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading && !agentDetails) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Agent</h1>
          <p className="text-muted-foreground">
            Profile settings for agent #{agentId}
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => fetchAgentDetails(agentId)}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Profile
          </CardTitle>
          <CardDescription>
            Contact and display details for your agent account.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="agent-name">Agent Name</Label>
            <Input id="agent-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="agent-email">Email</Label>
            <Input
              id="agent-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="agent-phone">Phone Number</Label>
            <Input
              id="agent-phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="agent-contact-name">Contact Name</Label>
            <Input
              id="agent-contact-name"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="agent-contact-address">Contact Address</Label>
            <Input
              id="agent-contact-address"
              value={contactAddress}
              onChange={(e) => setContactAddress(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            UI Theme
          </CardTitle>
          <CardDescription>
            Player-facing color palette for everyone opening the app through your link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-sm space-y-2">
            <Label htmlFor="agent-theme">Palette</Label>
            <Select value={themeKey} onValueChange={setThemeKey}>
              <SelectTrigger id="agent-theme">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
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
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Restricted
          </CardTitle>
          <CardDescription>
            These settings can only be changed by an administrator.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <ReadOnlyField label="Agent Code" value={agentDetails?.code} />
          <ReadOnlyField
            label="Bot Username"
            value={agentDetails?.botUsername ? `@${agentDetails.botUsername}` : null}
          />
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Lock className="h-3 w-3 text-muted-foreground" />
              Status
            </Label>
            <p className="rounded-md border bg-muted px-3 py-2 text-sm min-h-10 flex items-center">
              <Badge variant={agentDetails?.isActive ? "secondary" : "destructive"}>
                {agentDetails?.isActive ? "Active" : "Inactive"}
              </Badge>
              {agentDetails?.isMaster && (
                <Badge variant="outline" className="ml-2">Master</Badge>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving || !agentDetails}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
