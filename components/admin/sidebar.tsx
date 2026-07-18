"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  LogOut,
  ChevronDown,
  Calendar,
  Shield,
  HelpCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

type NavItem = {
  title: string
  href: string
  icon: React.ElementType
  submenu?: { title: string; href: string }[]
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "User Management",
    href: "/admin/users",
    icon: Shield,
  },
  {
    title: "Candidates",
    href: "/admin/candidates",
    icon: Users,
    submenu: [
      { title: "All Candidates", href: "/admin/candidates" },
      { title: "Shortlisted", href: "/admin/shortlisted" },
      { title: "Interviews", href: "/admin/interviews" },
    ],
  },
  {
    title: "Positions",
    href: "/admin/positions",
    icon: Briefcase,
  },
  {
    title: "Calendar",
    href: "/admin/calendar",
    icon: Calendar,
  },
  {
    title: "Guidelines",
    href: "/admin/guidelines",
    icon: FileText,
  },
  {
    title: "Help & Support",
    href: "/admin/support",
    icon: HelpCircle,
  },
]

import { Menu } from "lucide-react"

export function AdminSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)

  useEffect(() => {
    navItems.forEach((item) => {
      if (item.submenu && item.submenu.some((subItem) => pathname === subItem.href)) {
        setOpenSubmenu(item.title)
      }
    })
  }, [pathname])

  const toggleSubmenu = (title: string) => {
    setOpenSubmenu(openSubmenu === title ? null : title)
  }

  const handleLogout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    window.location.href = "/admin/login";
  }

  const sidebarVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  }

  return (
    <div className="h-full flex flex-col bg-background border-r">
      <div className="p-4 border-b flex items-center justify-between">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="bg-amber-600 p-1 rounded">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-xl">Super Admin</span>
        </Link>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="hidden lg:flex">
            <Menu className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-amber-100 text-amber-700">SA</AvatarFallback>
          </Avatar>
          <div className="overflow-hidden">
            <p className="font-medium truncate">System Admin</p>
            <p className="text-xs text-muted-foreground truncate">
              Full Access
            </p>
          </div>
        </div>
      </div>

      <motion.div
        className="flex-1 overflow-y-auto py-4 px-3"
        variants={sidebarVariants}
        initial="hidden"
        animate="visible"
      >
        <nav className="space-y-1">
          {navItems.map((item) => (
            <div key={item.href} className="mb-1">
              {item.submenu ? (
                <div>
                  <motion.button
                    variants={itemVariants}
                    onClick={() => toggleSubmenu(item.title)}
                    className={cn(
                      "flex items-center w-full px-3 py-2 text-sm rounded-md transition-colors",
                      pathname.startsWith(item.href.split("/").slice(0, 3).join("/"))
                        ? "bg-amber-600/10 text-amber-600 font-medium"
                        : "hover:bg-muted",
                    )}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    <span className="flex-1 text-left">{item.title}</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        openSubmenu === item.title ? "transform rotate-180" : "",
                      )}
                    />
                  </motion.button>

                  {openSubmenu === item.title && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-6 mt-1 space-y-1"
                    >
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={cn(
                            "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                            pathname === subItem.href
                              ? "bg-amber-600/10 text-amber-600 font-medium"
                              : "hover:bg-muted text-muted-foreground",
                          )}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current mr-3" />
                          {subItem.title}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </div>
              ) : (
                <motion.div variants={itemVariants}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                      pathname === item.href ? "bg-amber-600/10 text-amber-600 font-medium" : "hover:bg-muted",
                    )}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    <span>{item.title}</span>
                  </Link>
                </motion.div>
              )}
            </div>
          ))}
        </nav>
      </motion.div>

      <div className="p-4 border-t">
        <Button
          variant="outline"
          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  )
}
