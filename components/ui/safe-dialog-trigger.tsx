"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cn } from "@/lib/utils"

interface SafeDialogTriggerProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger> {
  className?: string
}

const SafeDialogTrigger = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Trigger>,
  SafeDialogTriggerProps
>(({ className, children, ...props }, ref) => {
  return (
    <DialogPrimitive.Trigger asChild ref={ref} {...props}>
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
    </DialogPrimitive.Trigger>
  )
})
SafeDialogTrigger.displayName = "SafeDialogTrigger"

export { SafeDialogTrigger } 