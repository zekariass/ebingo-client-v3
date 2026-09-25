"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import {
  ArrowRightCircle,
  X,
  MousePointerClick,
  Grid3X3,
  Trophy,
  Wallet,
  DoorOpen,
  type LucideIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import "@/i18n"

function SectionTitle({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-base font-semibold">
      <Icon className="h-4 w-4 text-primary" />
      {children}
    </h2>
  )
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
        {n}
      </span>
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{children}</p>
      </div>
    </li>
  )
}

function Bullet({ children }: { children: React.ReactNode }) {
  return <li className="text-sm text-muted-foreground">{children}</li>
}

export default function GameInstructions() {
  const router = useRouter()

  const close = () => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.close()
    } else {
      router.push("/")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl bg-card text-card-foreground rounded-2xl border shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-0">
          <h1 className="text-xl font-bold">How to Play</h1>
          <button
            className="text-muted-foreground hover:text-foreground transition-colors"
            onClick={close}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-7">
          {/* Get started */}
          <section className="space-y-3">
            <SectionTitle icon={MousePointerClick}>Get started in 3 steps</SectionTitle>
            <ol className="space-y-3">
              <Step n={1} title="Pick your card">
                Select up to 2 cards from the number grid. Numbers in{" "}
                <span className="font-medium text-foreground">red</span> are taken by other
                players; <span className="font-medium text-foreground">blue</span> is yours.
              </Step>
              <Step n={2} title="Start and pay">
                Press <span className="font-semibold text-foreground">Start Game</span>, then{" "}
                <span className="font-semibold text-foreground">Confirm and Pay</span> on the
                payment summary.
              </Step>
              <Step n={3} title="Enter the game">
                Your cards appear on the right, the 75-number grid on the left.
              </Step>
            </ol>
          </section>

          {/* During the game */}
          <section className="space-y-3">
            <SectionTitle icon={Grid3X3}>During the game</SectionTitle>
            <ul className="list-disc pl-5 space-y-1.5">
              <Bullet>A countdown starts once enough players have joined.</Bullet>
              <Bullet>
                Numbers are then drawn one by one. The current call shows above your cards,
                and drawn numbers are highlighted on the grid and your cards.
              </Bullet>
              <Bullet>
                Complete the winning pattern? Press{" "}
                <span className="font-semibold text-foreground">Bingo</span> to claim your win.
              </Bullet>
            </ul>
          </section>

          {/* Winning & prizes */}
          <section className="space-y-3">
            <SectionTitle icon={Trophy}>Winning &amp; prizes</SectionTitle>
            <ul className="list-disc pl-5 space-y-1.5">
              <Bullet>
                Each room has a winning pattern (line, corners, full house, etc.). First
                player to press <span className="font-semibold text-foreground">Bingo</span>{" "}
                with a valid pattern wins.
              </Bullet>
              <Bullet>
                The prize is credited straight to your in-app wallet. Its amount depends on
                the entry fee and number of players, after commission.
              </Bullet>
            </ul>
          </section>

          {/* Wallet */}
          <section className="space-y-3">
            <SectionTitle icon={Wallet}>Your wallet</SectionTitle>
            <ul className="list-disc pl-5 space-y-1.5">
              <Bullet>
                <span className="font-medium text-foreground">Deposit</span> — tap Deposit in
                Telegram or the wallet page, enter the amount, pick a payment method, and
                confirm.
              </Bullet>
              <Bullet>
                <span className="font-medium text-foreground">Withdraw</span> — same flow:
                choose Withdraw, enter the amount and method, confirm.
              </Bullet>
              <Bullet>
                <span className="font-medium text-foreground">Transfer</span> — send funds to
                another player: choose Transfer, enter their username and the amount, confirm.
              </Bullet>
            </ul>
          </section>

          {/* Leaving */}
          <section className="space-y-3">
            <SectionTitle icon={DoorOpen}>Leaving a game</SectionTitle>
            <ul className="list-disc pl-5 space-y-1.5">
              <Bullet>
                You can leave with the{" "}
                <span className="font-semibold text-foreground">Leave</span> button before
                another player joins.
              </Bullet>
              <Bullet>
                Leave at least 10 seconds before the game starts and your entry fee is
                refunded to your wallet.
              </Bullet>
            </ul>
          </section>
        </div>

        {/* Action Button */}
        <div className="p-5 pt-0">
          <Button
            className="flex items-center gap-2 w-full justify-center"
            onClick={() => router.push("/")}
          >
            Start Playing <ArrowRightCircle className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
