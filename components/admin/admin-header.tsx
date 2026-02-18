"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { Bell, RefreshCw, Menu } from "lucide-react"
import { useAdminStore } from "@/lib/stores/admin-store"
import { useTranslation } from "react-i18next"
import { useAgentStore } from "@/lib/stores/agent-store"
import Link from "next/link"
import i18n from "@/i18n"

interface AdminHeaderProps {
  onMenuToggle?: () => void
}

/**
 * Admin Header Component
 *
 * Top navigation bar for admin dashboard with system status, notifications,
 * and mobile menu toggle functionality.
 *
 * @param onMenuToggle - Callback function to toggle mobile sidebar
 * @returns JSX element containing the admin header
 */
export function AdminHeader({ onMenuToggle }: AdminHeaderProps) {
  const { systemStatus, notifications, refreshData } = useAdminStore()
  const { t } = useTranslation("admin")
  const { activeAgentId } = useAgentStore()

  return (
    <header className="border-b bg-background px-3 sm:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={onMenuToggle}>
            <Menu className="h-4 w-4" />
          </Button>

           <h2 className="text-base sm:text-lg font-semibold truncate">Dashboard</h2>
          {/*<Badge variant={systemStatus === "healthy" ? "default" : "destructive"} className="text-xs">
            {t(`status.${systemStatus}`, systemStatus)}
          </Badge> */}
        </div>

        <Link
          href={`/${i18n.language}/game-options?agentId=${activeAgentId}`}
          className="mx-4 p-1 text-primary hover:text-primary/80 border border-[var(--btn-default-bg)]"
        >
          Game Options
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <Button variant="outline" size="sm" onClick={() => refreshData(activeAgentId!)} className="hidden sm:flex bg-transparent">
            <RefreshCw className="h-4 w-4 mr-2" />
            {t("refresh", "Refresh")}
          </Button>

          <Button variant="outline" size="sm" onClick={() => refreshData(activeAgentId!)} className="sm:hidden bg-transparent">
            <RefreshCw className="h-4 w-4" />
          </Button>

          {/* <Button variant="outline" size="sm" className="relative bg-transparent">
            <Bell className="h-4 w-4" />
            {notifications > 0 && (
              <Badge className="absolute -top-2 -right-2 h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 text-xs flex items-center justify-center">
                {notifications}
              </Badge>
            )}
          </Button> */}

          <div className="hidden sm:block">
            {/* <LanguageSwitcher /> */}
          </div>
        </div>
      </div>
    </header>
  )
}
