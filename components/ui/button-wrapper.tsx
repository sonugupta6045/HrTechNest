"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ButtonWrapperProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
  asButton?: boolean
}

/**
 * A wrapper component that renders either a button or a div based on context
 * Use this to prevent nested buttons in the DOM
 */
export function ButtonWrapper({
  children,
  className,
  asButton = false,
  ...props
}: ButtonWrapperProps) {
  // Check if we're inside a button element
  const [isInsideButton, setIsInsideButton] = React.useState(false)
  const ref = React.useRef<HTMLElement>(null)

  React.useEffect(() => {
    if (!ref.current) return

    // Check if this element is inside a button
    let parent = ref.current.parentElement
    while (parent) {
      if (parent.tagName.toLowerCase() === 'button') {
        setIsInsideButton(true)
        break
      }
      parent = parent.parentElement
    }
  }, [])

  const Component = asButton && !isInsideButton ? 'button' : 'div'

  return (
    <Component
      ref={ref}
      className={cn(className)}
      role={Component === 'div' ? 'button' : undefined}
      tabIndex={Component === 'div' ? 0 : undefined}
      {...props}
    >
      {children}
    </Component>
  )
} 