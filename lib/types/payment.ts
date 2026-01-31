// export type TransactionType = "DEPOSIT" | "WITHDRAWAL" | "TRANSFER";
// export type TransactionStatus = "PENDING" | "AWAITING_APPROVAL" | "COMPLETED" | "FAILED";

// export interface Transaction {
//   id: number;
//   userProfileId: number;
//   transferTo?: number;
//   paymentMethodId: number;
//   txnType: TransactionType;
//   txnAmount: number;
//   status: TransactionStatus;
//   description?: string;
// }

// export interface PaymentMethod {
//   id: number;
//   name: string;
//   description?: string;
//   isDefault: boolean;
// }

// export interface WalletBalance {
//   id: number;
//   userProfileId: number;
//   totalDeposit: number;
//   depositBalance: number;
//   pendingBalance: number;
//   welcomeBonus: number;
//   availableWelcomeBonus: number;
//   referralBonus: number;
//   availableReferralBonus: number;
//   totalPrizeAmount: number;
//   pendingWithdrawal: number;
//   totalWithdrawal: number;
//   totalAvailableBalance: number;
//   availableToWithdraw: number;
// }

// export interface DepositRequest {
//   amount: number
//   paymentMethodId: string
// }

// export interface WithdrawalRequest {
//   amount: number
//   paymentMethodId: string
// }

// export interface PaymentProcessingResult {
//   success: boolean
//   transactionId?: string
//   error?: string
//   requiresVerification?: boolean
// }
