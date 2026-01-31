"use client"

import { useState, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RoomCard } from "./room-card"
import type { Room } from "@/lib/types"

interface RoomCarouselProps {
  fee: number
  rooms: Room[]
}

export function RoomCarousel({ fee, rooms }: RoomCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320 // Approximate width of one card plus gap
      const newScrollLeft = scrollRef.current.scrollLeft + (direction === "left" ? -scrollAmount : scrollAmount)

      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      })

      // Check buttons after scroll animation
      setTimeout(checkScrollButtons, 300)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {/* <h2 className="text-xl sm:text-2xl font-bold">${fee} Rooms</h2> */}
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            {rooms.length} room{rooms.length !== 1 ? "s" : ""} available
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onScroll={checkScrollButtons}
      >
        {rooms.map((room) => (
          <div key={room.id} className="flex-shrink-0">
            <RoomCard room={room} />
          </div>
        ))}
      </div>
    </div>
  )
}
