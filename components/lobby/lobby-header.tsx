"use client"

import { Button } from "@/components/ui/button"
import { WalletBalance } from "@/components/payment/wallet-balance"
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "@/components/ui/dialog"
import { TransactionHistory } from "@/components/payment/transaction-history"
import Link from "next/link"
import { DialogTitle } from "@radix-ui/react-dialog"
import { userStore } from "@/lib/stores/user-store"
import { UserRole } from "@/lib/types"
import { GameTransactionHistory } from "../payment/game-transaction-history"
import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  ChevronDown,
  CreditCard,
  ReceiptIcon,
  Settings,
  Wallet,
  Gamepad2,
} from "lucide-react"
import { Badge } from "../ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import i18n from "@/i18n"
import { useAgentStore } from "@/lib/stores/agent-store"

export function LobbyHeader() {
  const [walletOpen, setWalletOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [gameHistoryOpen, setGameHistoryOpen] = useState(false)

  const { activeAgentId, agentDetails, loading: agentLoading } =
    useAgentStore()
  const user = userStore((state) => state.user)

  const router = useRouter()

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-2">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center justify-between w-full">
            {/* Left side */}
            <div className="flex items-center space-x-4">
              <Link
                href={`/${i18n.language}/game-options?agentId=${activeAgentId}`}
                className="text-xl sm:text-2xl font-bold dark:text-white"
              >
                {agentLoading
                  ? "Loading..."
                  : agentDetails
                  ? agentDetails.name
                  : "Bingo Lobby"}
              </Link>
            </div>

            {/* Right side */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Badge
                    variant="outline"
                    className="
                      cursor-pointer flex items-center space-x-1
                      bg-[var(--user-menu-bg)]
                      border-[var(--user-menu-border)]
                      text-[var(--user-menu-fg)]
                    "
                  >
                    <span className="font-bold">Hi,</span>
                    <span className="font-bold">
                      {user.firstName?.split(" ")[0]}
                    </span>
                    <ChevronDown className="w-4 h-4 text-[var(--user-menu-fg)]" />
                  </Badge>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="
                    bg-[var(--user-menu-bg)]
                    border border-[var(--user-menu-border)]
                    text-[var(--user-menu-fg)]
                  "
                >
                  <DropdownMenuItem
                    onClick={() =>
                      router.push(
                        `/${i18n.language}/user/update-password?agentId=${activeAgentId}`
                      )
                    }
                    className="
                      cursor-pointer
                      focus:bg-[color-mix(in oklab, var(--user-menu-bg) 85%, white)]
                      focus:text-[var(--user-menu-fg)]
                    "
                  >
                    Change Password
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {user && (
              <>
                <Button variant="secondary" size="sm" asChild>
                  <Link
                    href={`/${i18n.language}/game-options?agentId=${activeAgentId}`}
                  >
                    <Gamepad2 className="h-4 w-4 mr-0 lg:mr-2" />
                    <span className="hidden lg:inline">Game Options</span>
                  </Link>
                </Button>

                <Dialog open={walletOpen} onOpenChange={setWalletOpen}>
                  <DialogTrigger asChild>
                    <Button variant="secondary" size="sm">
                      <Wallet className="h-4 w-4 mr-0 lg:mr-2" />
                      <span className="hidden lg:inline">Wallet</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Your Wallet</DialogTitle>
                    </DialogHeader>
                    <WalletBalance agentId={activeAgentId || 0} />
                  </DialogContent>
                </Dialog>

                <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
                  <DialogTrigger asChild>
                    <Button variant="secondary" size="sm">
                      <ReceiptIcon className="h-4 w-4 mr-0 lg:mr-2" />
                      <span className="hidden lg:inline">Transactions</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        Deposits and Withdrawals
                      </DialogTitle>
                    </DialogHeader>
                    <TransactionHistory />
                  </DialogContent>
                </Dialog>

                <Dialog
                  open={gameHistoryOpen}
                  onOpenChange={setGameHistoryOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="secondary" size="sm">
                      <CreditCard className="h-4 w-4 mr-0 lg:mr-2" />
                      <span className="hidden lg:inline">Game Payments</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        Game fees and prizes
                      </DialogTitle>
                    </DialogHeader>
                    <GameTransactionHistory />
                  </DialogContent>
                </Dialog>

                {(user?.role === UserRole.ADMIN ||
                  user?.role === UserRole.AGENT) &&
                  Number(user.agentId) === Number(activeAgentId) && (
                    <Button variant="secondary" size="sm" asChild>
                      <Link href={`/admin/rooms?agentId=${activeAgentId}`}>
                        <Settings className="h-4 w-4 mr-0 lg:mr-2" />
                        <span className="hidden lg:inline">Admin</span>
                      </Link>
                    </Button>
                  )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
