// "use client"

// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import { useRoomStore } from "@/lib/stores/room-store"
// import { useWebSocketEvents } from "@/lib/hooks/websockets/use-websocket-events"
// import { Trophy, Pointer as Spinner } from "lucide-react"
// import { checkWinningPattern } from "@/lib/utils/bingo"

// interface BingoClaimButtonProps {
//   disabled: boolean
//   hasWinningCard: boolean
// }

// export function BingoClaimButton({ disabled, hasWinningCard }: BingoClaimButtonProps) {
//   const [isClaiming, setIsClaiming] = useState(false)
//   const { userCards, pattern, room } = useRoomStore()

//   const { claimBingo, connected } = useWebSocketEvents({
//     roomId: room?.id || "",
//     enabled: !!room,
//   })

//   const handleBingoClaim = async () => {
//     if (!connected) {
//       console.error("Connection Required: Please wait for connection to be established")
//       return
//     }

//     // Find the winning card
//     const winningCard = userCards.find((card) => (pattern ? checkWinningPattern(card, pattern) : false))

//     if (!winningCard || !pattern || !room) {
//       console.error("No Valid Bingo: No winning pattern found on your cards")
//       return
//     }

//     setIsClaiming(true)

//     try {
//       const success = await claimBingo({
//         roomId: room.id,
//         cardId: winningCard.id,
//         pattern,
//       })

//       if (success) {
//         console.log("Bingo Claimed! Your bingo claim is being verified...")
//       } else {
//         throw new Error("Failed to send bingo claim")
//       }
//     } catch (error) {
//       console.error("Claim Failed: Please try again")
//     } finally {
//       setIsClaiming(false)
//     }
//   }

//   return (
//     <Button
//       size="lg"
//       className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-lg py-6"
//       onClick={handleBingoClaim}
//       disabled={disabled || isClaiming || !connected}
//     >
//       {isClaiming ? (
//         <>
//           <Spinner className="h-5 w-5 mr-2" />
//           Claiming...
//         </>
//       ) : (
//         <>
//           <Trophy className="h-5 w-5 mr-2" />
//           BINGO!
//         </>
//       )}
//     </Button>
//   )
// }
