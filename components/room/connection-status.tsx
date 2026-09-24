// "use client"

// import { useEffect, useRef } from "react"
// // import { useWebSocketEvents } from "@/lib/hooks/websockets/use-websocket-events"
// import { AlertDescription } from "@/components/ui/alert"
// import { Badge } from "@/components/ui/badge"
// import { WifiOff } from "lucide-react"
// import { userStore } from "@/lib/stores/user-store"
// import { useRoomSocket } from "@/lib/hooks/websockets/use-room-socket"

// interface ConnectionStatusProps {
//   roomId?: number
// }

// export function ConnectionStatus({ roomId }: ConnectionStatusProps) {
//   // const { connected, connecting, reconnectAttempts, connect, reconnect } = useWebSocketEvents({
//   //   roomId,
//   //   enabled: true,
//   // })


//    const { connected, connecting, reconnectAttempts, connect, reconnect } = useRoomSocket({
//     roomId,
//     enabled: true,
//   })

//   const { initData } = userStore()
//   const reconnectTimeout = useRef<NodeJS.Timeout | null>(null)

//   // ✅ Only run once when initData is available
//   useEffect(() => {
//     if (initData && roomId) {
//       connect()
//     }
//   }, [initData, roomId, connect]) // removed connected/connecting from deps

//   // ✅ Auto-reconnect only when disconnected
//   useEffect(() => {
//     if (!connected && !connecting && roomId && initData) {
//       const delay = Math.min(1000 * Math.pow(2, (reconnectAttempts ?? 1)), 10000)

//       reconnectTimeout.current = setTimeout(() => {
//         reconnect()
//       }, delay)

//       console.log(`🔄 Auto reconnecting in ${delay / 1000}s...`)
//     }

//     return () => {
//       if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current)
//     }
//   }, [connected, connecting, reconnectAttempts, reconnect, roomId, initData])



//   if (connected) {
//     return (
//       <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
//         {/* <Wifi className="h-4 w-4 text-green-500" /> */}
//         <span className="text-green-500">Connected</span>
//       </div>
//     )
//   }

//   if (connecting) {
//     return (
//       <div className="flex items-center gap-2 text-sm">
//         <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
//         <span className="text-yellow-500">Connecting...</span>
//         {/* {reconnectAttempts > 0 && (
//           <Badge variant="outline" className="text-xs">
//             Attempt {reconnectAttempts}
//           </Badge>
//         )} */}
//       </div>
//     )
//   }

//   return (
//     <div className="flex items-center justify-center">
//       <Badge variant="destructive" className="cursor-pointer" onClick={() => reconnect()}>
//         <WifiOff className="h-4 w-4" />
//         <AlertDescription className="">
//           <div className="bg-transparent fond-bold"
//           >          
//             Retry
//           </div>
//         </AlertDescription>
//     </Badge>
//     </div>
//   )
// }



// ConnectionStatus.tsx
"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import { WifiOff } from "lucide-react"
import { useRoomSocket } from "@/lib/hooks/websockets/use-room-socket"

export function ConnectionStatus({ roomId }: { roomId?: number }) {
  const { connected, connecting, reconnectAttempts, reconnect } = useRoomSocket({ roomId, enabled: !!roomId })

  if (connected) {
    return (
      <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-green-500">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-60" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
        <span>Connected</span>
      </div>
    )
  }

  if (connecting) {
    return (
      <div className="flex items-center gap-2 text-xs sm:text-sm text-yellow-500">
        <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-yellow-500 border-t-transparent" />
        Connecting{reconnectAttempts ? ` (${reconnectAttempts})` : "..."}
      </div>
    )
  }

  return (
    <Badge variant="destructive" className="cursor-pointer gap-1" onClick={() => reconnect()}>
      <WifiOff className="h-3.5 w-3.5" />
      Retry
    </Badge>
  )
}
