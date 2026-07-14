"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { AdminSidebar } from "@/components/admin/sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import { motion, AnimatePresence } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { Bell, Menu, X, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="flex-1 p-6">
      <Skeleton className="h-8 w-64 mb-6" />
      <Skeleton className="h-32 w-full mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

export function AdminClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Check if we're on a mobile device
  useEffect(() => {
    setMounted(true)
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth < 1024
      setIsMobile(isMobileDevice)
      setIsSidebarOpen(!isMobileDevice)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`fixed inset-y-0 left-0 z-20 ${isMobile ? "w-64" : "w-64"}`}
          >
            <AdminSidebar onClose={toggleSidebar} />
            {isMobile && (
              <Button variant="ghost" size="icon" className="absolute top-4 right-4 lg:hidden" onClick={toggleSidebar}>
                <X className="h-5 w-5" />
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile overlay */}
      {isMobile && isSidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/50 z-10 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Main content */}
      <motion.div
        layout
        className={`flex-1 flex flex-col ${isSidebarOpen ? (isMobile ? "ml-0" : "ml-64") : "ml-0"}`}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 flex items-center justify-between px-6">
          <div className="flex items-center">
            {(!isSidebarOpen || isMobile) ? (
              <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-4">
                <Menu className="h-5 w-5" />
              </Button>
            ) : null}
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-600" />
              <h1 className="text-xl font-semibold">Super Admin Portal</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>System Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No new system alerts
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <ModeToggle />
            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarFallback className="bg-amber-100 text-amber-700">SA</AvatarFallback>
            </Avatar>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
        </main>
      </motion.div>
    </div>
  )
}
