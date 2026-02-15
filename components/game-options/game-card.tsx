"use client"

import { GameModeDto } from "@/lib/stores/external-game-store"
import { motion } from "framer-motion"
import Image from "next/image"

interface GameCardProps {
  game: GameModeDto
  isHovered: boolean
  onSelect: (game: GameModeDto) => void
  index: number
}

export function GameCard({ game, isHovered, onSelect, index }: GameCardProps) {
  const imageUrl = game.iconsUrls.url_600_600 || game.iconsUrls.url_200_200 || game.iconsUrls.url
  const isBingo = game.gameMode === "bingo"

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative"
      title={game.title}
    >
      <div
        className="relative aspect-square overflow-hidden rounded-xl cursor-pointer border-2 border-transparent hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-300 shadow-md hover:shadow-xl bg-white dark:bg-gray-800"
        onClick={() => onSelect(game)}
      >
        {/* {isBingo && (
          <div className="absolute top-0 left-0 right-0 z-10">
            <h3 className="text-white font-bold text-sm sm:text-base text-center">
              {game.title}
            </h3>
          </div>
        )} */}
        <motion.div
          animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full relative"
        >
          <Image
            src={imageUrl}
            alt={game.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 33vw, 20vw"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = "/placeholder-game.svg"
            }}
          />
        </motion.div>
      </div>
    </motion.div>
  )
}
