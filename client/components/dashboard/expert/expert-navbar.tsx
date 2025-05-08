"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, Search, Bell } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function ExpertNavbar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const userInitials = user?.first_name && user?.last_name ? `${user.first_name[0]}${user.last_name[0]}` : "EX"

  return (
    <header className="top-0 z-50 border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/dashboard/expert" className="mr-6 flex items-center">
              <span className="text-2xl font-bold text-deep-cocoa">Synapse</span>
            </Link>
            <Button
              variant="outline"
              className="hidden md:flex items-center gap-2 border-[#ffc6a8] text-deep-cocoa hover:bg-[#fff2e7] hover:cursor-pointer"
              asChild
            >
              <Link href="/dashboard/expert/sessions">
                <Search size={16} />
                View Sessions
              </Link>
            </Button>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link
              href="/dashboard/expert/notifications"
              className="flex items-center justify-center rounded-full p-2 hover:bg-gray-100"
            >
              <Bell size={20} className="text-deep-cocoa" />
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:cursor-pointer">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profile_image || ""} alt={user?.first_name || "User"} />
                    <AvatarFallback className="bg-[#ffc6a8] text-deep-cocoa">{userInitials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild className="hover:cursor-pointer">
                  <Link href="/dashboard/expert">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="hover:cursor-pointer">
                  <Link href="/dashboard/expert/messages">Messages</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="hover:cursor-pointer">
                  <Link href="/dashboard/expert/sessions">Sessions</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="hover:cursor-pointer">
                  <Link href="/dashboard/expert/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="hover:cursor-pointer">
                  <Link href="/dashboard/expert/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="hover:cursor-pointer" onClick={logout}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
              <Menu size={24} />
            </Button>
          </div>
        </div>

        {/* Mobile navigation menu */}
        {isMenuOpen && (
          <motion.div
            className="md:hidden"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="space-y-1 pb-3 pt-2">
              <Link
                href="/dashboard/expert"
                className={cn(
                  "block rounded-md px-3 py-2 text-base font-medium",
                  pathname === "/dashboard/expert" ? "bg-[#fff2e7] text-deep-cocoa" : "text-gray-700 hover:bg-gray-50",
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/expert/sessions"
                className={cn(
                  "block rounded-md px-3 py-2 text-base font-medium",
                  pathname === "/dashboard/expert/sessions"
                    ? "bg-[#fff2e7] text-deep-cocoa"
                    : "text-gray-700 hover:bg-gray-50",
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                Sessions
              </Link>
              <Link
                href="/dashboard/expert/availability"
                className={cn(
                  "block rounded-md px-3 py-2 text-base font-medium",
                  pathname === "/dashboard/expert/availability"
                    ? "bg-[#fff2e7] text-deep-cocoa"
                    : "text-gray-700 hover:bg-gray-50",
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                Availability
              </Link>
              <Link
                href="/dashboard/expert/messages"
                className={cn(
                  "block rounded-md px-3 py-2 text-base font-medium",
                  pathname === "/dashboard/expert/messages"
                    ? "bg-[#fff2e7] text-deep-cocoa"
                    : "text-gray-700 hover:bg-gray-50",
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                Messages
              </Link>
              <Link
                href="/dashboard/expert/earnings"
                className={cn(
                  "block rounded-md px-3 py-2 text-base font-medium",
                  pathname === "/dashboard/expert/earnings"
                    ? "bg-[#fff2e7] text-deep-cocoa"
                    : "text-gray-700 hover:bg-gray-50",
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                Earnings
              </Link>
              <Link
                href="/dashboard/expert/reviews"
                className={cn(
                  "block rounded-md px-3 py-2 text-base font-medium",
                  pathname === "/dashboard/expert/reviews"
                    ? "bg-[#fff2e7] text-deep-cocoa"
                    : "text-gray-700 hover:bg-gray-50",
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                Reviews
              </Link>
              <Link
                href="/dashboard/expert/profile"
                className={cn(
                  "block rounded-md px-3 py-2 text-base font-medium",
                  pathname === "/dashboard/expert/profile"
                    ? "bg-[#fff2e7] text-deep-cocoa"
                    : "text-gray-700 hover:bg-gray-50",
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                Profile
              </Link>
              <Link
                href="/dashboard/expert/settings"
                className={cn(
                  "block rounded-md px-3 py-2 text-base font-medium",
                  pathname === "/dashboard/expert/settings"
                    ? "bg-[#fff2e7] text-deep-cocoa"
                    : "text-gray-700 hover:bg-gray-50",
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                Settings
              </Link>
              <button
                onClick={() => {
                  logout()
                  setIsMenuOpen(false)
                }}
                className="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-gray-700 hover:bg-gray-50"
              >
                Log out
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </header>
  )
}
