// import type {
//   PaymentMethod,
//   Transaction,
//   WalletBalance,
//   DepositRequest,
//   WithdrawalRequest,
//   PaymentProcessingResult,
// } from "@/lib/types/payment"

// const PAYMENT_API_BASE = process.env.NEXT_PUBLIC_PAYMENT_API_URL || "http://localhost:8080/api/payments"

// class PaymentApiClient {
//   private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
//     const url = `${PAYMENT_API_BASE}${endpoint}`

//     const response = await fetch(url, {
//       headers: {
//         "Content-Type": "application/json",
//         // TODO: Add authorization header when auth is implemented
//         // 'Authorization': `Bearer ${getAccessToken()}`
//       },
//       ...options,
//     })

//     if (!response.ok) {
//       throw new Error(`Payment API Error: ${response.status} ${response.statusText}`)
//     }

//     return response.json()
//   }

//   // Wallet operations
//   async getBalance(): Promise<WalletBalance> {
//     // TODO: Replace with actual API call
//     return this.mockBalance()
//   }

//   async deposit(request: DepositRequest): Promise<PaymentProcessingResult> {
//     // TODO: Replace with actual API call
//     return this.mockDeposit(request)
//   }

//   async withdraw(request: WithdrawalRequest): Promise<PaymentProcessingResult> {
//     // TODO: Replace with actual API call
//     return this.mockWithdrawal(request)
//   }

//   // Payment methods
//   async getPaymentMethods(): Promise<PaymentMethod[]> {
//     // TODO: Replace with actual API call
//     return this.mockPaymentMethods()
//   }

//   async addPaymentMethod(method: Omit<PaymentMethod, "id">): Promise<PaymentMethod> {
//     // TODO: Replace with actual API call
//     return this.mockAddPaymentMethod(method)
//   }

//   async removePaymentMethod(methodId: string): Promise<void> {
//     // TODO: Replace with actual API call
//     return this.mockRemovePaymentMethod(methodId)
//   }

//   // Transactions
//   async getTransactions(limit = 50): Promise<Transaction[]> {
//     // TODO: Replace with actual API call
//     return this.mockTransactions()
//   }

//   async getTransaction(transactionId: string): Promise<Transaction> {
//     // TODO: Replace with actual API call
//     return this.mockTransaction(transactionId)
//   }

//   // Game payments
//   async processGameEntry(roomId: string, amount: number, cardIds: number[]): Promise<PaymentProcessingResult> {
//     // TODO: Replace with actual API call
//     return this.mockGameEntry(roomId, amount, cardIds)
//   }

//   async processPrizePayout(gameId: string, playerId: string, amount: number): Promise<PaymentProcessingResult> {
//     // TODO: Replace with actual API call
//     return this.mockPrizePayout(gameId, playerId, amount)
//   }

//   // Mock implementations for development
//   private mockBalance(): WalletBalance {
//     return {
//       available: 250.75,
//       pending: 25.0,
//       total: 275.75,
//       currency: "USD",
//     }
//   }

//   private async mockDeposit(request: DepositRequest): Promise<PaymentProcessingResult> {
//     await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate processing

//     if (Math.random() > 0.1) {
//       // 90% success rate
//       return {
//         success: true,
//         transactionId: `dep_${Date.now()}`,
//       }
//     } else {
//       return {
//         success: false,
//         error: "Payment declined by bank",
//       }
//     }
//   }

//   private async mockWithdrawal(request: WithdrawalRequest): Promise<PaymentProcessingResult> {
//     await new Promise((resolve) => setTimeout(resolve, 3000)) // Simulate processing

//     if (request.amount > 1000) {
//       return {
//         success: false,
//         error: "Withdrawal amount exceeds daily limit",
//       }
//     }

//     return {
//       success: true,
//       transactionId: `wth_${Date.now()}`,
//       requiresVerification: request.amount > 500,
//     }
//   }

//   private mockPaymentMethods(): PaymentMethod[] {
//     return [
//       {
//         id: "pm_1",
//         type: "credit_card",
//         last4: "4242",
//         brand: "Visa",
//         expiryMonth: 12,
//         expiryYear: 2025,
//         isDefault: true,
//         nickname: "Personal Visa",
//       },
//       {
//         id: "pm_2",
//         type: "paypal",
//         isDefault: false,
//         nickname: "PayPal Account",
//       },
//     ]
//   }

//   private async mockAddPaymentMethod(method: Omit<PaymentMethod, "id">): Promise<PaymentMethod> {
//     await new Promise((resolve) => setTimeout(resolve, 1500))

//     return {
//       ...method,
//       id: `pm_${Date.now()}`,
//     }
//   }

//   private async mockRemovePaymentMethod(methodId: string): Promise<void> {
//     await new Promise((resolve) => setTimeout(resolve, 1000))
//   }

//   private mockTransactions(): Transaction[] {
//     return [
//       {
//         id: "txn_1",
//         type: "deposit",
//         amount: 100.0,
//         status: "completed",
//         description: "Deposit via Visa ****4242",
//         createdAt: new Date(Date.now() - 3600000).toISOString(),
//         completedAt: new Date(Date.now() - 3500000).toISOString(),
//         paymentMethodId: "pm_1",
//       },
//       {
//         id: "txn_2",
//         type: "game_entry",
//         amount: -20.0,
//         status: "completed",
//         description: "Game entry - $20 Bingo Room",
//         createdAt: new Date(Date.now() - 1800000).toISOString(),
//         completedAt: new Date(Date.now() - 1800000).toISOString(),
//         roomId: "room-20-1",
//       },
//       {
//         id: "txn_3",
//         type: "prize_payout",
//         amount: 150.0,
//         status: "completed",
//         description: "Prize payout - Winner!",
//         createdAt: new Date(Date.now() - 900000).toISOString(),
//         completedAt: new Date(Date.now() - 900000).toISOString(),
//         gameId: "game_123",
//       },
//     ]
//   }

//   private mockTransaction(transactionId: string): Transaction {
//     return {
//       id: transactionId,
//       type: "deposit",
//       amount: 50.0,
//       status: "completed",
//       description: "Mock transaction",
//       createdAt: new Date().toISOString(),
//       completedAt: new Date().toISOString(),
//     }
//   }

//   private async mockGameEntry(roomId: string, amount: number, cardIds: number[]): Promise<PaymentProcessingResult> {
//     await new Promise((resolve) => setTimeout(resolve, 1500))

//     return {
//       success: true,
//       transactionId: `game_${Date.now()}`,
//     }
//   }

//   private async mockPrizePayout(gameId: string, playerId: string, amount: number): Promise<PaymentProcessingResult> {
//     await new Promise((resolve) => setTimeout(resolve, 2000))

//     return {
//       success: true,
//       transactionId: `prize_${Date.now()}`,
//     }
//   }
// }

// export const paymentApiClient = new PaymentApiClient()
