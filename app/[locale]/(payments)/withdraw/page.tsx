'use client'

import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreditCard, Phone, X } from "lucide-react"

import { usePaymentStore } from "@/lib/stores/payment-store"
import { userStore } from "@/lib/stores/user-store"
import { useTelegramInit } from "@/lib/hooks/use-telegram-init"
import { PaymentMethod } from "@/lib/types"
import i18n from "@/i18n"
import { Card } from "@/components/ui/card"
import { useAgentStore } from "@/lib/stores/agent-store"

/* -----------------------------
   Validation Schema
------------------------------ */
const withdrawSchema = z.object({
  amount: z.number().min(100).max(10000),
  mode: z.enum(["REGISTERED", "BANK"]),
  paymentMethodId: z.number().optional(),
  phoneNumber: z.string().optional(),

  bankName: z.string().optional(),
  accountName: z.string().optional(),
  accountNumber: z.string().optional(),
  password: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.mode === "REGISTERED" && !data.phoneNumber) {
    ctx.addIssue({
      code: "custom",
      path: ["phoneNumber"],
      message: "Phone number required",
    })
  }

  if (data.mode === "BANK") {
    if (!data.bankName) ctx.addIssue({ code: "custom", path: ["bankName"], message: "Bank name required" })
    if (!data.accountName) ctx.addIssue({ code: "custom", path: ["accountName"], message: "Account holder name required" })
    if (!data.accountNumber) ctx.addIssue({ code: "custom", path: ["accountNumber"], message: "Account number required" })
    if (!data.password) ctx.addIssue({ code: "custom", path: ["password"], message: "Password required" })
  }
})

type WithdrawForm = z.infer<typeof withdrawSchema>

/* -----------------------------
   Component
------------------------------ */
// interface WithdrawPageProps {
//   searchParams: {
//     agentId?: number
//   }
// }
export default function WithdrawPage() {
  const searchParams = useSearchParams()
  const agentId = ( searchParams.get("agentId") ? Number(searchParams.get("agentId")) : undefined )
  const {setActiveAgentId} = useAgentStore()
  const router = useRouter()
  useTelegramInit()

  const {
    paymentMethods,
    fetchPaymentMethods,
    fetchWallet,
    withdrawFund,
    balance,
    withdrawError,
    setWithdrawError,
    processing,
    setProcessing
  } = usePaymentStore()

  const registeredPhone = userStore.getState().user?.phoneNumber || ""
  const hasPassword = !!userStore.getState().user?.hasPassword

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    resetField,
    formState: { errors }
  } = useForm<WithdrawForm>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: {
      amount: 0,
      mode: "REGISTERED"
    }
  })

  const mode = watch("mode")
  const selectedMethodId = watch("paymentMethodId")

  useEffect(() => {
    if (agentId !== undefined) {
      setActiveAgentId(agentId);
    } else {
      setActiveAgentId(null);
    }
  }, [agentId]);

  /* -----------------------------
     Detect phone type
  ------------------------------ */
  const phoneType = useMemo(() => {
    const p = registeredPhone.replace("+", "")
    if (/^(09|2519|9)/.test(p)) return "TELEBIRR_CBE"
    if (/^(07|2517|7)/.test(p)) return "MPESA"
    return "UNKNOWN"
  }, [registeredPhone])

  /* -----------------------------
     Filter payment methods
  ------------------------------ */
  const filteredMethods = useMemo(() => {
    const normalize = (code: string) => code.toLowerCase()

    if (mode === "BANK") {
      return paymentMethods.filter(m => normalize(m.code) === "cbebank")
    }

    if (phoneType === "TELEBIRR_CBE") {
      return paymentMethods.filter(m =>
        ["telebirr", "cbe"].includes(normalize(m.code))
      )
    }

    if (phoneType === "MPESA") {
      return paymentMethods.filter(m => normalize(m.code) === "mpesa")
    }

    return []
  }, [mode, phoneType, paymentMethods])

  /* -----------------------------
     Load initial data
  ------------------------------ */
  useEffect(() => {
    if (agentId == null || Number.isNaN(agentId)) return

    (async () => {
      try {
        await fetchPaymentMethods()
        await fetchWallet(true, agentId)
      } catch (err) {
        console.error("Failed to load wallet or payment methods", err)
      }
    })()
  }, [agentId, fetchPaymentMethods, fetchWallet])


  /* -----------------------------
     Sync phone number
  ------------------------------ */
  useEffect(() => {
    if (mode === "REGISTERED") {
      setValue("phoneNumber", registeredPhone)
    }
  }, [mode, registeredPhone, setValue])

  /* -----------------------------
     Auto-select valid payment method
     (THIS FIXES YOUR BUG)
  ------------------------------ */
  useEffect(() => {
    if (filteredMethods.length === 0) {
      setValue("paymentMethodId", undefined)
      return
    }

    setValue("paymentMethodId", filteredMethods[0].id)
  }, [filteredMethods, setValue])

  /* -----------------------------
     Clear irrelevant fields
  ------------------------------ */
  useEffect(() => {
    if (mode === "REGISTERED") {
      resetField("bankName")
      resetField("accountName")
      resetField("accountNumber")
      resetField("password")
    } else {
      resetField("phoneNumber")
    }
  }, [mode, resetField])

  /* -----------------------------
     Submit
  ------------------------------ */
  const onSubmit = async (data: WithdrawForm) => {
    if (data.amount > balance.availableToWithdraw) {
      setWithdrawError("Insufficient balance")
      return
    }

    const selectedMethod: PaymentMethod | undefined =
      paymentMethods.find(m => m.id === data.paymentMethodId)

    if (!selectedMethod) {
      setWithdrawError("Invalid payment method selected")
      return
    }

    setProcessing(true)

    try {
      const ok = await withdrawFund(
        agentId!,
        selectedMethod.id,
        data.amount,
        data.bankName,
        data.accountName,
        data.accountNumber,
        data.phoneNumber,
        "ETB",
        "WITHDRAWAL",
        selectedMethod.code,
        "OFFLINE",
        data.password
      )

      router.replace(ok ? `/${i18n.language}/withdraw/success?agentId=${agentId}` : `/${i18n.language}/withdraw/failure?agentId=${agentId}`)
    } finally {
      setProcessing(false)
    }
  }

  /* -----------------------------
     UI
  ------------------------------ */
  return (
    <div className="min-h-screen flex items-center p-4">
      <Card className="w-full max-w-md p-2">
        <div className="w-full max-w-md rounded-2xl shadow-lg p-4">

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Withdraw Funds</h2>
            <button onClick={() => window.Telegram?.WebApp?.close?.()}>
              <X />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {withdrawError && <p className="text-red-500 text-center">{withdrawError}</p>}

            <div>
              <Label className="mb-3">Amount</Label>
              <Input type="number" {...register("amount", { valueAsNumber: true })} 
                        className="
                          !bg-[var(--background)]
                          !text-[var(--foreground)]
                          !border-[var(--border)]
                          !placeholder:text-muted-foreground
                          !focus:ring-[var(--ring)]
                          !focus:border-[var(--ring)]
                        " />
              <p
                className={
                  balance.availableToWithdraw >= 100
                    ? "bg-green-500 border border-lg px-2 mt-2"
                    : "bg-red-500 border border-lg px-2 mt-2"
                }
              >
                የሚወጣ ገንዘብ፡ {balance.availableToWithdraw} ብር
              </p>

              {errors.amount && <p className="text-red-500 text-sm">{errors.amount.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Withdraw Method</Label>

              <label className="flex gap-2 items-center">
                <input
                  type="radio"
                  checked={mode === "REGISTERED"}
                  onChange={() => setValue("mode", "REGISTERED")}
                />
                Registered Number
              </label>

              <label className="flex gap-2 items-center">
                <input
                  type="radio"
                  checked={mode === "BANK"}
                  onChange={() => setValue("mode", "BANK")}
                />
                Bank Transfer
              </label>
            </div>

            {mode === "REGISTERED" && (
              <>
                <div>
                  <Label className="mb-3"><Phone className="inline h-4 w-4" /> Phone Number</Label>
                  <Input readOnly value={registeredPhone} className="
                          !bg-[var(--background)]
                          !text-[var(--foreground)]
                          !border-[var(--border)]
                          !placeholder:text-muted-foreground
                          !focus:ring-[var(--ring)]
                          !focus:border-[var(--ring)]
                        " />
                </div>

                <div className="space-y-2">
                  <Label>Select Payment Method</Label>
                  {filteredMethods.map(method => (
                    <label key={method.id} className="flex justify-between border p-3 rounded-xl">
                      <span className="flex gap-2 items-center">
                        <CreditCard className="h-4 w-4" />
                        {method.name}
                      </span>
                      <input
                        type="radio"
                        checked={selectedMethodId === method.id}
                        onChange={() => setValue("paymentMethodId", method.id)}
                      />
                    </label>
                  ))}
                </div>
              </>
            )}

            {mode === "BANK" && (
              hasPassword ? (
                <>
                  <Input placeholder="Bank Name" {...register("bankName")} 
                  className="
                          !bg-[var(--background)]
                          !text-[var(--foreground)]
                          !border-[var(--border)]
                          !placeholder:text-muted-foreground
                          !focus:ring-[var(--ring)]
                          !focus:border-[var(--ring)]
                        " />
                  <Input placeholder="Account Name" {...register("accountName")} className="
                          !bg-[var(--background)]
                          !text-[var(--foreground)]
                          !border-[var(--border)]
                          !placeholder:text-muted-foreground
                          !focus:ring-[var(--ring)]
                          !focus:border-[var(--ring)]
                        " />
                  <Input placeholder="Account Number" {...register("accountNumber")} className="
                          !bg-[var(--background)]
                          !text-[var(--foreground)]
                          !border-[var(--border)]
                          !placeholder:text-muted-foreground
                          !focus:ring-[var(--ring)]
                          !focus:border-[var(--ring)]
                        " />
                  <Input type="password" placeholder="Password For Verification" {...register ("password")} className="
                          !bg-[var(--background)]
                          !text-[var(--foreground)]
                          !border-[var(--border)]
                          !placeholder:text-muted-foreground
                          !focus:ring-[var(--ring)]
                          !focus:border-[var(--ring)]
                        " />

                  <p className="mt-3">Want to change your password? <Link href={`/${i18n.language}/user/update-password?agentId=${agentId}`} className="text-blue-500 underline">Change Password</Link></p>

                </>
              ) : (
                <div className="p-3 border rounded bg-yellow-500 text-[var(--foreground)]">
                  <p>You must set a password before bank withdrawal.</p>
                  <Link href={`/${i18n.language}/user/create-password?agentId=${agentId}`} className="text-blue-500 underline">
                    Create Password
                  </Link>
                </div>
              )
            )}

            <Button type="submit" disabled={processing} className="w-full">
              {processing ? "Processing..." : "Withdraw"}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}
