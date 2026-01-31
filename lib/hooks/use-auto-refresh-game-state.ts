// "use client"

// import { useEffect } from "react"
// import { useWebSocketEvents } from "@/lib/hooks/websockets/use-websocket-events"

// export function useAutoRefreshGameState(roomId: number, intervalMs = 3000) {
//   const { connected, refreshGameState } = useWebSocketEvents({ roomId })

//   useEffect(() => {
//     if (!connected) return
    
//     const interval = setInterval(() => {
//       refreshGameState()
//     }, intervalMs)

//     return () => clearInterval(interval)
//   }, [connected, refreshGameState, intervalMs])
// }
