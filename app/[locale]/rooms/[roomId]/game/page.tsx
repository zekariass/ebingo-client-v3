import { GameView } from "@/components/game/game-view"

interface GamePageProps {
  params: {
    roomId: number
  }
}

export default async function GamePage({ params }: GamePageProps) {
  const { roomId } = await params
  return <GameView roomId={roomId} />
}
