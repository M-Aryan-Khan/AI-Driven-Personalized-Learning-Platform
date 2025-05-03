"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Heart, Menu, Search, Bell } from 'lucide-react'
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

export default function StudentNavbar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const userInitials = user?.first_name && user?.last_name ? `${user.first_name[0]}${user.last_name[0]}` : "ST"

  return (
    <header className=" top-0 z-50 border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/dashboard/student" className="mr-6 flex items-center">
              <span className="text-2xl font-bold text-deep-cocoa">Synapse</span>
            </Link>
            <Button
              variant="outline"
              className="hidden md:flex items-center gap-2 border-[#ffc6a8] text-deep-cocoa hover:bg-[#fff2e7]"
              asChild
            >
              <Link href="/dashboard/student/find-tutors">
                <Search size={16} />
                Find tutors
              </Link>
            </Button>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link
              href="/dashboard/student/bookmarks"
              className="flex items-center justify-center rounded-full p-2 hover:bg-gray-100"
            >
              <Heart size={20} className="text-deep-cocoa" />
            </Link>
            
            <Link
              href="/dashboard/student/notifications"
              className="flex items-center justify-center rounded-full p-2 hover:bg-gray-100"
            >
              <Bell size={20} className="text-deep-cocoa" />
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profile_image || ""} alt={user?.first_name || "User"} />
                    <AvatarFallback className="bg-[#ffc6a8] text-deep-cocoa">{userInitials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/student">Home</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/student/messages">Messages</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/student/lessons">My lessons</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/student/bookmarks">Saved tutors</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/student/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
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
                href="/dashboard/student"
                className={cn(
                  "block rounded-md px-3 py-2 text-base font-medium",
                  pathname === "/dashboard/student" ? "bg-[#fff2e7] text-deep-cocoa" : "text-gray-700 hover:bg-gray-50",
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/dashboard/student/messages"
                className={cn(
                  "block rounded-md px-3 py-2 text-base font-medium",
                  pathname === "/dashboard/student/messages" ? "bg-[#fff2e7] text-deep-cocoa" : "text-gray-700 hover:bg-gray-50",
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                Messages
              </Link>
              <Link
                href="/dashboard/student/lessons"
                className={cn(
                  "block rounded-md px-3 py-2 text-base font-medium",
                  pathname === "/dashboard/student/lessons" ? "bg-[#fff2e7] text-deep-cocoa" : "text-gray-700 hover:bg-gray-50",
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                My lessons
              </Link>
              <Link
                href="/dashboard/student/find-tutors"
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Find tutors
              </Link>
              <Link
                href="/dashboard/student/bookmarks"
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Saved tutors
              </Link>
              <Link
                href="/dashboard/student/settings"
                className={cn(
                  "block rounded-md px-3 py-2 text-base font-medium",
                  pathname === "/dashboard/student/settings" ? "bg-[#fff2e7] text-deep-cocoa" : "text-gray-700 hover:bg-gray-50",
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
