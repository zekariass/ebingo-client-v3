"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BINGO_PATTERNS, getPatternHighlight } from "@/lib/utils/bingo-patterns"
import type { GamePattern } from "@/lib/types"
import { cn } from "@/lib/utils"

interface PatternDisplayProps {
  pattern: GamePattern | string | null | undefined
  className?: string
}

export function PatternDisplay({ pattern, className }: PatternDisplayProps) {
  if (!pattern) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">No pattern selected</div>
        </CardContent>
      </Card>
    )
  }

  // const patternKey = pattern//typeof pattern === "string" ? pattern : pattern || "unknown"
  const patternDef = BINGO_PATTERNS[pattern]
  const highlight = getPatternHighlight(pattern)

  if (!patternDef) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">Unknown pattern: {pattern}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{patternDef.name}</CardTitle>
          <Badge variant="secondary">{pattern}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{patternDef.description}</p>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          {/* Pattern visualization */}
          <div className="grid grid-cols-5 gap-0.5 max-w-40 mx-auto">
            {highlight.map((row, rowIndex) =>
              row.map((highlighted, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={cn(
                    "aspect-square border rounded-xs flex items-center justify-center text-xs font-bold",
                    highlighted
                      ? "bg-green-300 text-primary-foreground border-primary"
                      : "bg-muted border-muted-foreground/20",
                    rowIndex === 2 && colIndex === 2 && "bg-yellow-200 dark:bg-yellow-800 border-yellow-400",
                  )}
                >
                  {rowIndex === 2 && colIndex === 2 ? "★" : highlighted ? "●" : ""}
                </div>
              )),
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
