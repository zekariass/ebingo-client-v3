"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SoundControls } from "./sound-controls"
import { useTheme } from "next-themes"
import { Palette } from "lucide-react"
import { useEffect, useState } from "react"

export function GameSettings() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="space-y-4">
      {/* Theme Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Theme</span>
            {mounted && (
              <div className="flex gap-2">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("light")}
                  className="text-xs"
                >
                  Light
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("dark")}
                  className="text-xs"
                >
                  Dark
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("system")}
                  className="text-xs"
                >
                  System
                </Button>
              </div>
            )}
          </div>

          {mounted && (
            <div className="text-xs text-muted-foreground">
              Current: {theme === "system" ? "System preference" : theme === "light" ? "Light mode" : "Dark mode"}
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Sound Settings */}
      <SoundControls />
    </div>
  )
}
