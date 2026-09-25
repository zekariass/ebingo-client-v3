// "use client"

// import { useState, useMemo, useEffect } from "react"
// import { useRouter } from "next/navigation"
// import { GameModeDto, useExternalGameStore } from "@/lib/stores/external-game-store"
// import { motion } from "framer-motion"
// import { GameCard } from "./game-card"

// interface GameOptionsGridProps {
//   gameModes: GameModeDto[]
//   agentId: number | null
// }

// export function GameOptionsGrid({ gameModes, agentId }: GameOptionsGridProps) {
//   const router = useRouter()
//   const { setSelectedGameMode, agentGameSettings, getAgentGameSettings } = useExternalGameStore()
//   const [hoveredCard, setHoveredCard] = useState<string | null>(null)

//   const bingoGame: GameModeDto = {
//     gameMode: "bingo",
//     title: "",
//     description: "Classic Bingo Game - Play with friends and win big!",
//     category: "bingo",
//     iconsUrls: {
//       url: `/icons/bingo_v${agentId}.svg`,
//       url_200_200: `/icons/bingo_v${agentId}.svg`,
//       url_600_600: `/icons/bingo_v${agentId}.svg`,
//     },
//     multiplayer: true,
//     rtp: "95",
//     bonusTypes: ["JACKPOT", "BONUS_ROUNDS"],
//   }

//   // Fetch agent game settings when component mounts
//   useEffect(() => {
//     if (agentId && !agentGameSettings) {
//       getAgentGameSettings(agentId).catch(err => {
//         console.error("Failed to fetch agent game settings:", err)
//       })
//     }
//   }, [agentId, agentGameSettings, getAgentGameSettings])

//   // Separate bingo game from external games
//   const { bingoGames, externalGames } = useMemo(() => {
//     const bingo = [bingoGame]
//     let external: GameModeDto[] = []
    
//     // If agent game settings are loaded, filter external games
//     if (agentGameSettings && agentGameSettings.gameModes) {
//       const enabledGameModes = agentGameSettings.gameModes
//       external = gameModes.filter(game => 
//         enabledGameModes.includes(game.gameMode)
//       )
//     } else {
//       // If settings not loaded yet, show all games
//       external = gameModes
//     }
    
//     return { bingoGames: bingo, externalGames: external }
//   }, [gameModes, agentGameSettings])

//   const container = {
//     hidden: { opacity: 0 },
//     show: {
//       opacity: 1,
//       transition: {
//         staggerChildren: 0.05,
//       },
//     },
//   }

//   const item = {
//     hidden: { opacity: 0, y: 20, scale: 0.9 },
//     show: { 
//       opacity: 1, 
//       y: 0, 
//       scale: 1,
//       transition: {
//         type: "spring" as const,
//         stiffness: 100,
//         damping: 12,
//       }
//     },
//   }

//   const handleGameSelect = (game: GameModeDto) => {
//     setSelectedGameMode(game)
    
//     // Get current language from localStorage
//     const lang = typeof window !== "undefined" 
//       ? (localStorage.getItem("i18nextLng") || "en")
//       : "en"
    
//     if (game.gameMode === "bingo") {
//       const url = agentId ? `/${lang}?agentId=${agentId}` : `/${lang}`
//       router.push(url)
//     } else {
//       const url = agentId 
//         ? `/${lang}/external-games/${game.gameMode}?agentId=${agentId}`
//         : `/${lang}/external-games/${game.gameMode}`
//       router.push(url)
//     }
//   }

//   return (
//     <div className="pb-8 space-y-8">
//       {/* Bingo Game Section */}
//       <div>
//         <motion.div
//           variants={container}
//           initial="hidden"
//           animate="show"
//           className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3"
//         >
//           {bingoGames.map((game, index) => (
//             <motion.div
//               key={game.gameMode}
//               variants={item}
//               onHoverStart={() => setHoveredCard(game.gameMode)}
//               onHoverEnd={() => setHoveredCard(null)}
//             >
//               <GameCard
//                 game={game}
//                 isHovered={hoveredCard === game.gameMode}
//                 onSelect={handleGameSelect}
//                 index={index}
//               />
//             </motion.div>
//           ))}
//         </motion.div>
//       </div>

//       {/* External Games Demo Section */}
//       {externalGames.length > 0 && (
//         <div>
//           {/* <div className="mb-4 p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-lg">
//             <h2 className="text-lg font-bold text-amber-600 dark:text-amber-400 mb-1">
//               🎮 የሙከራ (Demo) ጨዋታዎች - በቅርብ ቀን!
//             </h2>
//             <p className="text-sm text-muted-foreground">
//              👇 ከዚህ በታች ያሉትን ጨዋታዎች ለሙከራ ይጫወቱ። በትክክለኛ ገንዘብ መጫወት በቅርቡ ይጀምራል!
//             </p>
//           </div> */}

//           <div className="mb-4 p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-lg">
//             <h2 className="text-lg font-bold text-amber-600 dark:text-amber-400 mb-1">
//              Enjoy Our New Games!
//             </h2>
//           </div>
          
//           <motion.div
//             variants={container}
//             initial="hidden"
//             animate="show"
//             className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3"
//           >
//             {externalGames.map((game, index) => (
//               <motion.div
//                 key={game.gameMode}
//                 variants={item}
//                 onHoverStart={() => setHoveredCard(game.gameMode)}
//                 onHoverEnd={() => setHoveredCard(null)}
//               >
//                 <GameCard
//                   game={game}
//                   isHovered={hoveredCard === game.gameMode}
//                   onSelect={handleGameSelect}
//                   index={index}
//                 />
//               </motion.div>
//             ))}
//           </motion.div>
//         </div>
//       )}
//     </div>
//   )
// }


// "use client"

// import { useState, useMemo, useEffect } from "react"
// import { useRouter } from "next/navigation"
// import { GameModeDto, useExternalGameStore } from "@/lib/stores/external-game-store"
// import { motion } from "framer-motion"
// import { GameCard } from "./game-card"

// interface GameOptionsGridProps {
//   gameModes: GameModeDto[]
//   agentId: number | null
// }

// export function GameOptionsGrid({ gameModes, agentId }: GameOptionsGridProps) {
//   const router = useRouter()
//   const { setSelectedGameMode, agentGameSettings, getAgentGameSettings } = useExternalGameStore()
//   const [hoveredCard, setHoveredCard] = useState<string | null>(null)

//   const bingoGame: GameModeDto = {
//     gameMode: "bingo",
//     title: "",
//     description: "Classic Bingo Game - Play with friends and win big!",
//     category: "bingo",
//     iconsUrls: {
//       url: `/icons/bingo_v${agentId}.svg`,
//       url_200_200: `/icons/bingo_v${agentId}.svg`,
//       url_600_600: `/icons/bingo_v${agentId}.svg`,
//     },
//     multiplayer: true,
//     rtp: "95",
//     bonusTypes: ["JACKPOT", "BONUS_ROUNDS"],
//   }

//   // Fetch agent game settings when component mounts
//   useEffect(() => {
//     if (agentId && !agentGameSettings) {
//       getAgentGameSettings(agentId).catch(err => {
//         console.error("Failed to fetch agent game settings:", err)
//       })
//     }
//   }, [agentId, agentGameSettings, getAgentGameSettings])

//   // Merge bingo + external games (bingo always first)
//   const allGames = useMemo(() => {
//     let external: GameModeDto[] = []

//     if (agentGameSettings?.gameModes) {
//       external = gameModes.filter(game =>
//         agentGameSettings.gameModes.includes(game.gameMode)
//       )
//     } else {
//       external = gameModes
//     }

//     // Remove any accidental duplicate bingo
//     const filteredExternal = external.filter(game => game.gameMode !== "bingo")

//     return [bingoGame, ...filteredExternal]
//   }, [gameModes, agentGameSettings])

//   const container = {
//     hidden: { opacity: 0 },
//     show: {
//       opacity: 1,
//       transition: {
//         staggerChildren: 0.05,
//       },
//     },
//   }

//   const item = {
//     hidden: { opacity: 0, y: 20, scale: 0.9 },
//     show: { 
//       opacity: 1, 
//       y: 0, 
//       scale: 1,
//       transition: {
//         type: "spring" as const,
//         stiffness: 100,
//         damping: 12,
//       }
//     },
//   }

//   const handleGameSelect = (game: GameModeDto) => {
//     setSelectedGameMode(game)
    
//     const lang = typeof window !== "undefined" 
//       ? (localStorage.getItem("i18nextLng") || "en")
//       : "en"
    
//     if (game.gameMode === "bingo") {
//       const url = agentId ? `/${lang}?agentId=${agentId}` : `/${lang}`
//       router.push(url)
//     } else {
//       const url = agentId 
//         ? `/${lang}/external-games/${game.gameMode}?agentId=${agentId}`
//         : `/${lang}/external-games/${game.gameMode}`
//       router.push(url)
//     }
//   }

//   return (
//     <div className="pb-8 space-y-8">
      
//       <motion.div
//         variants={container}
//         initial="hidden"
//         animate="show"
//         className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3"
//       >
//         {allGames.map((game, index) => (
//           <motion.div
//             key={game.gameMode}
//             variants={item}
//             onHoverStart={() => setHoveredCard(game.gameMode)}
//             onHoverEnd={() => setHoveredCard(null)}
//           >
//             <GameCard
//               game={game}
//               isHovered={hoveredCard === game.gameMode}
//               onSelect={handleGameSelect}
//               index={index}
//             />
//           </motion.div>
//         ))}
//       </motion.div>
//     </div>
//   )
// }

// ======================================================
// "use client"

// import { useState, useMemo, useEffect, useRef } from "react"
// import { useRouter } from "next/navigation"
// import { GameModeDto, useExternalGameStore } from "@/lib/stores/external-game-store"
// import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
// import { GameCard } from "./game-card"

// interface GameOptionsGridProps {
//   gameModes: GameModeDto[]
//   agentId: number | null
// }

// /* ─────────────────────────────────────────────
//    Floating particle orb – pure CSS-in-JS effect
// ───────────────────────────────────────────── */
// function Orb({ style }: { style: React.CSSProperties }) {
//   return (
//     <div
//       aria-hidden
//       style={{
//         position: "absolute",
//         borderRadius: "50%",
//         filter: "blur(80px)",
//         pointerEvents: "none",
//         ...style,
//       }}
//     />
//   )
// }

// /* ─────────────────────────────────────────────
//    Shimmer text badge for section label
// ───────────────────────────────────────────── */
// function ShimmerBadge({ children }: { children: React.ReactNode }) {
//   return (
//     <span
//       style={{
//         display: "inline-flex",
//         alignItems: "center",
//         gap: "6px",
//         padding: "4px 14px",
//         borderRadius: "999px",
//         border: "1px solid rgba(255,210,80,0.3)",
//         background: "rgba(255,210,80,0.08)",
//         fontSize: "11px",
//         fontFamily: "'Rajdhani', sans-serif",
//         fontWeight: 700,
//         letterSpacing: "0.18em",
//         textTransform: "uppercase",
//         color: "#ffd250",
//         position: "relative",
//         overflow: "hidden",
//       }}
//     >
//       <span
//         aria-hidden
//         style={{
//           position: "absolute",
//           inset: 0,
//           background:
//             "linear-gradient(90deg, transparent 0%, rgba(255,210,80,0.25) 50%, transparent 100%)",
//           animation: "shimmerSlide 2.4s linear infinite",
//         }}
//       />
//       {children}
//     </span>
//   )
// }

// /* ─────────────────────────────────────────────
//    Main component
// ───────────────────────────────────────────── */
// export function GameOptionsGrid({ gameModes, agentId }: GameOptionsGridProps) {
//   const router = useRouter()
//   const { setSelectedGameMode, agentGameSettings, getAgentGameSettings } =
//     useExternalGameStore()
//   const [hoveredCard, setHoveredCard] = useState<string | null>(null)
//   const [selectedCard, setSelectedCard] = useState<string | null>(null)
//   const containerRef = useRef<HTMLDivElement>(null)

//   const bingoGame: GameModeDto = {
//     gameMode: "bingo",
//     title: "",
//     description: "Classic Bingo Game - Play with friends and win big!",
//     category: "bingo",
//     iconsUrls: {
//       url: `/icons/bingo_v${agentId}.svg`,
//       url_200_200: `/icons/bingo_v${agentId}.svg`,
//       url_600_600: `/icons/bingo_v${agentId}.svg`,
//     },
//     multiplayer: true,
//     rtp: "95",
//     bonusTypes: ["JACKPOT", "BONUS_ROUNDS"],
//   }

//   useEffect(() => {
//     if (agentId && !agentGameSettings) {
//       getAgentGameSettings(agentId).catch((err) => {
//         console.error("Failed to fetch agent game settings:", err)
//       })
//     }
//   }, [agentId, agentGameSettings, getAgentGameSettings])

//   const allGames = useMemo(() => {
//     let external: GameModeDto[] = []
//     if (agentGameSettings?.gameModes) {
//       external = gameModes.filter((game) =>
//         agentGameSettings.gameModes.includes(game.gameMode)
//       )
//     } else {
//       external = gameModes
//     }
//     const filteredExternal = external.filter((game) => game.gameMode !== "bingo")
//     return [bingoGame, ...filteredExternal]
//   }, [gameModes, agentGameSettings])

//   const handleGameSelect = (game: GameModeDto) => {
//     setSelectedCard(game.gameMode)
//     setSelectedGameMode(game)
//     const lang =
//       typeof window !== "undefined"
//         ? localStorage.getItem("i18nextLng") || "en"
//         : "en"

//     setTimeout(() => {
//       if (game.gameMode === "bingo") {
//         router.push(agentId ? `/${lang}?agentId=${agentId}` : `/${lang}`)
//       } else {
//         router.push(
//           agentId
//             ? `/${lang}/external-games/${game.gameMode}?agentId=${agentId}`
//             : `/${lang}/external-games/${game.gameMode}`
//         )
//       }
//     }, 340)
//   }

//   /* Animation variants */
//   const containerVariants = {
//     hidden: { opacity: 0 },
//     show: {
//       opacity: 1,
//       transition: { staggerChildren: 0.055, delayChildren: 0.1 },
//     },
//   }

//   const cardVariants = {
//     hidden: { opacity: 0, y: 32, scale: 0.88, rotateX: 8 },
//     show: {
//       opacity: 1,
//       y: 0,
//       scale: 1,
//       rotateX: 0,
//       transition: { type: "spring" as const, stiffness: 120, damping: 14 },
//     },
//   }

//   return (
//     <>
//       {/* ── Inject keyframes globally ── */}
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Outfit:wght@300;400;500&display=swap');

//         @keyframes shimmerSlide {
//           0%   { transform: translateX(-100%); }
//           100% { transform: translateX(200%); }
//         }
//         @keyframes pulse-ring {
//           0%   { transform: scale(1);   opacity: 0.6; }
//           100% { transform: scale(1.7); opacity: 0; }
//         }
//         @keyframes floatOrb1 {
//           0%, 100% { transform: translate(0, 0) scale(1); }
//           50%       { transform: translate(40px, -30px) scale(1.08); }
//         }
//         @keyframes floatOrb2 {
//           0%, 100% { transform: translate(0, 0) scale(1); }
//           50%       { transform: translate(-35px, 25px) scale(1.05); }
//         }
//         @keyframes scanline {
//           0%   { transform: translateY(-100%); }
//           100% { transform: translateY(200vh); }
//         }

//         .game-card-wrap {
//           perspective: 900px;
//         }
//         .game-card-inner {
//           transition: transform 0.22s cubic-bezier(0.25, 0.46, 0.45, 0.94),
//                       box-shadow 0.22s ease;
//           transform-style: preserve-3d;
//           border-radius: 14px;
//           position: relative;
//           cursor: pointer;
//           overflow: hidden;
//         }
//         .game-card-inner:hover {
//           transform: translateY(-6px) scale(1.04) rotateX(3deg);
//         }
//         .game-card-inner::before {
//           content: '';
//           position: absolute;
//           inset: 0;
//           border-radius: 14px;
//           background: linear-gradient(
//             135deg,
//             rgba(255,255,255,0.08) 0%,
//             transparent 60%
//           );
//           pointer-events: none;
//           z-index: 2;
//         }
//         .game-card-inner.is-hovered::after {
//           content: '';
//           position: absolute;
//           inset: -1px;
//           border-radius: 15px;
//           background: linear-gradient(135deg, #ffd250, #ff6b35, #a855f7);
//           z-index: -1;
//           animation: none;
//         }
//         .glow-dot {
//           width: 6px; height: 6px;
//           background: #4ade80;
//           border-radius: 50%;
//           box-shadow: 0 0 6px #4ade80, 0 0 14px #4ade80;
//           position: relative;
//         }
//         .glow-dot::after {
//           content: '';
//           position: absolute;
//           inset: -3px;
//           border-radius: 50%;
//           background: rgba(74,222,128,0.3);
//           animation: pulse-ring 1.6s ease-out infinite;
//         }
//       `}</style>

//       <div
//         ref={containerRef}
//         style={{
//           position: "relative",
//           paddingBottom: "48px",
//           overflow: "hidden",
//         }}
//       >
//         {/* ── Ambient orbs ── */}
//         <Orb
//           style={{
//             width: 420,
//             height: 420,
//             top: -120,
//             left: -80,
//             background: "radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 70%)",
//             animation: "floatOrb1 9s ease-in-out infinite",
//           }}
//         />
//         <Orb
//           style={{
//             width: 360,
//             height: 360,
//             top: 60,
//             right: -60,
//             background: "radial-gradient(circle, rgba(255,107,53,0.14) 0%, transparent 70%)",
//             animation: "floatOrb2 11s ease-in-out infinite",
//           }}
//         />
//         <Orb
//           style={{
//             width: 300,
//             height: 300,
//             bottom: 0,
//             left: "40%",
//             background: "radial-gradient(circle, rgba(255,210,80,0.1) 0%, transparent 70%)",
//             animation: "floatOrb1 13s ease-in-out infinite reverse",
//           }}
//         />

//         {/* ── Section header ── */}
//         <motion.div
//           initial={{ opacity: 0, y: -16 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.55, ease: "easeOut" }}
//           style={{
//             display: "flex",
//             alignItems: "center",
//             gap: "16px",
//             marginBottom: "28px",
//             position: "relative",
//           }}
//         >
//           <ShimmerBadge>
//             <span className="glow-dot" />
//             Live Now
//           </ShimmerBadge>

//           <div
//             style={{
//               flex: 1,
//               height: "1px",
//               background:
//                 "linear-gradient(90deg, rgba(255,210,80,0.4) 0%, rgba(255,210,80,0.05) 100%)",
//             }}
//           />

//           <span
//             style={{
//               fontFamily: "'Outfit', sans-serif",
//               fontSize: "13px",
//               color: "rgba(255,255,255,0.35)",
//               fontWeight: 400,
//             }}
//           >
//             {allGames.length} games
//           </span>
//         </motion.div>

//         {/* ── Game grid ── */}
//         <motion.div
//           variants={containerVariants}
//           initial="hidden"
//           animate="show"
//           style={{
//             display: "grid",
//             gridTemplateColumns: "repeat(3, 1fr)",
//             gap: "12px",
//           }}
//           className="sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6"
//         >
//           {allGames.map((game, index) => {
//             const isHovered = hoveredCard === game.gameMode
//             const isSelected = selectedCard === game.gameMode
//             const isBingo = game.gameMode === "bingo"

//             return (
//               <motion.div
//                 key={game.gameMode}
//                 variants={cardVariants}
//                 className="game-card-wrap"
//                 onHoverStart={() => setHoveredCard(game.gameMode)}
//                 onHoverEnd={() => setHoveredCard(null)}
//                 onClick={() => handleGameSelect(game)}
//               >
//                 {/* Glow border on hover via wrapper */}
//                 <motion.div
//                   className={`game-card-inner ${isHovered ? "is-hovered" : ""}`}
//                   animate={
//                     isSelected
//                       ? { scale: 0.94, opacity: 0.7 }
//                       : isHovered
//                       ? { boxShadow: "0 0 28px rgba(255,210,80,0.35), 0 8px 32px rgba(0,0,0,0.6)" }
//                       : { boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }
//                   }
//                   transition={{ duration: 0.18 }}
//                   style={{
//                     background: isBingo
//                       ? "linear-gradient(145deg, rgba(255,210,80,0.12) 0%, rgba(168,85,247,0.1) 100%)"
//                       : "rgba(255,255,255,0.04)",
//                     border: isBingo
//                       ? "1px solid rgba(255,210,80,0.28)"
//                       : "1px solid rgba(255,255,255,0.07)",
//                     backdropFilter: "blur(12px)",
//                   }}
//                 >
//                   {/* Featured star badge for bingo */}
//                   {isBingo && (
//                     <motion.div
//                       initial={{ opacity: 0, scale: 0 }}
//                       animate={{ opacity: 1, scale: 1 }}
//                       transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
//                       style={{
//                         position: "absolute",
//                         top: 7,
//                         right: 7,
//                         zIndex: 10,
//                         background: "linear-gradient(135deg, #ffd250, #ff9500)",
//                         borderRadius: "4px",
//                         padding: "2px 6px",
//                         fontSize: "8px",
//                         fontFamily: "'Rajdhani', sans-serif",
//                         fontWeight: 700,
//                         letterSpacing: "0.1em",
//                         color: "#1a0a00",
//                       }}
//                     >
//                       ★ FEATURED
//                     </motion.div>
//                   )}

//                   {/* Hover shimmer sweep */}
//                   <AnimatePresence>
//                     {isHovered && (
//                       <motion.div
//                         key="sweep"
//                         initial={{ x: "-100%", opacity: 0.6 }}
//                         animate={{ x: "200%", opacity: 0 }}
//                         exit={{ opacity: 0 }}
//                         transition={{ duration: 0.55, ease: "easeOut" }}
//                         style={{
//                           position: "absolute",
//                           inset: 0,
//                           background:
//                             "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.14) 50%, transparent 70%)",
//                           zIndex: 5,
//                           pointerEvents: "none",
//                         }}
//                       />
//                     )}
//                   </AnimatePresence>

//                   {/* Selection flash */}
//                   <AnimatePresence>
//                     {isSelected && (
//                       <motion.div
//                         key="flash"
//                         initial={{ opacity: 0.8 }}
//                         animate={{ opacity: 0 }}
//                         transition={{ duration: 0.35 }}
//                         style={{
//                           position: "absolute",
//                           inset: 0,
//                           background: "rgba(255,210,80,0.25)",
//                           borderRadius: "14px",
//                           zIndex: 20,
//                           pointerEvents: "none",
//                         }}
//                       />
//                     )}
//                   </AnimatePresence>

//                   <GameCard
//                     game={game}
//                     isHovered={isHovered}
//                     onSelect={handleGameSelect}
//                     index={index}
//                   />
//                 </motion.div>
//               </motion.div>
//             )
//           })}
//         </motion.div>
//       </div>
//     </>
//   )
// }


// ==============================================


"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { GameModeDto, useExternalGameStore } from "@/lib/stores/external-game-store"
import { motion, AnimatePresence, useInView } from "framer-motion"
import { GameCard } from "./game-card"

/* ─────────────────────────────────────────
   Constants
───────────────────────────────────────── */
const FEATURED_ORDER = [
  "bingo",
  "chicken-road",
  "aviafly",
  "chicken-road-two",
  "plinko",
  "roulette",
]

const HOT_GAMES = new Set([
  "fish-road-v1",
  "fish-boom",
  "penalty-unlimited",
  "chicken-road-bonus",
  "chicken-coin",
  "chicken-banana",
  "chicken-shoot",
  "chicken-road-two-bonus",
  "mine-slot-two",
  "jumper",
  "twist-san-quentin",
])

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
interface GameOptionsGridProps {
  gameModes: GameModeDto[]
  agentId: number | null
}

/* ─────────────────────────────────────────
   Section header component
───────────────────────────────────────── */
function SectionHeader({
  icon,
  label,
  count,
  accent,
  delay = 0,
}: {
  icon: string
  label: string
  count: number
  accent: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "18px",
      }}
    >
      <span style={{ fontSize: "22px", lineHeight: 1 }}>{icon}</span>
      <span
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 700,
          fontSize: "20px",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: accent,
          textShadow: `0 0 20px color-mix(in oklab, ${accent} 53%, transparent)`,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: "12px",
          fontWeight: 600,
          letterSpacing: "0.1em",
          color: "color-mix(in oklab, var(--ink) 45%, transparent)",
          background: "color-mix(in oklab, var(--ink) 6%, transparent)",
          border: "1px solid color-mix(in oklab, var(--ink) 12%, transparent)",
          borderRadius: "999px",
          padding: "2px 10px",
        }}
      >
        {count}
      </span>
      <div
        style={{
          flex: 1,
          height: "1px",
          background: `linear-gradient(90deg, color-mix(in oklab, ${accent} 33%, transparent) 0%, transparent 100%)`,
        }}
      />
    </motion.div>
  )
}

/* ─────────────────────────────────────────
   Single game tile
───────────────────────────────────────── */
function GameTile({
  game,
  index,
  isFeatured,
  isHot,
  onSelect,
  delay,
}: {
  game: GameModeDto
  index: number
  isFeatured?: boolean
  isHot?: boolean
  onSelect: (game: GameModeDto) => void
  delay: number
}) {
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)
  const isBingo = game.gameMode === "bingo"

  const handleClick = () => {
    setClicked(true)
    setTimeout(() => onSelect(game), 300)
  }

  const accentColor = isBingo
    ? "var(--signal)"
    : isFeatured
    ? "var(--voice)"
    : isHot
    ? "var(--taken)"
    : "color-mix(in oklab, var(--ink) 50%, transparent)"

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.88 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring" as const, stiffness: 130, damping: 15, delay }}
      style={{ perspective: "800px" }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={handleClick}
    >
      <motion.div
        animate={
          clicked
            ? { scale: 0.9, opacity: 0.5 }
            : hovered
            ? { y: -6, scale: 1.05 }
            : { y: 0, scale: 1 }
        }
        transition={{ duration: 0.18 }}
        style={{
          position: "relative",
          borderRadius: "14px",
          cursor: "pointer",
          overflow: "hidden",
          background: isBingo
            ? "linear-gradient(145deg, color-mix(in oklab, var(--brand) 14%, transparent) 0%, color-mix(in oklab, var(--signal) 13%, transparent) 100%)"
            : isFeatured
            ? "linear-gradient(145deg, color-mix(in oklab, var(--voice) 10%, transparent) 0%, color-mix(in oklab, var(--brand) 7%, transparent) 100%)"
            : isHot
            ? "linear-gradient(145deg, color-mix(in oklab, var(--taken) 10%, transparent) 0%, color-mix(in oklab, var(--danger) 7%, transparent) 100%)"
            : "color-mix(in oklab, var(--ink) 4%, transparent)",
          border: `1px solid ${hovered ? `color-mix(in oklab, ${accentColor} 33%, transparent)` : "var(--line)"}`,
          boxShadow: hovered
            ? `0 0 24px color-mix(in oklab, ${accentColor} 20%, transparent), 0 8px 28px rgba(0,0,0,0.5)`
            : "0 2px 12px rgba(0,0,0,0.35)",
          transition: "border-color 0.2s, box-shadow 0.2s",
        }}
      >
        {/* Shimmer sweep on hover */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              key="sweep"
              initial={{ x: "-100%", opacity: 0.7 }}
              animate={{ x: "200%", opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.12) 50%, transparent 70%)",
                zIndex: 5,
                pointerEvents: "none",
              }}
            />
          )}
        </AnimatePresence>

        {/* Click flash */}
        <AnimatePresence>
          {clicked && (
            <motion.div
              key="flash"
              initial={{ opacity: 0.7 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                position: "absolute",
                inset: 0,
                background: `color-mix(in oklab, ${accentColor} 27%, transparent)`,
                borderRadius: "14px",
                zIndex: 20,
                pointerEvents: "none",
              }}
            />
          )}
        </AnimatePresence>

        {/* Badge */}
        {(isBingo || isFeatured || isHot) && (
          <div
            style={{
              position: "absolute",
              top: 7,
              right: 3,
              zIndex: 10,
              background: isBingo
                ? "linear-gradient(135deg, var(--signal), var(--brand))"
                : isFeatured
                ? "linear-gradient(135deg, var(--voice), var(--key))"
                : "linear-gradient(135deg, var(--taken), var(--danger))",
              borderRadius: "5px",
              padding: "2px 5px",
              fontSize: "7.5px",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              letterSpacing: "0.12em",
              color: isBingo ? "var(--on-signal)" : "#fff",
            }}
          >
            {isFeatured ? "✦ TOP" : "🔥 HOT"}
          </div>
        )}

        {/* Game card content */}
        <GameCard
          game={game}
          isHovered={hovered}
          onSelect={() => {}}
          index={index}
        />
      </motion.div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────
   Scroll-reveal section wrapper
───────────────────────────────────────── */
function Section({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "0px 0px -40px 0px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, ease: "easeOut" }}
      style={{ marginBottom: "28px" }}
    >
      {children}
    </motion.div>
  )
}

/* ─────────────────────────────────────────
   Divider
───────────────────────────────────────── */
function Divider({ delay }: { delay: number }) {
  return (
    <motion.div
      initial={{ scaleX: 0, opacity: 0 }}
      animate={{ scaleX: 1, opacity: 1 }}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
      style={{
        height: "1px",
        background:
          "linear-gradient(90deg, transparent, color-mix(in oklab, var(--ink) 15%, transparent) 30%, color-mix(in oklab, var(--ink) 15%, transparent) 70%, transparent)",
        marginBottom: "40px",
        transformOrigin: "left",
      }}
    />
  )
}

/* ─────────────────────────────────────────
   Main export
───────────────────────────────────────── */
export function GameOptionsGrid({ gameModes, agentId }: GameOptionsGridProps) {
  const router = useRouter()
  const { setSelectedGameMode, agentGameSettings, getAgentGameSettings } =
    useExternalGameStore()

  useEffect(() => {
    if (agentId && !agentGameSettings) {
      getAgentGameSettings(agentId).catch(console.error)
    }
  }, [agentId, agentGameSettings, getAgentGameSettings])

  const bingoGame: GameModeDto = {
    gameMode: "bingo",
    title: "Bingo",
    description: "Classic Bingo Game",
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

  // The full game list: bingo first, then whatever the server returned,
  // optionally filtered by agentGameSettings whitelist.
  const allGames = useMemo(() => {
    const base = agentGameSettings?.gameModes
      ? gameModes.filter((g) => agentGameSettings.gameModes.includes(g.gameMode))
      : gameModes
    // Remove any accidental bingo duplicate from external list
    const external = base.filter((g) => g.gameMode !== "bingo")
    return [bingoGame, ...external]
  }, [gameModes, agentGameSettings])

  // Featured: only games from allGames that appear in FEATURED_ORDER, preserving that order
  const featuredGames = useMemo(() => {
    const lookup = new Map(allGames.map((g) => [g.gameMode, g]))
    return FEATURED_ORDER.flatMap((id) => {
      const game = id === "bingo" ? bingoGame : lookup.get(id)
      return game ? [game] : []
    })
  }, [allGames])

  // Hot: only games from allGames that are in HOT_GAMES set
  const hotGames = useMemo(
    () => allGames.filter((g) => HOT_GAMES.has(g.gameMode)),
    [allGames]
  )

  const handleGameSelect = (game: GameModeDto) => {
    setSelectedGameMode(game)
    const lang =
      typeof window !== "undefined"
        ? localStorage.getItem("i18nextLng") || "en"
        : "en"
    if (game.gameMode === "bingo") {
      router.push(agentId ? `/${lang}?agentId=${agentId}` : `/${lang}`)
    } else {
      router.push(
        agentId
          ? `/${lang}/external-games/${game.gameMode}?agentId=${agentId}`
          : `/${lang}/external-games/${game.gameMode}`
      )
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800&family=Barlow:wght@300;400;500&display=swap');

        @keyframes orbFloat1 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(30px,-25px) scale(1.06); }
        }
        @keyframes orbFloat2 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(-28px,20px) scale(1.04); }
        }

        .game-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        @media(min-width:480px)  { .game-grid { grid-template-columns: repeat(4,1fr); } }
        @media(min-width:640px)  { .game-grid { grid-template-columns: repeat(5,1fr); } }
        @media(min-width:900px)  { .game-grid { grid-template-columns: repeat(6,1fr); } }
        @media(min-width:1200px) { .game-grid { grid-template-columns: repeat(7,1fr); } }
      `}</style>

      <div style={{ position: "relative", paddingBottom: "64px" }}>

        {/* Ambient orbs */}
        {[
          { top: -80, left: -60, w: 380, color: "color-mix(in oklab, var(--key) 15%, transparent)", anim: "orbFloat1 10s ease-in-out infinite" },
          { top: 200, right: -80, w: 320, color: "color-mix(in oklab, var(--signal) 13%, transparent)", anim: "orbFloat2 12s ease-in-out infinite" },
          { bottom: 100, left: "35%", w: 280, color: "color-mix(in oklab, var(--voice) 10%, transparent)", anim: "orbFloat1 14s ease-in-out infinite reverse" },
        ].map((orb, i) => (
          <div
            key={i}
            aria-hidden
            style={{
              position: "absolute",
              width: orb.w,
              height: orb.w,
              top: (orb as any).top,
              left: (orb as any).left,
              right: (orb as any).right,
              bottom: (orb as any).bottom,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
              filter: "blur(60px)",
              pointerEvents: "none",
              animation: orb.anim,
            }}
          />
        ))}

        {/* ── FEATURED ── */}
        {featuredGames.length > 0 && <Section>
          <SectionHeader
            icon="✦"
            label="Featured Games"
            count={featuredGames.length}
            accent="var(--voice)"
            delay={0.05}
          />
          <div className="game-grid">
            {featuredGames.map((game, i) => (
              <GameTile
                key={game.gameMode}
                game={game}
                index={i}
                isFeatured
                isHot={false}
                onSelect={handleGameSelect}
                delay={0.08 + i * 0.05}
              />
            ))}
          </div>
        </Section>}

        <Divider delay={0.3} />

        {/* ── HOT GAMES ── */}
        {hotGames.length > 0 && <Section>
          <SectionHeader
            icon="🔥"
            label="Hot Games"
            count={hotGames.length}
            accent="var(--taken)"
            delay={0.15}
          />
          <div className="game-grid">
            {hotGames.map((game, i) => (
              <GameTile
                key={game.gameMode}
                game={game}
                index={i}
                isFeatured={false}
                isHot
                onSelect={handleGameSelect}
                delay={0.12 + i * 0.04}
              />
            ))}
          </div>
        </Section>}

        <Divider delay={0.4} />

        {/* ── ALL GAMES ── uses the same allGames array, no new list ── */}
        <Section>
          <SectionHeader
            icon="◈"
            label="All Games"
            count={allGames.length}
            accent="var(--soft-ink)"
            delay={0.25}
          />
          <div className="game-grid">
            {allGames.map((game, i) => (
              <GameTile
                key={game.gameMode}
                game={game}
                index={i}
                isFeatured={FEATURED_ORDER.includes(game.gameMode)}
                isHot={HOT_GAMES.has(game.gameMode)}
                onSelect={handleGameSelect}
                delay={0.04 + i * 0.018}
              />
            ))}
          </div>
        </Section>
      </div>
    </>
  )
}