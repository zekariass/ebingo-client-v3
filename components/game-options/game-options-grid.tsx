"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { GameModeDto, useExternalGameStore } from "@/lib/stores/external-game-store"
import { motion } from "framer-motion"
import { GameCard } from "./game-card"

interface GameOptionsGridProps {
  gameModes: GameModeDto[]
  agentId: number | null
}

export function GameOptionsGrid({ gameModes, agentId }: GameOptionsGridProps) {
  const router = useRouter()
  const { setSelectedGameMode, agentGameSettings, getAgentGameSettings } = useExternalGameStore()
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  alert(`Agent ID: ${agentId}`)


  const bingoGame: GameModeDto = {
    gameMode: "bingo",
    title: "ቢንጎ ጨዋታ",
    description: "Classic Bingo Game - Play with friends and win big!",
    category: "bingo",
    iconsUrls: {
      url: `/icons/bingo_v${agentId}.svg`,
      url_200_200: `/icons/bingo_v${agentId}.svg`,
      url_600_600: `/icons/bingo_v${agentId}.svg`,
    },
    multiplayer: true,
    rtp: "95",
    bonusTypes: ["JACKPOT", "BONUS_ROUNDS"],
  }

  // Fetch agent game settings when component mounts
  useEffect(() => {
    if (agentId && !agentGameSettings) {
      getAgentGameSettings(agentId).catch(err => {
        console.error("Failed to fetch agent game settings:", err)
      })
    }
  }, [agentId, agentGameSettings, getAgentGameSettings])

  // Separate bingo game from external games
  const { bingoGames, externalGames } = useMemo(() => {
    const bingo = [bingoGame]
    let external: GameModeDto[] = []
    
    // If agent game settings are loaded, filter external games
    if (agentGameSettings && agentGameSettings.gameModes) {
      const enabledGameModes = agentGameSettings.gameModes
      external = gameModes.filter(game => 
        enabledGameModes.includes(game.gameMode)
      )
    } else {
      // If settings not loaded yet, show all games
      external = gameModes
    }
    
    return { bingoGames: bingo, externalGames: external }
  }, [gameModes, agentGameSettings])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 12,
      }
    },
  }

  const handleGameSelect = (game: GameModeDto) => {
    setSelectedGameMode(game)
    
    // Get current language from localStorage
    const lang = typeof window !== "undefined" 
      ? (localStorage.getItem("i18nextLng") || "en")
      : "en"
    
    if (game.gameMode === "bingo") {
      const url = agentId ? `/${lang}?agentId=${agentId}` : `/${lang}`
      router.push(url)
    } else {
      const url = agentId 
        ? `/${lang}/external-games/${game.gameMode}?agentId=${agentId}`
        : `/${lang}/external-games/${game.gameMode}`
      router.push(url)
    }
  }

  return (
    <div className="pb-8 space-y-8">
      {/* Bingo Game Section */}
      <div>
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3"
        >
          {bingoGames.map((game, index) => (
            <motion.div
              key={game.gameMode}
              variants={item}
              onHoverStart={() => setHoveredCard(game.gameMode)}
              onHoverEnd={() => setHoveredCard(null)}
            >
              <GameCard
                game={game}
                isHovered={hoveredCard === game.gameMode}
                onSelect={handleGameSelect}
                index={index}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* External Games Demo Section */}
      {externalGames.length > 0 && (
        <div>
          <div className="mb-4 p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-lg">
            <h2 className="text-lg font-bold text-amber-600 dark:text-amber-400 mb-1">
              🎮 የሙከራ (Demo) ጨዋታዎች - በቅርብ ቀን!
            </h2>
            <p className="text-sm text-muted-foreground">
             እነዚህን ጨዋታዎች ለሙከራ ይጫወቱ። በእውነተኛ ገንዘብ መጫወት በቅርቡ ይጀምራል!
            </p>
          </div>
          
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3"
          >
            {externalGames.map((game, index) => (
              <motion.div
                key={game.gameMode}
                variants={item}
                onHoverStart={() => setHoveredCard(game.gameMode)}
                onHoverEnd={() => setHoveredCard(null)}
              >
                <GameCard
                  game={game}
                  isHovered={hoveredCard === game.gameMode}
                  onSelect={handleGameSelect}
                  index={index}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}
    </div>
  )
}
