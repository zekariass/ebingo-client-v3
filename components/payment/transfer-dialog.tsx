"use client"

import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeftRight, Phone, Send } from "lucide-react"
import { usePaymentStore } from "@/lib/stores/payment-store"
import { currency } from "@/lib/constant"
import { useAgentStore } from "@/lib/stores/agent-store"

interface TransferDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TransferDialog({ open, onOpenChange }: TransferDialogProps) {

  const { activeAgentId } = useAgentStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const { balance, transferFunds, transferError, setTransferError, fetchWallet } = usePaymentStore()

  const minTransfer = 10
  const maxTransferable = useMemo(
    () => Math.min(10000, Math.max(0, (balance?.totalAvailableBalance ?? 0) - minTransfer)),
    [balance?.totalAvailableBalance]
  )

  // Build schema dynamically based on current balance
  const transferSchema = useMemo(
    () =>
      z.object({
        phone: z
          .string()
          .min(8, "Phone number must be at least 8 digits")
          .max(15, "Phone number cannot exceed 15 digits")
          .regex(/^\+?[0-9]*$/, "Phone number must contain only digits and optional +"),
        amount: z
          .number()
          .min(minTransfer, `Minimum transfer is ${minTransfer} ${currency}`)
          .max(maxTransferable, `Maximum transfer is ${maxTransferable} ${currency}`),
      }),
    [maxTransferable]
  )

  type TransferForm = z.infer<typeof transferSchema>

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TransferForm>({
    resolver: zodResolver(transferSchema),
    defaultValues: { amount: 10, phone: "" },
  })

  const selectedAmount = watch("amount")

  // Fetch wallet when dialog opens
  useEffect(() => {
    if (open) {
      setTransferError(null)
      fetchWallet(true, activeAgentId || 0)
    }
  }, [open, fetchWallet])

  const onSubmit = async (data: TransferForm) => {
    if (data.amount > balance.totalAvailableBalance) {
      console.error("Insufficient balance")
      return
    }

    setIsProcessing(true)
    try {
      const success = await transferFunds(data.amount, data.phone, activeAgentId || 0)
      if (success) {
        reset()
        await fetchWallet(true, activeAgentId || 0)
        onOpenChange(false)
      }
    } catch (error) {
      console.error("Transfer failed:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[100vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <ArrowLeftRight className="h-5 w-5 text-primary" />
            Transfer Funds
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Phone field */}
          <div>
            <Label htmlFor="phone" className="py-2">Receiver Phone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="+251912345678"
                {...register("phone")}
                className="pl-9"
              />
            </div>
            {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>}
          </div>

          {/* Amount field */}
          <div>
            <Label htmlFor="amount" className="py-2">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              // min={minTransfer}
              // max={maxTransferable}
              {...register("amount", { valueAsNumber: true })}
              className="text-lg font-semibold"
            />
            {errors.amount && <p className="text-sm text-red-600 mt-1">{errors.amount.message}</p>}

            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>Available Balance:</span>
              <span className="font-semibold">Br {balance.totalAvailableBalance?.toFixed(2)}</span>
            </div>

            <p className="text-xs text-muted-foreground mt-1">
              Max transferable: <span className="font-semibold">Br {maxTransferable.toFixed(2)}</span>
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isProcessing || (selectedAmount || 0) > balance.totalAvailableBalance}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </>
              )}
            </Button>
          </div>
          {transferError && <p className="text-sm text-red-600 text-center">{transferError}</p>}
        </form>
      </DialogContent>
    </Dialog>
  )
}
