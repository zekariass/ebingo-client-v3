// "use client"

// import { Card, CardContent } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Progress } from "@/components/ui/progress"
// import { useGameTimer } from "@/lib/hooks/use-game-timer"
// import { Clock, Play, Trophy, Hourglass, Clock1 } from "lucide-react"
// import { cn } from "@/lib/utils"
// import { useGameStore } from "@/lib/stores/game-store"
// import { GameStatus } from "@/lib/types"
// import { CountdownTimer } from "../common/countdown-timer"

// export function GameTimerDisplay() {
//   // const { timeRemaining, isActive, phase, progress, formatTime } = useGameTimer()
//   const {game} = useGameStore()

//   const getStatusConfig = (status: string) => {
//     switch (status) {
//       case GameStatus.READY:
//         return {
//           icon: Hourglass,
//           label: "Game waiting for more players",
//           color: "text-muted-foreground",
//           bgColor: "bg-muted",
//         }
//       case GameStatus.COUNTDOWN:
//         return {
//           icon: Clock,
//           label: "Starting In:",
//           color: "text-yellow-600 dark:text-yellow-400",
//           bgColor: "bg-yellow-100 dark:bg-yellow-900",
//         }
//       case GameStatus.PLAYING:
//         return {
//           icon: Play,
//           label: "Game In Progress",
//           color: "text-green-600 dark:text-green-400",
//           bgColor: "bg-green-100 dark:bg-green-900",
//         }
//       case GameStatus.COMPLETED:
//         return {
//           icon: Trophy,
//           label: "Game Finished",
//           color: "text-blue-600 dark:text-blue-400",
//           bgColor: "bg-blue-100 dark:bg-blue-900",
//         }
//       default:
//         return {
//           icon: Clock,
//           label: "Unknown",
//           color: "text-muted-foreground",
//           bgColor: "bg-muted",
//         }
//     }
//   }

//   const config = getStatusConfig(game.status)
//   const Icon = config.icon

//   return (
//     <Card>
//       <CardContent className="pt-6">
//         <div className="space-y-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               <Icon className={cn("h-4 w-4", config.color)} />
//               <span className="text-sm font-medium">{config.label}</span>
//             </div>
//             <Badge variant="secondary" className={cn("text-xs", config.bgColor, config.color)}>
//               {game.status}
//             </Badge>
//           </div>

//           {game.status === GameStatus.COUNTDOWN && (
//             <>
//               <div className="text-center">
//                 <CountdownTimer endTime={game.countdownEndTime}/>
//               </div>
//             </>
//           )}

//           {game.status === GameStatus.PLAYING && (
//             <div className="text-center">
//               <div className={cn("text-lg font-semibold", config.color)}>Game in Progress</div>
//               <div className="text-sm text-muted-foreground">Wait until the end of the game to choose cards</div>
//             </div>
//           )}

//           {game.status === GameStatus.COMPLETED && (
//             <div className="text-center">
//               <div className={cn("text-lg font-semibold", config.color)}>Waiting for Next Game</div>
//             </div>
//           )}
//         </div>
//       </CardContent>
//     </Card>
//   )
// }
