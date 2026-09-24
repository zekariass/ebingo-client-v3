import { create } from "zustand"
import type {CheckoutData, CheckoutResponse, GameTransaction, PaymentMethod, PaymentOrderData, Transaction, WalletBalance } from "@/lib/types"
import i18n from "@/i18n"
import { userStore } from "./user-store"
import { ApiResponse } from "../backend/types"

interface PaymentState {
  balance: WalletBalance
  paymentMethods: PaymentMethod[]
  transactions: Transaction[]
  gameTransactions: GameTransaction[]
  loading: boolean
  hasMore: boolean
  processing: boolean
  paymentOrderData: PaymentOrderData | null
  checkoutData: CheckoutData | null
  checkoutResult: CheckoutResponse | null
  walletError: string | null
  pmError: string | null
  txnError: string | null
  gameTxnError: string | null
  gameError: String | null
  transferError: string | null
  withdrawError: string | null
  depositError: string | null

  // Actions
  resetBalance: () => void
  resetPaymentMethods: () => void
  resetTransactions: () => void
  reset: () => void
  setBalance: (balance: WalletBalance) => void
  setPaymentMethods: (methods: PaymentMethod[]) => void
  addPaymentMethod: (method: PaymentMethod) => void
  removePaymentMethod: (methodId: string) => void
  setDefaultPaymentMethod: (methodId: string) => void
  setTransactions: (transactions: Transaction[]) => void
  addTransaction: (transaction: Transaction) => void
  updateTransaction: (transactionId: string, updates: Partial<Transaction>) => void
  setLoading: (loading: boolean) => void
  setPaymentOrderData: (data: PaymentOrderData) => void
  setCheckoutData: (checkoutData: CheckoutData) => void
  setProcessing: (processing: boolean) => void
  setWalletError: (error: string | null) => void
  setTxnError: (error: string | null) => void
  setGameTxnError: (error: string | null) => void
  setPMError: (error: string | null) => void
  setTransferError: (error: string | null) => void
  setWithdrawError: (error: string | null) => void
  setDepositError: (error: string | null) => void

  // Game Txns
  resetGameTxns: () => void
  setGameTxns: (txns: GameTransaction[]) => void
  fetchGameTransactions: (agentId: number, page: number, size: number, sortBy: string, refresh: boolean) => void

  // Computed
  getDefaultPaymentMethod: () => PaymentMethod | null
  getPendingTransactions: () => Transaction[]
  getRecentTransactions: (limit?: number) => Transaction[]

  // From DB
  fetchWallet: (refresh: boolean, agentId: number) => Promise<void>
  fetchPaymentMethods: () => Promise<void>
  fetchTransactions: (agentId: number, page: number, size: number, refresh: boolean) => Promise<void>
  transferFunds: (amount: number, phone: string, agentId: number) => Promise<boolean>

  // Deposit
  addDeposit: (amount: number, paymentMethodId: number, phoneNumber: string, agentId: number) => Promise<void>
  checkout:  (paymentData: CheckoutData) => Promise<void>
  // getPendingDeposits: () => number

  
  // Withdraw
  withdrawFund: (
          agentId: number,
          paymentMethodId: number,
          amount: number,
          bankName?: string,
          accountName?: string,
          accountNumber?: string,
          phoneNumber?: string,
          currency?: string,
          txnType?: string,
          providerPaymentMethodName?: string,
          withdrawalMode?: string,
          password?: string
  ) => Promise<boolean>
}

export const usePaymentStore = create<PaymentState>()(
  // persist(
    (set, get) => ({
      balance: {
        id: 0,
        userProfileId: 0,
        agentId: 0,
        totalDeposit: 0,
        depositBalance: 0, 
        pendingBalance: 0,
        welcomeBonus: 0,
        availableWelcomeBonus: 0,
        referralBonus: 0,
        availableReferralBonus: 0,
        totalPrizeAmount: 0,
        pendingWithdrawal: 0,
        totalWithdrawal: 0,
        totalAvailableBalance: 0,
        availableToWithdraw: 0,
        lockedAmount: 0,
        depositBonus: 0,
        promotionalBonus: 0,
        lastPaymentFrom: null,
      },
      paymentMethods: [],
      transactions: [],
      gameTransactions: [],
      loading: false,
      hasMore: false,
      processing: false,
      paymentOrderData: null,
      checkoutData: null,
      checkoutResult: null,
      walletError: null,
      pmError: null,
      txnError: null,
      gameTxnError: null,
      gameError: null,
      transferError: null,
      withdrawError: null,
      depositError: null,

      // Actions
      resetBalance: () => set({ balance: {
        id: 0,
        userProfileId: 0,
        agentId: 0,
        // totalDeposit: 0,
        depositBalance: 0, 
        pendingBalance: 0,
        welcomeBonus: 0,
        availableWelcomeBonus: 0,
        referralBonus: 0,
        availableReferralBonus: 0,
        totalPrizeAmount: 0,
        pendingWithdrawal: 0,
        // totalWithdrawal: 0,
        totalAvailableBalance: 0,
        availableToWithdraw: 0,
        lockedAmount: 0,
        depositBonus: 0,
        promotionalBonus: 0,
        lastPaymentFrom: null,

      } }),
      resetPaymentMethods: () => set({ paymentMethods: [] }),
      resetTransactions: () => set({ transactions: [] }),
      reset: () => set({
        balance: {
          id: 0,
          userProfileId: 0,
          agentId: 0,
          // totalDeposit: 0,
          depositBalance: 0, 
          pendingBalance: 0,
          welcomeBonus: 0,
          availableWelcomeBonus: 0,
          referralBonus: 0,
          availableReferralBonus: 0,
          totalPrizeAmount: 0,
          pendingWithdrawal: 0,
          // totalWithdrawal: 0,
          totalAvailableBalance: 0,
          availableToWithdraw: 0,
          lockedAmount: 0,
          depositBonus: 0,
          promotionalBonus: 0,
          lastPaymentFrom: null,
        },
        paymentMethods: [],
        transactions: [],
        loading: false,
        hasMore: false,
        processing: false,
        walletError: null,
        pmError: null,
        txnError: null,
        gameTxnError: null,
        checkoutData: null,
        checkoutResult: null,
        paymentOrderData: null,
        gameError: null,
        transferError: null,
        withdrawError: null,
        depositError: null,
      }),

      setBalance: (balance) => set({ balance }),

      setPaymentMethods: (paymentMethods) => set({ paymentMethods }),

      addPaymentMethod: (method) =>
        set((state) => ({
          paymentMethods: [...state.paymentMethods, method],
        })),

    
      removePaymentMethod: (methodId) =>
        set((state) => ({
          paymentMethods: state.paymentMethods.filter((m) => m.id !== Number(methodId)),
        })),


      setDefaultPaymentMethod: (methodId) => {
        set((state) => ({
          paymentMethods: state.paymentMethods.map((m) => ({
            ...m,
            isDefault: m.id === Number(methodId),
          })),
        }))
      },

      setPaymentOrderData: (data) => {
        set({
          paymentOrderData: {...data}
        })
      },

      setCheckoutData: (data) => {
        set({checkoutData: {...data}})
      },

      setTransactions: (transactions) =>
         set(()=>({
          transactions: Array.isArray(transactions)? [...transactions] : []
         })),

      addTransaction: (transaction) =>
        set((state) => ({
          transactions: [transaction, ...state.transactions],
        })),


      updateTransaction: (transactionId, updates) =>    
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === Number(transactionId) ? { ...t, ...updates } : t
          ),
        })),  

      setLoading: (loading) => set({ loading }),
      setProcessing: (processing) => set({ processing }),
      setWalletError: (error) => set({ walletError: error }),
      setTxnError: (error) => set({ txnError: error }),
      setPMError: (error) => set({ pmError: error }),
      setGameTxnError: (error) => set({ gameTxnError: error }),
      setTransferError: (error) => set({ transferError: error }),
      setWithdrawError: (error) => {
         set({ withdrawError: error })

         setTimeout(()=>{
           set({ withdrawError: null })
         }, 5000)
      },
      setDepositError: (error) => set({ depositError: error }),
      

      // Computed getters
      getDefaultPaymentMethod: () => {
        const { paymentMethods } = get()
        return paymentMethods?.find((m) => m.isDefault) || null
      },


     getPendingTransactions: () => {
      const { transactions } = get()
      return Array.isArray(transactions)
        ? transactions.filter(t => t.status === 'PENDING' || t.status === 'AWAITING_APPROVAL')
        : []
    },



      getRecentTransactions: (limit = 10) => {
        const { transactions } = get()
        return transactions
          .sort((a, b) => b.id - a.id)
          .slice(0, limit)
      },

      resetGameTxns: () => set({
        gameTransactions: []
      }),

      setGameTxns: (gameTxns: GameTransaction[]) =>
         set({
          gameTransactions: [...gameTxns]
         }),

      // fetchGameTransactions: async (page = 1, size = 10, sortBy = "createdAt", refresh = false) => {
      //   const { gameTransactions } = get()
      //   const initData = userStore.getState().initData || ""
      //   const lang = i18n?.language || "en"

      //   if (gameTransactions.length && !refresh && page === 1) return

      //   set({ loading: true, gameTxnError: null })

      //   try {
      //     const response = await fetch(
      //       `/${lang}/api/payments/game-transactions?page=${page}&size=${size}&sortBy=${sortBy}`,
      //       {
      //         method: "GET",
      //         headers: {
      //           "Content-Type": "application/json",
      //           "x-init-data": initData,
      //         },
      //         cache: "no-store",
      //       }
      //     )

      //     const result = await response.json()

      //     if (!response.ok || !result.success) {
      //       throw new Error(result.error || "Failed to fetch transactions")
      //     }

      //     set({ gameTransactions: result.data || [], loading: false })
      //   } catch (err: any) {
      //     console.error("fetchGameTransactions error:", err)
      //     set({
      //       gameTxnError: err.message || "Error fetching game transactions",
      //       loading: false,
      //     })
      //   }
      // },


      fetchGameTransactions: async (agentId: number, page = 1, size = 10, sortBy = "createdAt", refresh = false) => {
        const { gameTransactions } = get()
        const initData = userStore.getState().initData || ""
        const lang = i18n?.language || "en"

        if (gameTransactions.length && !refresh && page === 1) return

        set({ loading: true, gameTxnError: null })

        try {
          const response = await fetch(
            `/${lang}/api/payments/game-transactions?page=${page}&size=${size}&sortBy=${sortBy}?agentId=${agentId}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                "x-init-data": initData,
              },
              cache: "no-store",
            }
          )

          const result = await response.json()

          if (!response.ok || !result.success) {
            throw new Error(result.error || "Failed to fetch transactions")
          }

          // ✅ use result.data.length to determine if there’s more data
          const hasMore = result.data?.length === size

          // ✅ store both transactions and hasMore in Zustand
          set({
            gameTransactions: result.data || [],
            hasMore,
            loading: false,
          })
        } catch (err: any) {
          console.error("fetchGameTransactions error:", err)
          set({
            gameTxnError: err.message || "Error fetching game transactions",
            loading: false,
          })
        }
      },



      // Async actions to fetch from DB
      fetchWallet: async (refresh: boolean, agentId: number) => {        
        if (!refresh && get().balance.id) return
        // const {user, initData} = userStore()

        const { user, initData } = userStore.getState()

        if (!user){
          set({ walletError: "User not logged in. Go back to telegram and reload the page", loading: false })
          return
        }
        set({ loading: true, walletError: null })

        try {
          const response = await fetch(`/${i18n.language}/api/payments/wallet?telegramId=${user?.telegramId}&agentId=${agentId}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "x-init-data": initData || "",
            },
          });
          if (!response.ok) throw new Error("Failed to fetch wallet")
          const result = await response.json()
          const {data} = result

          if(data) {
            set({ balance: { ...data }, loading: false })
          }else{
            throw new Error("No wallet data found")
          }


        } catch (error: any) {
          set({ walletError: error.message || "Error fetching wallet", loading: false })
        }
      },


      fetchPaymentMethods: async () => {
        if (get().paymentMethods.length) return
        set({ loading: true, pmError: null })
        try {
          const response = await fetch(`/${i18n.language}/api/payments/methods`)
          if (!response.ok) throw new Error("Failed to fetch payment methods")
          const result = await response.json()
          const {data} = result
          set({ paymentMethods: data, loading: false })
        } catch (error: any) {
          set({ pmError: error.message || "Error fetching payment methods", loading: false })
        }
      },


      fetchTransactions: async (agentId: number, page: number, size: number, refresh: boolean) => {
        const { transactions } = get();
        const userStoreState = userStore.getState();
        const initData = userStoreState.initData;
        const user = userStoreState.user;

        //  Avoid unnecessary reloads
        if (!refresh && transactions.length) return;

        //  Handle missing user
        if (!user) {
          set({
            txnError:
              "User not logged in. Please go back to Telegram and reload the page.",
            loading: false,
          });
          return;
        }

        set({ loading: true, txnError: null });

        try {
          //  Build URL safely
          const url = new URL(
            `/${i18n.language}/api/payments/transactions`,
            window.location.origin
          );
          url.searchParams.set("page", String(page || 1));
          url.searchParams.set("size", String(size || 10));
          url.searchParams.set("agentId", String(agentId || 0));
          url.searchParams.set("telegramId", String(user.telegramId || 0));

          //  Make request
          const response = await fetch(url.toString(), {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "x-init-data": initData ?? "",
            },
          });

          //  Gracefully handle backend non-OK responses
          let result: any;
          try {
            result = await response.json();
          } catch {
            throw new Error("Invalid response format from server");
          }

          if (!response.ok || result?.success === false) {
            throw new Error(result?.error || result?.message || "Failed to fetch transactions");
          }

          //  Ensure data is a list
          const data = Array.isArray(result?.data) ? result.data : [];

          set({
            transactions: data,
            loading: false,
            txnError: null,
          });
        } catch (error: any) {
          console.error("fetchTransactions error:", error);
          set({
            txnError: error?.message || "Error fetching transactions",
            loading: false,
          });
        }
      },


    transferFunds: async (amount: number, phone: string, agentId: number) => {
        set({ loading: true, transferError: null });

        const initData = userStore.getState().initData;
        const user = userStore.getState().user;

        if (!user) {
          set({
            transferError: "User not logged in. Please go back to Telegram and reload the page.",
            loading: false,
          });
          return false; // must return false to indicate failure
        }

        try {
          const url = new URL(`/${i18n.language}/api/payments/transfer`, window.location.origin);

          const response = await fetch(url.toString(), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-init-data": initData || "",
            },
            body: JSON.stringify({ amount, phone, agentId, userId: user.telegramId}),
          });

          if (!response.ok) {
            let errorText = "Transfer failed";
            try {
              const result = await response.json();
              errorText = result?.error || result?.message || errorText;
            } catch {
              errorText = await response.text();
            }

            set({ loading: false, transferError: errorText });
            return false;
          }

          const result = await response.json();
          const { data } = result;

          set({
            ...(data ? { transactions: data } : {}),
            loading: false,
            transferError: null,
          });

          return true; // success
        } catch (error: any) {
          console.error("Transfer failed:", error);
          set({
            transferError: error.message || "Error transferring funds",
            loading: false,
          });
          return false;
        }
      },


    addDeposit: async (amount: number, paymentMethodId: number, phoneNumber: string, agentId: number) => {
        set({ processing: true, depositError: null });
        const initData = userStore.getState().initData;
        const user = userStore.getState().user;
        if (!user){
          set({ depositError: "User not logged in. Go back to telegram and reload the page", loading: false })
          return
        }

        try {
          // const paymentMethod = get().paymentMethods.find(pm => pm.id === paymentMethodId);

          // if (paymentMethod?.name.toLowerCase().includes("bank transfer")) {
            const url = new URL(`/${i18n.language}/api/payments/deposit`, window.location.origin);

            const response = await fetch(url.toString(), {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-init-data": initData || "",
              },
              body: JSON.stringify({
                userId: user?.telegramId,
                agentId,
                amount,
                paymentMethodId,
                currency: "ETB",
                reason: "Deposit",
                txnType: "DEPOSIT",
                phoneNumber,
                metadata: {},
              }),
            });

            if (!response.ok) {
              throw new Error("Failed to create deposit");
            }

            const result = await response.json();
            const { data } = result;

            set({ paymentOrderData: {...data}, processing: false });

        } catch (error: any) {
          set({
            depositError: error.message || "Error creating deposit",
            processing: false,
          });
        }
      },


      // checkout: async (checkoutData) => {
      //   set({ processing: true, depositError: null });
      //   const initData = userStore.getState().initData;

      //   if (!checkoutData) {
      //     set({ depositError: "No checkout data found. Please start a new deposit.", processing: false });
      //     return;
      //   }

      //   try {
      //     const url = new URL(`/${i18n.language}/api/payments/deposit/checkout`, window.location.origin);

      //     const response = await fetch(url.toString(), {
      //       method: "POST",
      //       headers: {
      //         "Content-Type": "application/json",
      //         "x-init-data": initData || "",
      //       },
      //       body: JSON.stringify({...checkoutData}),
      //     });

      //     if (!response.ok) {
      //       throw new Error("Failed to complete checkout");
      //     }

      //     const result = await response.json();
      //     const { data } = result;

      //     if (result.status === 200){
      //       set({
      //         checkoutResult: {...data},
      //         processing: false,
      //         depositError: null,
      //       });
      //     }else{
      //       set({
      //         // checkoutResult: {...data},
      //         processing: false,
      //         depositError: result?.error,
      //       });
      //     }
          


      //   } catch (error: any) {
      //     console.error("Checkout error:", error);
      //     set({
      //       depositError: error.message || "Error during checkout",
      //       processing: false,
      //       checkoutResult: {
      //         message: error,
      //         data: "",
      //         details: "",
      //         statusCode: "500"

      //       }
      //     });

      //     // window.location.href = `/${i18n.language}/deposit/checkout/online-result`;
      //   }
      // },


      checkout: async (checkoutData) => {
        set({ processing: true, depositError: null });

        const initData = userStore.getState().initData;

        if (!checkoutData) {
          set({
            depositError: "No checkout data found. Please start a new deposit.",
            processing: false,
          });
          return;
        }

        try {
          const url = new URL(
            `/${i18n.language}/api/payments/deposit/checkout`,
            window.location.origin
          );

          const response = await fetch(url.toString(), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-init-data": initData || "",
            },
            body: JSON.stringify(checkoutData),
          });

          const result: ApiResponse = await response.json();

          if (!result.success) {
            set({
              processing: false,
              depositError:
                result.message || result.error || "Failed to complete checkout",
              checkoutResult: result,
            });
            return;
          }

          set({
            checkoutResult: result,
            processing: false,
            depositError: null,
          });
        } catch (error: any) {
          console.error("Checkout error:", error);
          set({
            depositError: error.message || "Unexpected error during checkout",
            processing: false,
            checkoutResult: {
              message: error.message,
              status: 500,
            },
          });
        }
      },


      // getPendingDeposits: () => {
      //   let pendingDeposits = 0.00;
      //   get().transactions.forEach(txn => {
      //     if (txn.txnType === "DEPOSIT" && (txn.status === "PENDING" || txn.status === "AWAITING_APPROVAL")){
      //       pendingDeposits += txn.txnAmount;
      //     }
      //   })

      //   return pendingDeposits
      // },

      withdrawFund: async (
        agentId: number,
        paymentMethodId: number,
        amount: number,
        bankName?: string,
        accountName?: string,
        accountNumber?: string,
        phoneNumber?: string,
        currency?: string,
        txnType?: string,
        providerPaymentMethodName?: string,
        withdrawalMode?: string,
        password?: string
      ) => {

        const initData = userStore.getState().initData;
        const user = userStore.getState().user;
        const telegramId = user?.telegramId;
        if (!initData){
          set({ processing: false, withdrawError: "User not logged in from telegram!" });
          return false
        }

        set({ processing: true, withdrawError: null });

        try {
          // Build payload dynamically based on isMobileMoney
          const payload: Record<string, any> = {
            agentId,
            telegramId,
            paymentMethodId,
            amount,
            currency,
            txnType,
            providerPaymentMethodName,

            phoneNumber,
            bankName,
            accountName,
            accountNumber,
            withdrawalMode,
            password,
          };

          const url = new URL(`/${i18n.language}/api/payments/withdraw`, window.location.origin);

          const response = await fetch(url.toString(), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-init-data": initData || ""
            },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            set({ processing: false, withdrawError: "Failed to process withdrawal" });
            return false;
          }

          const result = await response.json();
          const { data } = result;

          set({ processing: false });

          return true;

        } catch (error: any) {
          set({
            withdrawError: error.message || "Error processing withdrawal",
            processing: false,
          });
          return false; // rethrow for calling code if needed
        }
      },


    }),
    // {
    //   name: "bingo-payment-storage",
    //   partialize: (state) => ({
    //     balance: state.balance,
    //     paymentMethods: state.paymentMethods,
    //     transactions: state.transactions.slice(0, 50), // Keep only recent transactions
    //   }),
    // },
  )
// )
