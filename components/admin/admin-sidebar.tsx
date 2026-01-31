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
import { ScrollArea } from "@/components/ui/scroll-area"
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
  adminOnly?: boolean
  agentOrAdminOnly?: boolean
}

function canSeeItem(item: SidebarItem, role: Role) {
  if (item.adminOnly) return role === "ADMIN"
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
      // Core
      { title: "Home", href: `/${i18n.language}?agentId=${activeAgentId}`, icon: Home },
      { title: "Rooms", href: `/admin/rooms?agentId=${activeAgentId}`, icon: GamepadIcon },

      // Money / Ops
      { title: "Wallets", href: `/admin/wallet/details?agentId=${activeAgentId}`, icon: Wallet },
      { title: "Payments", href: `/admin/payment-orders?agentId=${activeAgentId}`, icon: ArrowUpToLineIcon },

      // Performance
      { title: "Leaderboard (Daily)", href: `/admin/leaderboard/daily?agentId=${activeAgentId}`, icon: Trophy },
      { title: "Leaderboard (Total)", href: `/admin/leaderboard/total?agentId=${activeAgentId}`, icon: Trophy },

      // Accounting (agent or admin)
      { title: "Daily Accounting (Agent)", href: `/admin/accounting/daily?agentId=${activeAgentId}`, icon: BarChart3, agentOrAdminOnly: true },
      { title: "Total Accounting (Agent)", href: `/admin/accounting/total?agentId=${activeAgentId}`, icon: DollarSign, agentOrAdminOnly: true },

      // Accounting (admin only)
      { title: "Daily Accountings (Admin)", href: `/admin/accountings/daily?agentId=${activeAgentId}`, icon: BarChart3, adminOnly: true },
      { title: "Total Accountings (Admin)", href: `/admin/accountings/total?agentId=${activeAgentId}`, icon: DollarSign, adminOnly: true },

      // Admin / System
      { title: "Agents", href: `/admin/agents?agentId=${activeAgentId}`, icon: Users, adminOnly: true },
      { title: "Configs", href: `/admin/configs?agentId=${activeAgentId}`, icon: Settings },
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
      <ScrollArea className="flex-1 px-3 py-2">
        <div className="space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Button
                key={item.href}
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
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
