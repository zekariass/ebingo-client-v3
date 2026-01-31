// "use client"

// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Trophy, Calendar, DollarSign, Eye } from "lucide-react"
// import { useState, useEffect } from "react"

// interface GameHistoryItem {
//   id: string
//   roomName: string
//   fee: number
//   pattern: string | { name: string }
//   status: "won" | "lost" | "in-progress"
//   prize: number
//   playedAt: string
//   duration: string
//   numbersCalledCount: number
// }

// export function GameHistory() {
//   const [gameHistory, setGameHistory] = useState<GameHistoryItem[]>([])
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     // Mock data - in real app, fetch from API
//     const mockHistory: GameHistoryItem[] = [
//       {
//         id: "game-1",
//         roomName: "$50 High Stakes",
//         fee: 50,
//         pattern: "Full House",
//         status: "won",
//         prize: 250,
//         playedAt: "2024-01-15 14:30",
//         duration: "18m 45s",
//         numbersCalledCount: 42,
//       },
//       {
//         id: "game-2",
//         roomName: "$20 Standard",
//         fee: 20,
//         pattern: "Line",
//         status: "lost",
//         prize: 0,
//         playedAt: "2024-01-15 13:15",
//         duration: "12m 20s",
//         numbersCalledCount: 28,
//       },
//       {
//         id: "game-3",
//         roomName: "$10 Quick Play",
//         fee: 10,
//         pattern: "Four Corners",
//         status: "won",
//         prize: 45,
//         playedAt: "2024-01-14 19:45",
//         duration: "15m 10s",
//         numbersCalledCount: 35,
//       },
//       {
//         id: "game-4",
//         roomName: "$100 Premium",
//         fee: 100,
//         pattern: { name: "X Pattern" },
//         status: "lost",
//         prize: 0,
//         playedAt: "2024-01-14 16:20",
//         duration: "22m 30s",
//         numbersCalledCount: 48,
//       },
//     ]

//     setTimeout(() => {
//       setGameHistory(mockHistory)
//       setLoading(false)
//     }, 1000)
//   }, [])

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "won":
//         return "default"
//       case "lost":
//         return "destructive"
//       case "in-progress":
//         return "secondary"
//       default:
//         return "secondary"
//     }
//   }

//   const totalWinnings = gameHistory.filter((game) => game.status === "won").reduce((sum, game) => sum + game.prize, 0)

//   const totalSpent = gameHistory.reduce((sum, game) => sum + game.fee, 0)

//   const winRate =
//     gameHistory.length > 0
//       ? ((gameHistory.filter((game) => game.status === "won").length / gameHistory.length) * 100).toFixed(1)
//       : "0"

//   if (loading) {
//     return (
//       <div className="space-y-6">
//         <div className="animate-pulse">
//           <div className="h-8 bg-muted rounded w-48 mb-2"></div>
//           <div className="h-4 bg-muted rounded w-64"></div>
//         </div>
//         <div className="grid gap-4 md:grid-cols-3">
//           {Array.from({ length: 3 }).map((_, i) => (
//             <div key={i} className="animate-pulse">
//               <div className="h-24 bg-muted rounded"></div>
//             </div>
//           ))}
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-3xl font-bold">Game History</h1>
//         <p className="text-muted-foreground">View your past bingo games and performance</p>
//       </div>

//       {/* Summary Stats */}
//       <div className="grid gap-4 md:grid-cols-3">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Total Winnings</CardTitle>
//             <Trophy className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold text-green-600">${totalWinnings}</div>
//             <p className="text-xs text-muted-foreground">
//               {gameHistory.filter((game) => game.status === "won").length} games won
//             </p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
//             <DollarSign className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">${totalSpent}</div>
//             <p className="text-xs text-muted-foreground">{gameHistory.length} games played</p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
//             <Calendar className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{winRate}%</div>
//             <p className="text-xs text-muted-foreground">
//               Net: ${totalWinnings - totalSpent >= 0 ? "+" : ""}
//               {totalWinnings - totalSpent}
//             </p>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Game History Table */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Recent Games</CardTitle>
//           <CardDescription>Your bingo game history and results</CardDescription>
//         </CardHeader>
//         <CardContent>
//           {gameHistory.length === 0 ? (
//             <div className="text-center py-8">
//               <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
//               <h3 className="text-lg font-medium mb-2">No games played yet</h3>
//               <p className="text-muted-foreground mb-4">Start playing bingo to see your game history here</p>
//               <Button>Join a Game</Button>
//             </div>
//           ) : (
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Room</TableHead>
//                   <TableHead>Pattern</TableHead>
//                   <TableHead>Result</TableHead>
//                   <TableHead>Prize</TableHead>
//                   <TableHead>Duration</TableHead>
//                   <TableHead>Date</TableHead>
//                   <TableHead>Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {gameHistory.map((game) => (
//                   <TableRow key={game.id}>
//                     <TableCell>
//                       <div>
//                         <div className="font-medium">{game.roomName}</div>
//                         <div className="text-sm text-muted-foreground">${game.fee} entry</div>
//                       </div>
//                     </TableCell>
//                     <TableCell>
//                       {typeof game.pattern === "string" ? game.pattern : game.pattern?.name || "Unknown"}
//                     </TableCell>
//                     <TableCell>
//                       <Badge variant={getStatusColor(game.status)}>
//                         {game.status === "won" ? "Won" : game.status === "lost" ? "Lost" : "In Progress"}
//                       </Badge>
//                     </TableCell>
//                     <TableCell>
//                       <span className={game.prize > 0 ? "text-green-600 font-medium" : "text-muted-foreground"}>
//                         ${game.prize}
//                       </span>
//                     </TableCell>
//                     <TableCell>
//                       <div>
//                         <div className="text-sm">{game.duration}</div>
//                         <div className="text-xs text-muted-foreground">{game.numbersCalledCount} numbers</div>
//                       </div>
//                     </TableCell>
//                     <TableCell className="text-sm text-muted-foreground">{game.playedAt}</TableCell>
//                     <TableCell>
//                       <Button size="sm" variant="outline">
//                         <Eye className="h-4 w-4 mr-1" />
//                         View
//                       </Button>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   )
// }
