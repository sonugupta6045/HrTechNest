"use client"

import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

interface ClientButtonProps extends React.ComponentProps<typeof Button> {
  children: React.ReactNode
}

export function ClientButton({ children, ...props }: ClientButtonProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <Button {...props} disabled>
        {children}
      </Button>
    )
  }

  return <Button {...props}>{children}</Button>
} 