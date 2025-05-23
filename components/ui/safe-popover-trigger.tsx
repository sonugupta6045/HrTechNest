"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { cn } from "@/lib/utils"

interface SafePopoverTriggerProps
  extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger> {
  className?: string
}

const SafePopoverTrigger = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Trigger>,
  SafePopoverTriggerProps
>(({ className, children, ...props }, ref) => {
  return (
    <PopoverPrimitive.Trigger asChild ref={ref} {...props}>
      <div
        role="button"
        tabIndex={0}
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium",
          "ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          className
        )}
      >
        {children}
      </div>
    </PopoverPrimitive.Trigger>
  )
})
SafePopoverTrigger.displayName = "SafePopoverTrigger"

export { SafePopoverTrigger } 