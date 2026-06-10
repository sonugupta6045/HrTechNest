"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { UserButton } from "@clerk/nextjs"
import { ModeToggle } from "@/components/mode-toggle"
import { useAuth } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="flex-1 p-6 max-w-5xl mx-auto w-full">
      <Skeleton className="h-8 w-64 mb-6" />
      <Skeleton className="h-32 w-full mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  )
}

export function CandidateClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId, isLoaded } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (isLoaded && !userId) {
    redirect("/sign-in")
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/10">
      <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 flex items-center justify-between px-6 lg:px-12">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">HrTechNest</h1>
          <nav className="hidden md:flex gap-4">
            <Link href="/candidate" className="text-sm font-medium hover:text-primary transition-colors">
              My Applications
            </Link>
            <Link href="/candidate/profile" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Profile
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="py-6 text-center text-sm text-muted-foreground">
                No new notifications
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <ModeToggle />
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>
      <main className="flex-1 overflow-auto p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-5xl mx-auto w-full"
        >
          <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
        </motion.div>
      </main>
    </div>
  )
}
