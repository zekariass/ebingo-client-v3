// "use client"

// import { cn } from "@/lib/utils"
// import { Button } from "@/components/ui/button"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import { LayoutDashboard, Users, GamepadIcon, Settings, BarChart3, Shield, LogOut, Mic, Home, X, Wallet, DollarSign, Wallet2, Plus, ArrowDownToLineIcon, ArrowUpToLineIcon, Trophy } from "lucide-react"
// import Link from "next/link"
// import { usePathname } from "next/navigation"
// import { useAgentStore } from "@/lib/stores/agent-store"
// import { userStore } from "@/lib/stores/user-store"
// import i18n from "@/i18n"


// interface AdminSidebarProps {
//   isMobile?: boolean
//   onLinkClick?: () => void
// }

// export function AdminSidebar({ isMobile = false, onLinkClick }: AdminSidebarProps) {
//   const pathname = usePathname()
//   const { activeAgentId } = useAgentStore()
//   const { user } = userStore.getState()
//   const userRole = user?.role

//   const allSidebarItems = [
//     { title: "Home", href: `/${i18n.language}?agentId=${activeAgentId}`, icon: Home },
//     // { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
//     { title: "Rooms", href: `/admin/rooms?agentId=${activeAgentId}`, icon: GamepadIcon },
//     // {title: "Deposits", href: "/admin/deposits", icon: ArrowDownToLineIcon},
//     {title: "Payments", href: `/admin/payment-orders?agentId=${activeAgentId}`, icon: ArrowUpToLineIcon},
//     {title: "Wallets", href: `/admin/wallet/details?agentId=${activeAgentId}`, icon: Wallet},
//     { title: "Leaderboard (Daily)", href: `/admin/leaderboard/daily?agentId=${activeAgentId}`, icon: Trophy },
//     { title: "Leaderboard (Total)", href: `/admin/leaderboard/total?agentId=${activeAgentId}`, icon: Trophy },
//     { title: "Agents", href: `/admin/agents?agentId=${activeAgentId}`, icon: Users, adminOnly: true },
//     { title: "Daily Accounting", href: `/admin/accounting/daily?agentId=${activeAgentId}`, icon: BarChart3, agentOrAdminOnly: true },
//     { title: "Total Accounting", href: `/admin/accounting/total?agentId=${activeAgentId}`, icon: DollarSign, agentOrAdminOnly: true },
//     { title: "Daily Accountings", href: `/admin/accountings/daily?agentId=${activeAgentId}`, icon: BarChart3, adminOnly: true },
//     { title: "Total Accountings", href: `/admin/accountings/total?agentId=${activeAgentId}`, icon: DollarSign, adminOnly: true },
//     { title: "Configs", href: `/admin/configs?agentId=${activeAgentId}`, icon: Settings },
//     // { title: "Manual Calling", href: "/admin/manual-calling", icon: Mic },
//     // { title: "Players", href: "/admin/players", icon: Users },
//     // { title: "Analytics", href: "/admin/analytics", icon: BarChart3 },
//   ]

//   // Filter sidebar items based on user role
//   const sidebarItems = allSidebarItems.filter(item => 
//     (!item.adminOnly || userRole === "ADMIN") &&
//     (!item.agentOrAdminOnly || (userRole === "ADMIN" || userRole === "AGENT"))
//   )

//   return (
//     <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transition-transform duration-300 ease-in-out flex flex-col h-full bg-card ${isMobile ? "w-64" : "w-64 lg:w-64"}`}>
//       {/* Header */}
//       <div className="p-4 flex items-center justify-between border-b">
//         <div className="flex items-center gap-2">
//           <Shield className={isMobile ? "h-5 w-5 text-primary" : "h-6 w-6 text-primary"} />
//           <span className={isMobile ? "font-bold text-base" : "font-bold text-lg"}>Bingo Admin</span>
//         </div>
//         {isMobile && onLinkClick && (
//           <Button variant="ghost" size="sm" onClick={onLinkClick} aria-label="Close menu">
//             <X className="h-4 w-4" />
//           </Button>
//         )}
//       </div>

//       {/* Menu */}
//       <ScrollArea className="flex-1 px-3 py-2">
//         <div className="space-y-1">
//           {sidebarItems.map((item) => (
//             <Button
//               key={item.href}
//               variant={pathname === item.href ? "secondary" : "ghost"}
//               className={cn("w-full justify-start text-sm py-2", pathname === item.href && "bg-secondary")}
//               asChild
//               onClick={onLinkClick}
//             >
//               <Link href={item.href}>
//                 <item.icon className="mr-2 h-4 w-4" />
//                 {item.title}
//               </Link>
//             </Button>
//           ))}
//         </div>
//       </ScrollArea>

//       {/* Sign Out */}
//       {/* <div className="p-3 border-t">
//         <Button
//           variant="ghost"
//           className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 text-sm py-2"
//         >
//           <LogOut className="mr-2 h-4 w-4" />
//           Sign Out
//         </Button>
//       </div> */}
//     </div>
//   )
// }




"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Users,
  GamepadIcon,
  Settings,
  BarChart3,
  Shield,
  Home,
  X,
  Wallet,
  DollarSign,
  ArrowUpToLineIcon,
  Trophy,
  Egg,
  Gamepad2,
  Search,
  Landmark,
  UserCog,
  Bot,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAgentStore } from "@/lib/stores/agent-store"
import { userStore } from "@/lib/stores/user-store"
import i18n from "@/i18n"

interface AdminSidebarProps {
  isMobile?: boolean
  onLinkClick?: () => void
}

type Role = "ADMIN" | "AGENT" | string | undefined

type SidebarItem = {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  section: string
  adminOnly?: boolean
  agentOnly?: boolean
  agentOrAdminOnly?: boolean
}

function canSeeItem(item: SidebarItem, role: Role) {
  if (item.adminOnly) return role === "ADMIN"
  if (item.agentOnly) return role === "AGENT"
  if (item.agentOrAdminOnly) return role === "ADMIN" || role === "AGENT"
  return true
}

export function AdminSidebar({ isMobile = false, onLinkClick }: AdminSidebarProps) {
  const pathname = usePathname()
  const { activeAgentId } = useAgentStore()

  // ✅ IMPORTANT: use Zustand hook form so the component re-renders when user updates
  const user = userStore((state) => state.user)
  const userRole: Role = user?.role

  const allSidebarItems: SidebarItem[] = [
      // Main
      { title: "Home", href: `/${i18n.language}/game-options?agentId=${activeAgentId}`, icon: Home, section: "Main" },
      { title: "Rooms", href: `/admin/rooms?agentId=${activeAgentId}`, icon: GamepadIcon, section: "Main" },
      { title: "Leaderboard", href: `/admin/leaderboard?agentId=${activeAgentId}`, icon: Trophy, section: "Main" },
      { title: "Golden Eggs", href: `/admin/golden-eggs?agentId=${activeAgentId}`, icon: Egg, section: "Main", agentOrAdminOnly: true },

      // Finance
      { title: "Payments", href: `/admin/payment-orders?agentId=${activeAgentId}`, icon: ArrowUpToLineIcon, section: "Finance" },
      { title: "Wallets", href: `/admin/wallet/details?agentId=${activeAgentId}`, icon: Wallet, section: "Finance" },
      { title: "Accounting (Agent)", href: `/admin/accounting?agentId=${activeAgentId}`, icon: BarChart3, section: "Finance", agentOrAdminOnly: true },
      { title: "Accountings (Admin)", href: `/admin/accountings?agentId=${activeAgentId}`, icon: DollarSign, section: "Finance", adminOnly: true },

      // Management
      { title: "My Agent", href: `/admin/agent-profile?agentId=${activeAgentId}`, icon: UserCog, section: "Management", agentOnly: true },
      { title: "Agents", href: `/admin/agents?agentId=${activeAgentId}`, icon: Users, section: "Management", adminOnly: true },
      { title: "Bot Users", href: `/admin/bot-users?agentId=${activeAgentId}`, icon: Bot, section: "Management", adminOnly: true },

      // Configuration
      { title: "Games", href: `/admin/games?agentId=${activeAgentId}`, icon: Gamepad2, section: "Configuration", adminOnly: true },
      { title: "Agent Games Config", href: `/admin/agent-games-config?agentId=${activeAgentId}`, icon: Search, section: "Configuration", adminOnly: true },
      { title: "Agent Config", href: `/admin/agent-config?agentId=${activeAgentId}`, icon: UserCog, section: "Configuration", agentOrAdminOnly: true },
      { title: "Deposit Config", href: `/admin/agent-deposit-config?agentId=${activeAgentId}`, icon: Landmark, section: "Configuration", agentOrAdminOnly: true },
      { title: "Configs", href: `/admin/configs?agentId=${activeAgentId}`, icon: Settings, section: "Configuration" },
    ];


  const sidebarItems = allSidebarItems.filter((item) => canSeeItem(item, userRole))

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transition-transform duration-300 ease-in-out flex flex-col h-full ${
        isMobile ? "w-64" : "w-64 lg:w-64"
      }`}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b">
        <div className="flex items-center gap-2">
          <Shield className={isMobile ? "h-5 w-5 text-primary" : "h-6 w-6 text-primary"} />
          <span className={isMobile ? "font-bold text-base" : "font-bold text-lg"}>Bingo Admin</span>
        </div>

        {isMobile && onLinkClick && (
          <Button variant="ghost" size="sm" onClick={onLinkClick} aria-label="Close menu">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Menu */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2">
        <div className="space-y-1">
          {sidebarItems.map((item, index) => {
            const itemPath = item.href.split("?")[0]
            const isActive = pathname === itemPath || pathname.endsWith(itemPath) || pathname.includes(`${itemPath}/`)
            const isFirstInSection = sidebarItems.findIndex((i) => i.section === item.section) === index
            return (
              <div key={item.href}>
                {isFirstInSection && (
                  <div
                    className={cn(
                      "px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
                      index === 0 ? "pt-1" : "pt-4"
                    )}
                  >
                    {item.section}
                  </div>
                )}
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn("w-full justify-start text-sm py-2", isActive && "bg-secondary")}
                  asChild
                  onClick={onLinkClick}
                >
                  <Link href={item.href}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </Link>
                </Button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
