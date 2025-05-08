"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import { Toaster } from "@/components/ui/toaster"
import ExpertNavbar from "@/components/dashboard/expert/expert-navbar"
import { Home, MessageSquare, BookOpen, Settings, DollarSign, Calendar, Star, User } from "lucide-react"
import { Sidebar } from "@/components/ui/sidebar"

export default function ExpertDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Add this check in the component function, after getting the user
  // This allows access to the complete-profile page even if the profile is not completed
  const isProfileCompletionPage = pathname === "/dashboard/expert/complete-profile"
  const shouldRedirect =
    user?.role !== "expert" || (user.role === "expert" && !user.is_profile_completed && !isProfileCompletionPage)

  useEffect(() => {
    if (!loading) {
      if (shouldRedirect) {
        if (user?.role !== "expert") {
          router.push("/auth/login")
        } else if (!user.is_profile_completed && !isProfileCompletionPage) {
          router.push("/dashboard/expert/complete-profile")
        }
      }
    }
  }, [user, router, isProfileCompletionPage, shouldRedirect, loading])

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-vanilla-cream">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#ffc6a8] border-t-transparent"></div>
      </div>
    )
  }

  // If the user is not an expert or the profile is not completed (except for the completion page), show loading
  if (shouldRedirect) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-vanilla-cream">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#ffc6a8] border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-vanilla-cream">
      <Sidebar
        items={[
          {
            href: "/dashboard/expert",
            title: "Dashboard",
            icon: <Home className="h-5 w-5" />,
          },
          {
            href: "/dashboard/expert/sessions",
            title: "Sessions",
            icon: <BookOpen className="h-5 w-5" />,
          },
          {
            href: "/dashboard/expert/availability",
            title: "Availability",
            icon: <Calendar className="h-5 w-5" />,
          },
          {
            href: "/dashboard/expert/messages",
            title: "Messages",
            icon: <MessageSquare className="h-5 w-5" />,
          },
          {
            href: "/dashboard/expert/earnings",
            title: "Earnings",
            icon: <DollarSign className="h-5 w-5" />,
          },
          {
            href: "/dashboard/expert/reviews",
            title: "Reviews",
            icon: <Star className="h-5 w-5" />,
          },
          {
            href: "/dashboard/expert/profile",
            title: "Profile",
            icon: <User className="h-5 w-5" />,
          },
          {
            href: "/dashboard/expert/settings",
            title: "Settings",
            icon: <Settings className="h-5 w-5" />,
          },
        ]}
      />
      <div className="flex-1">
        <ExpertNavbar />
        <main className="p-6">{children}</main>
        <Toaster />
      </div>
    </div>
  )
}
