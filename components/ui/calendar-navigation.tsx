"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface CalendarNavigationProps {
  onPreviousClick: () => void
  onNextClick: () => void
  className?: string
}

export function CalendarNavigation({
  onPreviousClick,
  onNextClick,
  className,
}: CalendarNavigationProps) {
  return (
    <div className={cn("space-x-1 flex items-center", className)}>
      <div
        role="button"
        tabIndex={0}
        onClick={onPreviousClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            onPreviousClick()
          }
        }}
        className={cn(
          "h-7 w-7 p-0 opacity-50 hover:opacity-100",
          "inline-flex items-center justify-center rounded-md text-sm font-medium",
          "ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
          "absolute left-1",
          "cursor-pointer select-none"
        )}
        aria-label="Previous month"
      >
        <ChevronLeft className="h-4 w-4" />
      </div>
      <div
        role="button"
        tabIndex={0}
        onClick={onNextClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            onNextClick()
          }
        }}
        className={cn(
          "h-7 w-7 p-0 opacity-50 hover:opacity-100",
          "inline-flex items-center justify-center rounded-md text-sm font-medium",
          "ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
          "absolute right-1",
          "cursor-pointer select-none"
        )}
        aria-label="Next month"
      >
        <ChevronRight className="h-4 w-4" />
      </div>
    </div>
  )
} 