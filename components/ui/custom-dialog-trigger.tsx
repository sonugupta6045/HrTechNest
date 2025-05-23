"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cn } from "@/lib/utils"

interface CustomDialogTriggerProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger> {
  asChild?: boolean
}

const CustomDialogTrigger = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Trigger>,
  CustomDialogTriggerProps
>(({ className, children, asChild = true, ...props }, ref) => {
  const Component = asChild ? "div" : "button"
  
  return (
    <DialogPrimitive.Trigger asChild ref={ref} {...props}>
      <Component
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
      </Component>
    </DialogPrimitive.Trigger>
  )
})
CustomDialogTrigger.displayName = DialogPrimitive.Trigger.displayName

export { CustomDialogTrigger } 