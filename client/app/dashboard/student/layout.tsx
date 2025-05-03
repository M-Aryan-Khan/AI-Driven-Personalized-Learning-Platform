"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Toaster } from "@/components/ui/toaster"
import StudentNavbar from "@/components/dashboard/student/student-navbar"
import { Home, MessageSquare, BookOpen, Settings, Heart } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger
} from "@/components/ui/sidebar"

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || user.role !== "student")) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-vanilla-cream">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#ffc6a8] border-t-transparent"></div>
      </div>
    )
  }

  if (!user || user.role !== "student") {
    return null
  }

  return (
    <div className="flex min-h-screen bg-vanilla-cream">
      <Sidebar
        items={[
          {
            href: "/dashboard/student",
            title: "Home",
            icon: <Home className="h-5 w-5" />,
          },
          {
            href: "/dashboard/student/messages",
            title: "Messages",
            icon: <MessageSquare className="h-5 w-5" />,
          },
          {
            href: "/dashboard/student/lessons",
            title: "My lessons",
            icon: <BookOpen className="h-5 w-5" />,
          },
          {
            href: "/dashboard/student/bookmarks",
            title: "Saved tutors",
            icon: <Heart className="h-5 w-5" />,
          },
          {
            href: "/dashboard/student/settings",
            title: "Settings",
            icon: <Settings className="h-5 w-5" />,
          },
        ]}
      />
      <div className="flex-1">
        <StudentNavbar />
        <main className="p-6">{children}</main>
        <Toaster />
      </div>
    </div>
  )
}
