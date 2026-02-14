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

const bingoGame: GameModeDto = {
  gameMode: "bingo",
  title: "ቢንጎ ጨዋታ",
  description: "Classic Bingo Game - Play with friends and win big!",
  category: "bingo",
  iconsUrls: {
    url: "/bingo-icon.svg",
    url_200_200: "/bingo-icon.svg",
    url_600_600: "/bingo-icon.svg",
  },
  multiplayer: true,
  rtp: "95",
  bonusTypes: ["JACKPOT", "BONUS_ROUNDS"],
}

export function GameOptionsGrid({ gameModes, agentId }: GameOptionsGridProps) {
  const router = useRouter()
  const { setSelectedGameMode, agentGameSettings, getAgentGameSettings } = useExternalGameStore()
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  // Fetch agent game settings when component mounts
  useEffect(() => {
    if (agentId && !agentGameSettings) {
      getAgentGameSettings(agentId).catch(err => {
        console.error("Failed to fetch agent game settings:", err)
      })
    }
  }, [agentId, agentGameSettings, getAgentGameSettings])

  // Filter games based on agent's enabled game modes
  const allGames = useMemo(() => {
    // Always include bingo game
    const games = [bingoGame]
    
    // If agent game settings are loaded, filter external games
    if (agentGameSettings && agentGameSettings.gameModes) {
      const enabledGameModes = agentGameSettings.gameModes
      const filteredGames = gameModes.filter(game => 
        enabledGameModes.includes(game.gameMode)
      )
      games.push(...filteredGames)
    } else {
      // If settings not loaded yet, show all games (or show none except bingo)
      games.push(...gameModes)
    }
    
    return games
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
    <div className="pb-8">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3"
      >
        {allGames.map((game, index) => (
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
  )
}
