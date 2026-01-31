"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { usePaymentStore } from "@/lib/stores/payment-store"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreditCard, DollarSign } from "lucide-react"
import { currency } from "@/lib/constant"
import { useAgentStore } from "@/lib/stores/agent-store"
import { userStore } from "@/lib/stores/user-store"
import { useTelegramInit } from "@/lib/hooks/use-telegram-init"

const depositSchema = z.object({
  amount: z.number().min(50, `Minimum deposit is 50 ${currency}`).max(10000, `Maximum deposit is 10000 ${currency}`),
  paymentMethodId: z.number().min(1, "Please select a payment method"),
})

type DepositForm = z.infer<typeof depositSchema>

interface DepositDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DepositDialog({ open, onOpenChange }: DepositDialogProps) {
  useTelegramInit();
  const { activeAgentId } = useAgentStore();
  const {user} = userStore();
  const [isProcessing, setIsProcessing] = useState(false)
  const { paymentMethods, addDeposit, fetchPaymentMethods, getDefaultPaymentMethod, balance} = usePaymentStore()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<DepositForm>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      amount: 50,
      paymentMethodId: getDefaultPaymentMethod()?.id,
    },
  })

  const selectedAmount = watch("amount")
  const quickAmounts = [50, 100, 200, 500]

  useEffect(()=>{
    fetchPaymentMethods()
  }, [fetchPaymentMethods])

  const onSubmit = async (data: DepositForm) => {
    setIsProcessing(true)

    try {
      addDeposit(data.amount, data.paymentMethodId, user?.phoneNumber!, activeAgentId || 0)

        reset()
        onOpenChange(false)
    } catch (error) {
      console.error("Deposit Failed:", error instanceof Error ? error.message : "Please try again")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Deposit Funds
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount" className="pb-3">Amount</Label>
              <div className="space-y-3">
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="10"
                  max="1000"
                  {...register("amount", { valueAsNumber: true })}
                  className="text-lg font-semibold"
                />
                {errors.amount && <p className="text-sm text-red-600">{errors.amount.message}</p>}

                <div className="grid grid-cols-4 gap-2">
                  {quickAmounts.map((amount) => (
                    <Button
                      key={amount}
                      type="button"
                      variant={selectedAmount === amount ? "destructive" : "outline"}
                      size="sm"
                      onClick={() => setValue("amount", amount)}
                      className="bg-transparent"
                    >
                      ${amount}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="paymentMethod" className="pb-3">Payment Method</Label>
              <Select value={watch("paymentMethodId")?.toString() ?? ""} onValueChange={(value) => setValue("paymentMethodId", Number(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.id} value={method.id.toString()}>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        {method.name}
                        {method.isDefault && <span className="text-xs text-muted-foreground">(Default)</span>}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.paymentMethodId && <p className="text-sm text-red-600">{errors.paymentMethodId.message}</p>}
            </div>
          </div>

          {/* <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>Deposit Amount:</span>
              <span className="font-semibold">${selectedAmount?.toFixed(2) || "0.00"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Processing Fee:</span>
              <span className="font-semibold">$0.00</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-semibold">
              <span>Total:</span>
              <span>${selectedAmount?.toFixed(2) || "0.00"}</span>
            </div>
          </div> */}

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
            <Button type="submit" className="flex-1" disabled={isProcessing || paymentMethods.length === 0}>
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Processing...
                </>
              ) : (
                "Deposit"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
