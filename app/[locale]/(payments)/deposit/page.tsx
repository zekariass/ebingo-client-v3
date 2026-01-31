// 'use client'

// import { useEffect, useState } from "react"
// import { useForm } from "react-hook-form"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { z } from "zod"
// import { usePaymentStore } from "@/lib/stores/payment-store"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { X } from "lucide-react"
// import { useRouter } from "next/navigation"
// import { currency } from "@/lib/constant"
// import i18n from "@/i18n"
// import { useTelegramInit } from "@/lib/hooks/use-telegram-init"
// import { AnimatePresence, motion } from "framer-motion"
// import { CheckCircle2 } from "lucide-react"

// const depositSchema = z.object({
//   amount: z.number().min(50, `Minimum deposit is 50 ${currency}`).max(10000, `Maximum deposit is 10000 ${currency}`),
//   paymentMethodId: z.number().min(1, "Please select a payment method"),
//   depositType: z.enum(["online", "offline"]),
// })

// type DepositForm = z.infer<typeof depositSchema>

// export default function DepositPage() {
//   const router = useRouter()
//   const [isProcessing, setIsProcessing] = useState(false)
//   const { paymentMethods, addDeposit, fetchPaymentMethods, getDefaultPaymentMethod } = usePaymentStore()
//   const [filteredMethods, setFilteredMethods] = useState<typeof paymentMethods>([])
//   const [selectedMethod, setSelectedMethod] = useState<any>(null)
//   useTelegramInit()

//   const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<DepositForm>({
//     resolver: zodResolver(depositSchema),
//     defaultValues: {
//       amount: 50,
//       depositType: "online",
//       paymentMethodId: getDefaultPaymentMethod()?.id,
//     },
//   })

//   const depositType = watch("depositType")
//   const selectedAmount = watch("amount")
//   const quickAmounts = [50, 100, 200, 500]

//   useEffect(() => {
//     fetchPaymentMethods()
//   }, [fetchPaymentMethods])

//   // Update filtered payment methods when depositType changes
//   useEffect(() => {
//     if (paymentMethods.length === 0) return

//     if (depositType === "online") {
//       const onlineMethod = paymentMethods.find((m) => m.isOnline)
//       if (onlineMethod) {
//         setValue("paymentMethodId", onlineMethod.id)
//       }
//       setFilteredMethods(paymentMethods.filter((m) => m.isOnline))
//       setSelectedMethod(onlineMethod ?? null)
//     } else {
//       const offlineMethods = paymentMethods.filter((m) => !m.isOnline)
//       setFilteredMethods(offlineMethods)
//       setValue("paymentMethodId", 0)
//       setSelectedMethod(null)
//     }
//   }, [depositType, paymentMethods, setValue])

//   const handlePay = () => {
//     if (!selectedMethod) return
//     setValue("paymentMethodId", selectedMethod.id)
//     handleSubmit(onSubmit)()
//   }

//   const onSubmit = async (data: DepositForm) => {
//     setIsProcessing(true)
//     try {
//       addDeposit(data.amount, data.paymentMethodId)

//       const selectedPaymentMethod = paymentMethods.find(pm => pm.id === data.paymentMethodId)
//       // if (selectedPaymentMethod?.isOnline){
//       //   router.push(`/${i18n.language}/deposit/checkout`)
//       // }else{
//       //   router.push(`/${i18n.language}/deposit/offline-instructions`)
//       // }

//       router.push(`/${i18n.language}/${selectedPaymentMethod?.instructionUrl}`)
//     } catch (error) {
//       console.error("Deposit Failed:", error instanceof Error ? error.message : "Please try again")
//     } finally {
//       reset()
//       setIsProcessing(false)
//     }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
//       <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 relative">
//         <button
//           className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
//           onClick={() => window.Telegram?.WebApp?.close()}
//         >
//           <X className="h-5 w-5" />
//         </button>

//         <div className="flex items-center gap-2 mb-4">
//           {/* <DollarSign className="h-5 w-5" /> */}
//           <h2 className="text-xl font-bold">Deposit Funds</h2>
//         </div>

//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//           {/* Amount */}
//           <div>
//             <Label htmlFor="amount" className="pb-2">Amount</Label>
//             <Input
//               id="amount"
//               type="number"
//               step="0.01"
//               min="10"
//               max="1000"
//               {...register("amount", { valueAsNumber: true })}
//               className="text-lg font-semibold"
//             />
//             {errors.amount && <p className="text-sm text-red-600 pt-2">{errors.amount.message}</p>}

//             <div className="grid grid-cols-4 gap-2 mt-2">
//               {quickAmounts.map((amount) => (
//                 <Button
//                   key={amount}
//                   type="button"
//                   variant={selectedAmount === amount ? "destructive" : "outline"}
//                   size="sm"
//                   onClick={() => setValue("amount", amount)}
//                   className="bg-transparent"
//                 >
//                   {amount} {currency[0]}{currency[currency.length-1]}
//                 </Button>
//               ))}
//             </div>
//           </div>

//           {/* Deposit Type */}
//           <div>
//             <Label className="pb-2">Deposit Type</Label>
//             <div className="flex gap-4">
//               <label className="flex items-center gap-2">
//                 <input type="radio" value="online" {...register("depositType")} defaultChecked /> Online (Instant)
//               </label>
//               <label className="flex items-center gap-2">
//                 <input type="radio" value="offline" {...register("depositType")} /> Offline
//               </label>
//             </div>
//           </div>

//           {/* Payment Method */}
//           {depositType === "offline" && (
//             <AnimatePresence>
//               <motion.div
//                 key="offline-methods"
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0 }}
//                 transition={{ duration: 0.3 }}
//                 className="grid grid-cols-2 sm:grid-cols-3 gap-4"
//               >
//                 {filteredMethods.map((method) => (
//                   <motion.div
//                     key={method.id}
//                     whileHover={{ scale: 1.03 }}
//                     className={`cursor-pointer rounded-xl border p-4 flex flex-col items-center justify-center shadow-sm transition-all ${
//                       selectedMethod?.id === method.id
//                         ? "border-3 border-blue-500 bg-blue-50"
//                         : "border-gray-200 bg-white"
//                     }`}
//                     onClick={() => setSelectedMethod(method)}
//                   >
//                     {method.logoUrl && (
//                       <div className="relative w-24 h-24 flex items-center justify-center overflow-hidden rounded-lg">
//                         <img
//                           src={method.logoUrl}
//                           alt={method.name}
//                           className="absolute inset-0 w-full h-full object-contain"
//                         />
//                       </div>
//                     )}
//                     {selectedMethod?.id === method.id && (
//                       <CheckCircle2 className="text-blue-500 w-5 h-5 mt-1" />
//                     )}
//                   </motion.div>
//                 ))}
//               </motion.div>
//             </AnimatePresence>
//           ) 
//           // : (
//           //   <Select
//           //     value={watch("paymentMethodId")?.toString() ?? ""}
//           //     onValueChange={(value) => setValue("paymentMethodId", Number(value))}
//           //   >
//           //     <SelectTrigger>
//           //       <SelectValue placeholder="Select payment method" />
//           //     </SelectTrigger>
//           //     <SelectContent>
//           //       {filteredMethods.map((method) => (
//           //         <SelectItem key={method.id} value={method.id.toString()}>
//           //           <div className="flex items-center gap-2">
//           //             <CreditCard className="h-4 w-4" />
//           //             {method.name}
//           //           </div>
//           //         </SelectItem>
//           //       ))}
//           //     </SelectContent>
//           //   </Select>
//           // )
//           }

//           {errors.paymentMethodId && <p className="text-sm text-red-600 pt-2">{errors.paymentMethodId.message}</p>}

//           {/* Actions */}
//           <div className="flex gap-3 mt-4">
//             <Button
//               type="button"
//               variant="outline"
//               className="flex-1 bg-transparent"
//               onClick={() => router.push('/')}
//               disabled={isProcessing}
//             >
//               Cancel
//             </Button>
//             <Button
//               type="button"
//               className="flex-1"
//               disabled={!selectedMethod || isProcessing}
//               onClick={handlePay}
//             >
//               {isProcessing ? (
//                 <>
//                   <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
//                   Processing...
//                 </>
//               ) : (
//                 selectedMethod
//                   ? ` ${depositType === "online" ? "Pay Online" : "Pay with " + selectedMethod.name.toUpperCase()}`
//                   : "Select a method to pay"
//               )}
//             </Button>
//           </div>
//         </form>
//       </div>
//     </div>
//   )
// }










// ==================AFTER TEST UNCOMMENT THE ABOVE ======================================
// 'use client'

// import { useEffect, useState } from "react"
// import { useForm } from "react-hook-form"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { z } from "zod"
// import { usePaymentStore } from "@/lib/stores/payment-store"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { X } from "lucide-react"
// import { useRouter } from "next/navigation"
// import { currency } from "@/lib/constant"
// import i18n from "@/i18n"
// import { useTelegramInit } from "@/lib/hooks/use-telegram-init"
// import { AnimatePresence, motion } from "framer-motion"
// import { CheckCircle2 } from "lucide-react"

// const depositSchema = z.object({
//   amount: z.number().min(1, `Minimum deposit is 1 ${currency}`).max(20, `Maximum deposit is 20 ${currency}`),
//   paymentMethodId: z.number().min(1, "Please select a payment method"),
//   depositType: z.enum(["online", "offline"]),
// })

// type DepositForm = z.infer<typeof depositSchema>

// export default function DepositPage() {
//   const router = useRouter()
//   const [isProcessing, setIsProcessing] = useState(false)
//   const { paymentMethods, addDeposit, fetchPaymentMethods, getDefaultPaymentMethod } = usePaymentStore()
//   const [filteredMethods, setFilteredMethods] = useState<typeof paymentMethods>([])
//   const [selectedMethod, setSelectedMethod] = useState<any>(null)
//   useTelegramInit()

//   const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<DepositForm>({
//     resolver: zodResolver(depositSchema),
//     defaultValues: {
//       amount: 5,
//       depositType: "online",
//       paymentMethodId: getDefaultPaymentMethod()?.id,
//     },
//   })

//   const depositType = watch("depositType")
//   const selectedAmount = watch("amount")
//   const quickAmounts = [1, 5, 10, 20]

//   useEffect(() => {
//     fetchPaymentMethods()
//   }, [fetchPaymentMethods])

//   // Update filtered payment methods when depositType changes
//   useEffect(() => {
//     if (paymentMethods.length === 0) return

//     if (depositType === "online") {
//       const onlineMethod = paymentMethods.find((m) => m.isOnline)
//       if (onlineMethod) {
//         setValue("paymentMethodId", onlineMethod.id)
//       }
//       setFilteredMethods(paymentMethods.filter((m) => m.isOnline))
//       setSelectedMethod(onlineMethod ?? null)
//     } else {
//       const offlineMethods = paymentMethods.filter((m) => !m.isOnline)
//       setFilteredMethods(offlineMethods)
//       setValue("paymentMethodId", 0)
//       setSelectedMethod(null)
//     }
//   }, [depositType, paymentMethods, setValue])

//   const handlePay = () => {
//     if (!selectedMethod) return
//     setValue("paymentMethodId", selectedMethod.id)
//     handleSubmit(onSubmit)()
//   }

//   const onSubmit = async (data: DepositForm) => {
//     setIsProcessing(true)
//     try {
//       addDeposit(data.amount, data.paymentMethodId)

//       const selectedPaymentMethod = paymentMethods.find(pm => pm.id === data.paymentMethodId)
//       // if (selectedPaymentMethod?.isOnline){
//       //   router.push(`/${i18n.language}/deposit/checkout`)
//       // }else{
//       //   router.push(`/${i18n.language}/deposit/offline-instructions`)
//       // }

//       router.push(`/${i18n.language}/${selectedPaymentMethod?.instructionUrl}`)
//     } catch (error) {
//       console.error("Deposit Failed:", error instanceof Error ? error.message : "Please try again")
//     } finally {
//       reset()
//       setIsProcessing(false)
//     }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
//       <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 relative">
//         <button
//           className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
//           onClick={() => window.Telegram?.WebApp?.close()}
//         >
//           <X className="h-5 w-5" />
//         </button>

//         <div className="flex items-center gap-2 mb-4">
//           {/* <DollarSign className="h-5 w-5" /> */}
//           <h2 className="text-xl font-bold">Deposit Funds</h2>
//         </div>

//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//           {/* Amount */}
//           <div>
//             <Label htmlFor="amount" className="pb-2">Amount</Label>
//             <Input
//               id="amount"
//               type="number"
//               step="0.01"
//               // min="10"
//               max="1000"
//               {...register("amount", { valueAsNumber: true })}
//               className="text-lg font-semibold"
//             />
//             {errors.amount && <p className="text-sm text-red-600 pt-2">{errors.amount.message}</p>}

//             <div className="grid grid-cols-4 gap-2 mt-2">
//               {quickAmounts.map((amount) => (
//                 <Button
//                   key={amount}
//                   type="button"
//                   variant={selectedAmount === amount ? "destructive" : "outline"}
//                   size="sm"
//                   onClick={() => setValue("amount", amount)}
//                   className="bg-transparent"
//                 >
//                   {amount} {currency[0]}{currency[currency.length-1]}
//                 </Button>
//               ))}
//             </div>

//           </div>

//           {/* Deposit Type */}
//           <div>
//             <Label className="pb-2">Deposit Type</Label>
//             <div className="flex gap-4">
//               <label className="flex items-center gap-2">
//                 <input type="radio" value="online" {...register("depositType")} defaultChecked /> Online (Instant)
//               </label>
//               <label className="flex items-center gap-2">
//                 <input type="radio" value="offline" {...register("depositType")} /> Offline
//               </label>
//             </div>
//           </div>

//           {/* Payment Method */}
//           {depositType === "offline" && (
//             <AnimatePresence>
//               <motion.div
//                 key="offline-methods"
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0 }}
//                 transition={{ duration: 0.3 }}
//                 className="grid grid-cols-2 sm:grid-cols-3 gap-4"
//               >
//                 {filteredMethods.map((method) => (
//                   <motion.div
//                     key={method.id}
//                     whileHover={{ scale: 1.03 }}
//                     className={`cursor-pointer rounded-xl border p-4 flex flex-col items-center justify-center shadow-sm transition-all ${
//                       selectedMethod?.id === method.id
//                         ? "border-3 border-blue-500 bg-blue-50"
//                         : "border-gray-200 bg-white"
//                     }`}
//                     onClick={() => setSelectedMethod(method)}
//                   >
//                     {method.logoUrl && (
//                       <div className="relative w-24 h-24 flex items-center justify-center overflow-hidden rounded-lg">
//                         <img
//                           src={method.logoUrl}
//                           alt={method.name}
//                           className="absolute inset-0 w-full h-full object-contain"
//                         />
//                       </div>
//                     )}
//                     {selectedMethod?.id === method.id && (
//                       <CheckCircle2 className="text-blue-500 w-5 h-5 mt-1" />
//                     )}
//                   </motion.div>
//                 ))}
//               </motion.div>
//             </AnimatePresence>
//           ) 
          
//           }

//           {errors.paymentMethodId && <p className="text-sm text-red-600 pt-2">{errors.paymentMethodId.message}</p>}

//           {/* Actions */}
//           <div className="flex gap-3 mt-4">
//             <Button
//               type="button"
//               variant="outline"
//               className="flex-1 bg-transparent"
//               onClick={() => router.push('/')}
//               disabled={isProcessing}
//             >
//               Cancel
//             </Button>
//             <Button
//               type="button"
//               className="flex-1"
//               disabled={!selectedMethod || isProcessing}
//               onClick={handlePay}
//             >
//               {isProcessing ? (
//                 <>
//                   <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
//                   Processing...
//                 </>
//               ) : (
//                 selectedMethod
//                   ? ` ${depositType === "online" ? "Pay Online" : "Pay with " + selectedMethod.name.toUpperCase()}`
//                   : "Select a method to pay"
//               )}
//             </Button>
//           </div>
//         </form>
//       </div>
//     </div>
//   )
// }


// ==================================================================


'use client'

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { usePaymentStore } from "@/lib/stores/payment-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import { useRouter } from "next/navigation"
import { currency } from "@/lib/constant"
import i18n from "@/i18n"
import { useTelegramInit } from "@/lib/hooks/use-telegram-init"
import { AnimatePresence, motion } from "framer-motion"
import { CheckCircle2 } from "lucide-react"
import { useProcessing } from "@/lib/contexts/processing-context"

const depositSchema = z.object({
  amount: z.number().min(20, `Minimum deposit is 20 ${currency}`).max(10000, `Maximum deposit is 10000 ${currency}`),
  paymentMethodId: z.number().min(1, "Please select a payment method"),
  depositType: z.enum(["online", "offline"]),
  phoneNumber: z
    .string()
    .min(9, "Enter a valid phone number")
    .max(15, "Phone number too long")
    .regex(
      /^(?:\+2517|\+2519|2517|2519|09|07)\d{8}$/,
      "Phone number must start with +2517, +2519, 2517, 2519, 09, or 07 and be 9 digits long"
    ),
})

type DepositForm = z.infer<typeof depositSchema>

export default function DepositPage() {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const { paymentMethods, addDeposit, fetchPaymentMethods, getDefaultPaymentMethod } = usePaymentStore()
  const [filteredMethods, setFilteredMethods] = useState<typeof paymentMethods>([])
  const [selectedMethod, setSelectedMethod] = useState<any>(null)
  useTelegramInit()

  const { startProcessing, stopProcessing } = useProcessing()

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<DepositForm>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      amount: 0,
      depositType: "online",
      paymentMethodId: getDefaultPaymentMethod()?.id,
      phoneNumber: "",
    },
  })

  const depositType = watch("depositType")
  const selectedAmount = watch("amount")
  const quickAmounts = [20, 50, 100, 200, 500]

  useEffect(() => {
    fetchPaymentMethods()
  }, [fetchPaymentMethods])

  // Auto-fill phone number from Telegram user data
  useEffect(() => {
    const tgUser = window?.Telegram?.WebApp?.initDataUnsafe?.user
    if (tgUser?.phone_number) {
      setValue("phoneNumber", tgUser.phone_number)
    }
  }, [setValue])

  useEffect(() => {
    if (paymentMethods.length === 0) return

    if (depositType === "online") {
      const onlineMethod = paymentMethods.find((m) => m.isOnline)
      if (onlineMethod) setValue("paymentMethodId", onlineMethod.id)
      setFilteredMethods(paymentMethods.filter((m) => m.isOnline))
      setSelectedMethod(onlineMethod ?? null)
    } else {
      const offlineMethods = paymentMethods.filter((m) => !m.isOnline)
      setFilteredMethods(offlineMethods)
      setValue("paymentMethodId", 0)
      setSelectedMethod(null)
    }
  }, [depositType, paymentMethods, setValue])

  const handlePay = () => {
    if (!selectedMethod) return
    setValue("paymentMethodId", selectedMethod.id)
    handleSubmit(onSubmit)()
  }

  const onSubmit = async (data: DepositForm) => {
    setIsProcessing(true)
    startProcessing("Processing deposit...")
    try {
      addDeposit(data.amount, data.paymentMethodId, data.phoneNumber)
      const selectedPaymentMethod = paymentMethods.find(pm => pm.id === data.paymentMethodId)
      router.push(`/${i18n.language}/${selectedPaymentMethod?.instructionUrl}`)
    } catch (error) {
      console.error("Deposit Failed:", error instanceof Error ? error.message : "Please try again")
    } finally {
      reset()
      setIsProcessing(false)
      stopProcessing()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 relative">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
          onClick={() => window.Telegram?.WebApp?.close()}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-bold">Deposit Funds</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Phone Number Field */}
          <div>
            <Label htmlFor="phoneNumber" className="pb-2">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="text"
              placeholder="Phone Number"
              {...register("phoneNumber")}
              className="text-lg font-semibold"
            />
            {errors.phoneNumber && (
              <p className="text-sm text-red-600 pt-2">{errors.phoneNumber.message}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <Label htmlFor="amount" className="pb-2">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              max="1000"
              {...register("amount", { valueAsNumber: true })}
              className="text-lg font-semibold"
            />
            {errors.amount && <p className="text-sm text-red-600 pt-2">{errors.amount.message}</p>}

            <div className="grid grid-cols-4 gap-2 mt-2">
              {quickAmounts.map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  variant={selectedAmount === amount ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => setValue("amount", amount)}
                  className="bg-transparent"
                >
                  {amount} {currency[0]}{currency[currency.length-1]}
                </Button>
              ))}
            </div>
          </div>

          {/* Deposit Type */}
          <div>
            <Label className="pb-2">Deposit Type</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input type="radio" value="online" {...register("depositType")} defaultChecked /> Online (Instant)
              </label>
              {/* <label className="flex items-center gap-2">
                <input type="radio" value="offline" {...register("depositType")} /> Offline
              </label> */}
            </div>
          </div>

          {/* Payment Method */}
          {depositType === "offline" && (
            <AnimatePresence>
              <motion.div
                key="offline-methods"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-2 sm:grid-cols-3 gap-4"
              >
                {filteredMethods.map((method) => (
                  <motion.div
                    key={method.id}
                    whileHover={{ scale: 1.03 }}
                    className={`cursor-pointer rounded-xl border p-4 flex flex-col items-center justify-center shadow-sm transition-all ${
                      selectedMethod?.id === method.id
                        ? "border-3 border-blue-500 bg-blue-50"
                        : "border-gray-200 bg-white"
                    }`}
                    onClick={() => setSelectedMethod(method)}
                  >
                    {method.logoUrl && (
                      <div className="relative w-24 h-24 flex items-center justify-center overflow-hidden rounded-lg">
                        <img
                          src={method.logoUrl}
                          alt={method.name}
                          className="absolute inset-0 w-full h-full object-contain"
                        />
                      </div>
                    )}
                    {selectedMethod?.id === method.id && (
                      <CheckCircle2 className="text-blue-500 w-5 h-5 mt-1" />
                    )}
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}

          {errors.paymentMethodId && <p className="text-sm text-red-600 pt-2">{errors.paymentMethodId.message}</p>}

          {/* Actions */}
          <div className="flex gap-3 mt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => router.push('/')}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1"
              disabled={!selectedMethod || isProcessing}
              onClick={handlePay}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Processing...
                </>
              ) : (
                selectedMethod
                  ? `${depositType === "online" ? "Pay Online" : "Pay with " + selectedMethod.name.toUpperCase()}`
                  : "Select a method to pay"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

