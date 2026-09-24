"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Percent, RefreshCw, Save, Trash2 } from "lucide-react"
import i18n from "@/i18n"

// Matches AgentDepositConfigDto
interface AmountRule {
  rate: number
  fixed: number
  max: { isCapped: boolean; amount: number }
}

interface DepositConfig {
  agentId: number
  bonusAmount: AmountRule
  lockAmount: AmountRule
}

interface AgentDepositConfigProps {
  agentId: number
}

const EMPTY_RULE: AmountRule = { rate: 0, fixed: 0, max: { isCapped: false, amount: 0 } }

// value = base * rate + fixed, capped at max.amount when isCapped
function applyRule(base: number, rule: AmountRule) {
  let value = base * rule.rate + rule.fixed
  if (rule.max.isCapped && value > rule.max.amount) value = rule.max.amount
  return value
}

function RuleCard({
  title,
  description,
  rule,
  onChange,
  disabled,
}: {
  title: string
  description: string
  rule: AmountRule
  onChange: (rule: AmountRule) => void
  disabled: boolean
}) {
  const setField = (patch: Partial<AmountRule>) => onChange({ ...rule, ...patch })
  const setMax = (patch: Partial<AmountRule["max"]>) =>
    onChange({ ...rule, max: { ...rule.max, ...patch } })

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Rate (fraction of deposit)</Label>
          <Input
            type="number"
            min={0}
            step="any"
            value={rule.rate}
            disabled={disabled}
            onChange={(e) => setField({ rate: Number(e.target.value) })}
          />
          <p className="text-xs text-muted-foreground">0.1 = 10%</p>
        </div>
        <div className="space-y-2">
          <Label>Fixed amount (ETB)</Label>
          <Input
            type="number"
            min={0}
            step="any"
            value={rule.fixed}
            disabled={disabled}
            onChange={(e) => setField({ fixed: Number(e.target.value) })}
          />
        </div>
        <div className="flex items-center justify-between rounded-md border px-3 py-2 sm:col-span-2">
          <Label htmlFor={`${title}-cap`} className="cursor-pointer">
            Cap at maximum amount
          </Label>
          <Switch
            id={`${title}-cap`}
            checked={rule.max.isCapped}
            disabled={disabled}
            onCheckedChange={(checked) => setMax({ isCapped: checked })}
          />
        </div>
        {rule.max.isCapped && (
          <div className="space-y-2 sm:col-span-2">
            <Label>Maximum amount (ETB)</Label>
            <Input
              type="number"
              min={0}
              step="any"
              value={rule.max.amount}
              disabled={disabled}
              onChange={(e) => setMax({ amount: Number(e.target.value) })}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function AgentDepositConfig({ agentId }: AgentDepositConfigProps) {
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [bonusAmount, setBonusAmount] = useState<AmountRule>(EMPTY_RULE)
  const [lockAmount, setLockAmount] = useState<AmountRule>(EMPTY_RULE)
  const [previewDeposit, setPreviewDeposit] = useState("100")

  const fetchConfig = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/${i18n.language}/api/admin/agents/${agentId}/deposit-config`, {
        cache: "no-store",
      })
      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || result.error || "Failed to fetch deposit config")
      }

      const config = result.data as DepositConfig
      setBonusAmount(config.bonusAmount ?? EMPTY_RULE)
      setLockAmount(config.lockAmount ?? EMPTY_RULE)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch deposit config",
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

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/${i18n.language}/api/admin/agents/${agentId}/deposit-config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bonusAmount, lockAmount }),
      })
      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || result.error || "Failed to save deposit config")
      }

      toast({ title: "Saved", description: "Deposit config updated successfully" })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save deposit config",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    setDeleting(true)
    try {
      const response = await fetch(`/${i18n.language}/api/admin/agents/${agentId}/deposit-config`, {
        method: "DELETE",
      })
      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || result.error || "Failed to reset deposit config")
      }

      toast({ title: "Reset", description: "Deposit config removed; global defaults now apply" })
      await fetchConfig()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reset deposit config",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  const deposit = Number(previewDeposit) || 0
  const previewBonus = applyRule(deposit, bonusAmount)
  const previewLock = applyRule(deposit + previewBonus, lockAmount)

  if (loading) {
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
          <h1 className="text-3xl font-bold tracking-tight">Agent Deposit Config</h1>
          <p className="text-muted-foreground">
            Deposit bonus and lock rules applied to player deposits for agent #{agentId}
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchConfig} disabled={loading}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <RuleCard
        title="Bonus Amount"
        description="bonus = deposit × rate + fixed (credited to the player's bonus balance)"
        rule={bonusAmount}
        onChange={setBonusAmount}
        disabled={saving || deleting}
      />

      <RuleCard
        title="Lock Amount"
        description="lock = (deposit + bonus) × rate + fixed (withheld from withdrawal)"
        rule={lockAmount}
        onChange={setLockAmount}
        disabled={saving || deleting}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            Preview
          </CardTitle>
          <CardDescription>See how the current rules apply to a deposit</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-w-xs space-y-2">
            <Label htmlFor="previewDeposit">Deposit amount (ETB)</Label>
            <Input
              id="previewDeposit"
              type="number"
              min={0}
              step="any"
              value={previewDeposit}
              onChange={(e) => setPreviewDeposit(e.target.value)}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-3 text-sm">
            <div className="rounded-md border p-3">
              <p className="text-muted-foreground">Deposit</p>
              <p className="text-lg font-semibold">{deposit.toFixed(2)} ETB</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-muted-foreground">Bonus credited</p>
              <p className="text-lg font-semibold">{previewBonus.toFixed(2)} ETB</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-muted-foreground">Amount locked</p>
              <p className="text-lg font-semibold">{previewLock.toFixed(2)} ETB</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <Button variant="outline" onClick={handleReset} disabled={saving || deleting}>
          {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
          Reset to Global Defaults
        </Button>
        <Button onClick={handleSave} disabled={saving || deleting}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {saving ? "Saving..." : "Save Config"}
        </Button>
      </div>
    </div>
  )
}
