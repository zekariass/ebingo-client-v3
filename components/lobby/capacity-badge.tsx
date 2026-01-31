import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface CapacityBadgeProps {
  current: number
  max: number
  variant?: "default" | "warning" | "full"
}

export function CapacityBadge({ current, max, variant = "default" }: CapacityBadgeProps) {
  const percentage = (current / max) * 100

  const getVariant = () => {
    if (variant !== "default") return variant
    if (percentage >= 100) return "full"
    if (percentage >= 80) return "warning"
    return "default"
  }

  const actualVariant = getVariant()

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-mono text-xs",
        actualVariant === "warning" && "border-yellow-500 text-yellow-700 dark:text-yellow-400",
        actualVariant === "full" && "border-red-500 text-red-700 dark:text-red-400",
      )}
    >
      {current}/{max}
    </Badge>
  )
}
