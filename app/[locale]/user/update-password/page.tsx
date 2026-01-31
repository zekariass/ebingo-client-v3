'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { userStore } from "@/lib/stores/user-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import i18n from "@/i18n"
import { useAgentStore } from "@/lib/stores/agent-store"
import { Card } from "@/components/ui/card"

// ----------------------
// Validation Schema
// ----------------------
const schema = z
  .object({
    oldPassword: z.string().min(4, "Old password must be at least 4 characters"),
    newPassword: z.string().min(4, "New password must be at least 4 characters"),
    confirmPassword: z.string().min(4, "Confirm password must match"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  })

type FormData = z.infer<typeof schema>

// ----------------------
// Component
// ----------------------
export default function UpdatePasswordPage() {
  const {activeAgentId} = useAgentStore()
  const router = useRouter()
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const user = userStore.getState().user
  const initData = userStore.getState().initData

  const onSubmit = async (data: FormData) => {
    if (!user?.telegramId) {
      setError("User data not found. Please refresh the page.")
      return
    }

    setProcessing(true)
    setError(null)

    try {
      const payload = {
        telegramId: user.telegramId,
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      }

      const response = await fetch(`/${i18n.language}/api/auth/me/update-password?agentId=${activeAgentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-init-data": initData ?? "",
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok || result.error) {
        throw new Error(result.error || "Something went wrong")
      }

      // SUCCESS
      setSuccess(true)
      reset()
    } catch (err: any) {
      console.error("Update password error:", err)
      setError(err?.message || "Something went wrong. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
      <Card className="p-4">
        <div className="w-full max-w-md rounded-2xl shadow-lg p-6">

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Update Password</h2>
              <button onClick={router.back}>
                <X className="h-5 w-5 cursor-pointer" />
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-100 text-red-700 p-2 rounded mb-4">
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="mb-4">
                <p className="text-green-500 mb-4">Password updated successfully!</p>
                <Button className="w-full" onClick={() => router.push(`/${i18n.language}?agentId=${activeAgentId}`)}>
                  Go Back
                </Button>
              </div>
            )}

            {!success && (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                  <div>
                    <Label className="mb-2">Old Password</Label>
                    <Input type="password" {...register("oldPassword")} 
                        className="
                          !bg-[var(--background)]
                          !text-[var(--foreground)]
                          !border-[var(--border)]
                          !placeholder:text-muted-foreground
                          !focus:ring-[var(--ring)]
                          !focus:border-[var(--ring)]
                        " />
                    {errors.oldPassword && (
                      <p className="text-red-500 text-sm">{errors.oldPassword.message}</p>
                    )}
                  </div>

                  <div>
                    <Label className="mb-2">New Password</Label>
                    <Input type="password" {...register("newPassword")} 
                        className="
                          !bg-[var(--background)]
                          !text-[var(--foreground)]
                          !border-[var(--border)]
                          !placeholder:text-muted-foreground
                          !focus:ring-[var(--ring)]
                          !focus:border-[var(--ring)]
                        " />
                    {errors.newPassword && (
                      <p className="text-red-500 text-sm">{errors.newPassword.message}</p>
                    )}
                  </div>

                  <div>
                    <Label className="mb-2">Confirm New Password</Label>
                    <Input type="password" {...register("confirmPassword")} 
                        className="
                          !bg-[var(--background)]
                          !text-[var(--foreground)]
                          !border-[var(--border)]
                          !placeholder:text-muted-foreground
                          !focus:ring-[var(--ring)]
                          !focus:border-[var(--ring)]
                        " />
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={processing}>
                    {processing ? "Updating..." : "Update Password"}
                  </Button>
                </form>
            )}

          </div>
        </Card>
    </div>
  )
}
