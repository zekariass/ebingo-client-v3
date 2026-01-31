"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { ArrowRightCircle, X } from "lucide-react"
import { useRouter } from "next/navigation"
import i18n from "@/i18n"

export default function GameInstructions() {
  const router = useRouter()

  i18n

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary">Game Instructions</h1>
          <button
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            onClick={() => {
              if (window.Telegram?.WebApp) {
                window.Telegram.WebApp.close();
              } else {
                router.push("/");
              }
            }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Instructions */}
        <div className="space-y-4 text-gray-700 dark:text-gray-200">
          <h2 className="text-lg font-semibold">Bingo Card</h2>
          <ul className="list-disc list-inside space-y-1 text-justify">
            <li className="text-sm">Select a card from the available numbers to start the game. You can select upto maximum of two cards.</li>
            <li className="text-sm">Numbers highlighted in red indicate selections made by other players, while your selections are indecated by blue color.</li>
            <li className="text-sm">After selecting your card, click <span className="font-semibold">Start Game</span> to enter the game. Then when the payment summary pop-up diplay, click <span className="font-semibold">Confirm and Pay</span></li>
            <li className="text-sm">Then the game play page is loaded with currently active game number grid and your selected cards.</li>
            <li className="text-sm"></li>
          </ul>

          <h2 className="text-lg font-semibold">How To Play The Game?</h2>
          <ul className="list-disc list-inside space-y-1 text-justify">
            <li className="text-sm">Your selected cards display on the right side and the number grid on the left.</li>
            <li className="text-sm">When enough players join the game, countdown starts.</li>
            <li className="text-sm">After the countdown is complete, number are drawn (called). The current called number is shown a above the player cards. In addition to that, all drawn numbers are highlighted in the corresponding column of the 75-number grid. Drawn numbers are highlighted on the player cards so that the user can easily identify and mark it.</li>
            <li className="text-sm">When you get a pattern match, click <span>Bingo</span> button to be a winner.</li>
            <li className="text-sm">A winner is identified based on the game play pattern (line, corners, full-house, etc). A player who claim first is a winner.</li>
          </ul>

          <h2 className="text-lg font-semibold">To Be A Winner</h2>
          <ul className="list-disc list-inside space-y-1 text-justify">
            <li className="text-sm">Complete a winning pattern (row, column, diagonal, four corners, or full card) and click <span className="font-semibold">Bingo</span> to win.</li>
            <li className="text-sm">If two players win simultaneously, the first to click <span className="font-semibold">Bingo</span> wins.</li>
          </ul>

          <h2 className="text-lg font-semibold">Prize</h2>
          <ul className="list-disc list-inside space-y-1 text-justify">
            <li className="text-sm">The winner will get the prize money directly credited to their in-app wallet.</li>
            <li className="text-sm">The prize amount is determined by the number of players and the entry fee, after commision is deducted.</li>
          </ul>

          <h2 className="text-lg font-semibold">Withdraw Your Deposit</h2>
          <ul className="list-disc list-inside space-y-1 text-justify">
            <li className="text-sm">You can withdraw your deposit amount anytime from your in-app wallet using your choice of payment method.</li>
            <li className="text-sm">To withdraw, select withdraw button from telegram inline button or wallet pop-up page, enter the amount and select your payment method, fill the required information and confirm the withdrawal.</li>
          </ul>

          <h2 className="text-lg font-semibold">Add A Deposit</h2>
          <ul className="list-disc list-inside space-y-1 text-justify">
            <li className="text-sm">You can add deposit to your in-app wallet using your choice of payment method.</li>
            <li className="text-sm">To add deposit, select deposit button from telegram inline button or wallet pop-up page, enter the amount and select your payment method, fill the required information and confirm the deposit.</li>
          </ul>


          <h2 className="text-lg font-semibold">Transfer Fund To Other Player</h2>
          <ul className="list-disc list-inside space-y-1 text-justify">
            <li className="text-sm">You can transfer fund from your in-app wallet to other player's wallet.</li>
            <li className="text-sm">To transfer fund, select transfer button from telegram inline button or wallet pop-up page, enter the amount and the recipient's username, fill the required information and confirm the transfer.</li>
          </ul>

          <h2 className="text-lg font-semibold">Leaving a Game</h2>
          <ul className="list-disc list-inside space-y-1 text-justify">
            <li className="text-sm">You may leave the game if another player has not joined by clicking <span className="font-semibold">Leave</span>.</li>
            <li className="text-sm">If you leave the game 10 seconds before it starts, your entry fee will be refunded to your in-app wallet.</li>
          </ul>
        </div>

        {/* Action Button */}
        <Button
          className="flex items-center gap-2 mt-4 w-full justify-center"
          onClick={() => router.push("/")}
        >
          Start Playing <ArrowRightCircle className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
