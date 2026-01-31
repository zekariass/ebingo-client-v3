"use client"

import { useLobbyStore } from "@/lib/stores/lobby-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, X } from "lucide-react"

const FEE_TIERS = [10, 20, 50, 100]
const STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "in-game", label: "In Game" },
  { value: "starting", label: "Starting Soon" },
]

export function LobbyFilters() {
  const { filters, setFilters, clearFilters } = useLobbyStore()

  const hasActiveFilters = Object.values(filters).some((value) => value !== undefined && value !== "")

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search rooms..."
              value={filters.search || ""}
              onChange={(e) => setFilters({ search: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>

        {/* <Select
          value={filters.fee?.toString() || "all"}
          onValueChange={(value) => setFilters({ fee: value === "all" ? undefined : Number.parseInt(value) })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Fee Tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Fees</SelectItem>
            {FEE_TIERS.map((fee) => (
              <SelectItem key={fee} value={fee.toString()}>
                ${fee}
              </SelectItem>
            ))}
          </SelectContent>
        </Select> */}

        {/* <Select
          value={filters.status || "all"}
          onValueChange={(value) => setFilters({ status: value === "all" ? undefined : (value as any) })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select> */}

        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={clearFilters} className="flex items-center gap-2 bg-transparent">
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: {filters.search}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters({ search: undefined })} />
            </Badge>
          )}
          {filters.fee && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Fee: ${filters.fee}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters({ fee: undefined })} />
            </Badge>
          )}
          {filters.status && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Status: {STATUS_OPTIONS.find((s) => s.value === filters.status)?.label}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters({ status: undefined })} />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
