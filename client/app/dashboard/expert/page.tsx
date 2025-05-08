"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, DollarSign, Star, Users, BookOpen, MessageSquare, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import axios from "@/lib/axios"

type Session = {
  id: string
  student_name: string
  student_profile_image?: string
  date: string
  duration: number
  topic: string
  status: string
}

type Stats = {
  upcoming_sessions: number
  completed_sessions: number
  review_count: number
  average_rating: number
  estimated_earnings: number
}

export default function ExpertDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([])
  const [stats, setStats] = useState<Stats>({
    upcoming_sessions: 0,
    completed_sessions: 0,
    review_count: 0,
    average_rating: 0,
    estimated_earnings: 0,
  })
  const [unreadMessages, setUnreadMessages] = useState(0)

  useEffect(() => {
    if (user && user.role === "expert" && !user.is_profile_completed) {
      router.push("/dashboard/expert/complete-profile")
    }
  }, [user, router])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)

        // Fetch upcoming sessions
        const sessionsResponse = await axios.get("/api/experts/sessions", {
          params: { status: "scheduled" },
        })

        // Sort by date (closest first)
        const sortedSessions = sessionsResponse.data.sort(
          (a: Session, b: Session) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        )

        setUpcomingSessions(sortedSessions.slice(0, 3)) // Get only the next 3 sessions

        // Fetch stats
        const statsResponse = await axios.get("/api/experts/stats")
        setStats(statsResponse.data)

        // Fetch unread messages count
        const conversationsResponse = await axios.get("/api/experts/conversations")
        const unreadCount = conversationsResponse.data.reduce(
          (count: number, conversation: any) => (conversation.unread ? count + 1 : count),
          0,
        )
        setUnreadMessages(unreadCount)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        // If API fails, use empty data
        setUpcomingSessions([])
        setStats({
          upcoming_sessions: 0,
          completed_sessions: 0,
          review_count: 0,
          average_rating: 0,
          estimated_earnings: 0,
        })
        setUnreadMessages(0)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const handleViewSessions = () => {
    router.push("/dashboard/expert/sessions")
  }

  const handleViewMessages = () => {
    router.push("/dashboard/expert/messages")
  }

  const handleSetAvailability = () => {
    router.push("/dashboard/expert/availability")
  }

  const handleViewEarnings = () => {
    router.push("/dashboard/expert/earnings")
  }

  const handleViewReviews = () => {
    router.push("/dashboard/expert/reviews")
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTimeUntil = (dateString: string) => {
    const now = new Date()
    const sessionDate = new Date(dateString)
    const diffTime = Math.abs(sessionDate.getTime() - now.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (diffDays > 0) {
      return `in ${diffDays} day${diffDays > 1 ? "s" : ""}`
    } else {
      return `in ${diffHours} hour${diffHours > 1 ? "s" : ""}`
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="container mx-auto max-w-6xl">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-deep-cocoa">
            Welcome back, {user?.first_name || "Expert"}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your teaching today
          </p>
        </div>

        <Button
          onClick={handleSetAvailability}
          className="bg-warm-coral text-white hover:bg-[#ff8c61] hover:cursor-pointer"
        >
          <Calendar className="mr-2 h-4 w-4" />
          Set Availability
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Upcoming Sessions
                  </p>
                  <h3 className="mt-1 text-2xl font-bold text-deep-cocoa">
                    {stats.upcoming_sessions}
                  </h3>
                </div>
                <div className="rounded-full bg-blue-100 p-3 text-blue-600">
                  <Calendar className="h-6 w-6" />
                </div>
              </div>
              <Button
                variant="link"
                className="mt-4 p-0 text-blue-600 hover:cursor-pointer"
                onClick={handleViewSessions}
              >
                View schedule <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Completed Sessions
                  </p>
                  <h3 className="mt-1 text-2xl font-bold text-deep-cocoa">
                    {stats.completed_sessions}
                  </h3>
                </div>
                <div className="rounded-full bg-green-100 p-3 text-green-600">
                  <BookOpen className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                {stats.completed_sessions > 0 ? (
                  <span>Great job! Keep it up.</span>
                ) : (
                  <span>Start teaching to see your progress.</span>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Rating</p>
                  <h3 className="mt-1 text-2xl font-bold text-deep-cocoa">
                    {stats.average_rating.toFixed(1)}{" "}
                    <span className="text-sm font-normal text-gray-500">
                      ({stats.review_count})
                    </span>
                  </h3>
                </div>
                <div className="rounded-full bg-yellow-100 p-3 text-yellow-600">
                  <Star className="h-6 w-6" />
                </div>
              </div>
              <Button
                variant="link"
                className="mt-4 p-0 text-yellow-600 hover:cursor-pointer"
                onClick={handleViewReviews}
              >
                View reviews <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Estimated Earnings
                  </p>
                  <h3 className="mt-1 text-2xl font-bold text-deep-cocoa">
                    ${stats.estimated_earnings}
                  </h3>
                </div>
                <div className="rounded-full bg-green-100 p-3 text-green-600">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>
              <Button
                variant="link"
                className="mt-4 p-0 text-green-600 hover:cursor-pointer"
                onClick={handleViewEarnings}
              >
                View earnings <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl font-bold">
                Upcoming Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-gray-200"></div>
                        <div className="flex-1">
                          <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                          <div className="mt-2 h-3 w-1/2 rounded bg-gray-200"></div>
                        </div>
                      </div>
                      <Separator className="my-4" />
                    </div>
                  ))}
                </div>
              ) : upcomingSessions.length > 0 ? (
                <div className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={session.student_profile_image || ""}
                            alt={session.student_name}
                          />
                          <AvatarFallback className="bg-[#ffc6a8] text-deep-cocoa">
                            {session.student_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-deep-cocoa">
                              {session.student_name}
                            </h3>
                            <Badge className={getStatusColor(session.status)}>
                              {session.status.charAt(0).toUpperCase() +
                                session.status.slice(1)}
                            </Badge>
                          </div>
                          <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Clock className="mr-1 h-3 w-3" />
                              {formatDate(session.date)}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="mr-1 h-3 w-3" />
                              {getTimeUntil(session.date)}
                            </div>
                          </div>
                          <p className="mt-1 text-sm text-gray-700">
                            {session.topic}
                          </p>
                        </div>
                      </div>
                      <Separator className="my-4" />
                    </motion.div>
                  ))}

                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      className="border-[#ffc6a8] text-deep-cocoa hover:bg-[#fff2e7] hover:cursor-pointer"
                      onClick={handleViewSessions}
                    >
                      View All Sessions
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Calendar className="mb-2 h-12 w-12 text-gray-400" />
                  <h3 className="text-lg font-medium text-deep-cocoa">
                    No upcoming sessions
                  </h3>
                  <p className="mb-4 text-gray-500">
                    Set your availability to start receiving bookings
                  </p>
                  <Button
                    onClick={handleSetAvailability}
                    className="bg-[#ffc6a8] text-deep-cocoa hover:bg-[#ffb289] hover:cursor-pointer"
                  >
                    Set Availability
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-bold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-start border-[#ffc6a8] text-deep-cocoa hover:bg-[#fff2e7] hover:cursor-pointer"
                  onClick={handleSetAvailability}
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Set Your Availability
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start border-[#ffc6a8] text-deep-cocoa hover:bg-[#fff2e7] hover:cursor-pointer"
                  onClick={handleViewMessages}
                >
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Messages
                  {unreadMessages > 0 && (
                    <Badge className="ml-2 bg-red-500 text-white hover:bg-red-600 hover:cursor-pointer">
                      {unreadMessages}
                    </Badge>
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start border-[#ffc6a8] text-deep-cocoa hover:bg-[#fff2e7] hover:cursor-pointer"
                  onClick={() => router.push("/dashboard/expert/profile")}
                >
                  <Users className="mr-2 h-5 w-5" />
                  Edit Your Profile
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start border-[#ffc6a8] text-deep-cocoa hover:bg-[#fff2e7] hover:cursor-pointer"
                  onClick={handleViewEarnings}
                >
                  <DollarSign className="mr-2 h-5 w-5" />
                  View Earnings
                </Button>
              </div>

              <Separator className="my-6" />

              <div className="rounded-lg bg-[#fff8f0] p-4">
                <h3 className="mb-2 font-medium text-deep-cocoa">
                  Tips to Get More Students
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="mr-2 text-warm-coral">•</span>
                    Complete your profile with detailed information
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-warm-coral">•</span>
                    Set competitive rates and flexible availability
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-warm-coral">•</span>
                    Respond quickly to student messages
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-warm-coral">•</span>
                    Ask satisfied students to leave reviews
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
