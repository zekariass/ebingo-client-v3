"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { ArrowRightCircle, X } from "lucide-react"
import { useRouter } from "next/navigation"

export default function GameInstructions() {
  const router = useRouter()

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 mb-10">
      <div className="w-full max-w-2xl h-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h1 className="text-xl font-bold text-primary">Bingo Game Instructions</h1>
          <button
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
            onClick={() => router.push("/")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-gray-700 dark:text-gray-200">
          <h2 className="text-lg font-semibold">Bingo Card</h2>
          <ul className="list-disc list-inside space-y-1 text-justify">
            <li className="text-sm">Select a card from the available numbers to start the game. You can select up to two cards.</li>
            <li className="text-sm">Numbers highlighted in red indicate selections made by other players, while your selections appear in blue.</li>
            <li className="text-sm">After selecting your card, click <span className="font-semibold">Start Game</span> to enter. When the payment summary pop-up displays, click <span className="font-semibold">Confirm and Pay</span>.</li>
            <li className="text-sm">The gameplay page will load with the current game grid and your selected cards.</li>
          </ul>

          <h2 className="text-lg font-semibold">How To Play</h2>
          <ul className="list-disc list-inside space-y-1 text-justify">
            <li className="text-sm">Your selected cards appear on the right, and the number grid appears on the left.</li>
            <li className="text-sm">Once enough players join, a countdown begins.</li>
            <li className="text-sm">After the countdown, numbers (1–75) are drawn. The current number appears above your cards, and all drawn numbers are highlighted on the grid and cards.</li>
            <li className="text-sm">When you have a valid pattern, click <span className="font-semibold">Bingo</span> to claim your win.</li>
            <li className="text-sm">The first player to claim with a valid pattern wins.</li>
          </ul>

          <h2 className="text-lg font-semibold">Winning</h2>
          <ul className="list-disc list-inside space-y-1 text-justify">
            <li className="text-sm">Complete any valid pattern (row, column, diagonal, four corners, or full card) and press <span className="font-semibold">Bingo</span>.</li>
            <li className="text-sm">If two players win simultaneously, the first to click <span className="font-semibold">Bingo</span> is declared the winner.</li>
          </ul>

          <h2 className="text-lg font-semibold">Prizes</h2>
          <ul className="list-disc list-inside space-y-1 text-justify">
            <li className="text-sm">Winners receive prize money directly in their in-app wallet.</li>
            <li className="text-sm">Prize amounts depend on the number of players and entry fees, minus commission.</li>
          </ul>

          <h2 className="text-lg font-semibold">Withdraw Your Deposit</h2>
          <ul className="list-disc list-inside space-y-1 text-justify">
            <li className="text-sm">Withdraw anytime using your preferred payment method.</li>
            <li className="text-sm">To withdraw, select <span className="font-semibold">Withdraw</span> from the wallet or Telegram inline button, enter the amount, choose your payment method, and confirm.</li>
          </ul>

          <h2 className="text-lg font-semibold">Add Deposit</h2>
          <ul className="list-disc list-inside space-y-1 text-justify">
            <li className="text-sm">Add funds to your in-app wallet via your preferred payment method.</li>
            <li className="text-sm">To add funds, select <span className="font-semibold">Deposit</span>, enter the amount, select payment method, and confirm.</li>
          </ul>

          <h2 className="text-lg font-semibold">Transfer Funds</h2>
          <ul className="list-disc list-inside space-y-1 text-justify">
            <li className="text-sm">You can transfer money to another player’s in-app wallet.</li>
            <li className="text-sm">Select <span className="font-semibold">Transfer</span>, enter the recipient’s username and amount, and confirm the transfer.</li>
          </ul>

          <h2 className="text-lg font-semibold">Leaving a Game</h2>
          <ul className="list-disc list-inside space-y-1 text-justify">
            <li className="text-sm">You may leave the game before another player joins by clicking <span className="font-semibold">Leave</span>.</li>
            <li className="text-sm">If you leave at least 10 seconds before the game starts, your entry fee will be refunded.</li>
          </ul>

          {/* Action Button */}
          <Button
            className="flex items-center gap-2 mt-4 w-full justify-center"
            onClick={() => router.push("/")}
          >
            Start Playing <ArrowRightCircle className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
