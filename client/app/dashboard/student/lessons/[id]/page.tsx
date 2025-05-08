"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import axios from "@/lib/axios"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MessageSquare, Video } from "lucide-react"
import { motion } from "framer-motion"

type Session = {
  id: string
  expert_id: string
  expert_name: string
  expert_profile_image?: string
  student_id: string
  student_name: string
  student_profile_image?: string
  date: string
  duration: number
  topic: string
  notes?: string
  status: string
  meeting_link?: string
}

export default function LessonDetailsPage() {
  const { id } = useParams()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchSessionDetails = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`/api/students/sessions/${id}`)
        setSession(response.data)
      } catch (error) {
        console.error("Error fetching session details:", error)
        toast({
          title: "Error",
          description: "Failed to load lesson details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchSessionDetails()
    }
  }, [id, toast])

  const handleCancelLesson = async () => {
    try {
      await axios.post(`/api/students/sessions/${id}/cancel`)

      setSession({
        ...session!,
        status: "cancelled",
      })

      toast({
        title: "Success",
        description: "Lesson cancelled successfully",
      })
    } catch (error) {
      console.error("Error cancelling lesson:", error)
      toast({
        title: "Error",
        description: "Failed to cancel lesson",
        variant: "destructive",
      })
    }
  }

  const handleRescheduleLesson = () => {
    router.push(`/dashboard/student/lessons/schedule?expert=${session?.expert_id}`)
  }

  const handleJoinLesson = () => {
    if (session?.meeting_link) {
      window.open(session.meeting_link, "_blank")
    } else {
      toast({
        title: "Error",
        description: "Meeting link not available yet",
        variant: "destructive",
      })
    }
  }

  const handleMessageTutor = () => {
    router.push(`/dashboard/student/messages?expert=${session?.expert_id}`)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const isUpcoming = (dateString: string) => {
    const sessionDate = new Date(dateString)
    const now = new Date()
    return sessionDate > now
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <div className="animate-pulse">
          <div className="mb-6 h-8 w-3/4 rounded bg-gray-200"></div>
          <div className="mb-8 grid gap-6 md:grid-cols-3">
            <div className="h-64 rounded bg-gray-200"></div>
            <div className="col-span-2 space-y-4">
              <div className="h-6 w-1/2 rounded bg-gray-200"></div>
              <div className="h-4 rounded bg-gray-200"></div>
              <div className="h-4 rounded bg-gray-200"></div>
              <div className="h-10 w-full rounded bg-gray-200"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="container mx-auto max-w-4xl py-8 text-center">
        <h2 className="mb-4 text-2xl font-bold text-deep-cocoa">Lesson not found</h2>
        <p className="mb-6 text-gray-500">The lesson you're looking for doesn't exist or has been removed.</p>
        <Button
          onClick={() => router.push("/dashboard/student/lessons")}
          className="bg-[#ffc6a8] text-deep-cocoa hover:bg-[#ffb289] hover:cursor-pointer"
        >
          Back to lessons
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-deep-cocoa">Lesson details</h1>
        <Badge className={getStatusColor(session.status)}>
          {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
        </Badge>
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardContent className="p-4">
            <h2 className="mb-4 text-lg font-semibold text-deep-cocoa">Tutor</h2>

            <div className="flex flex-col items-center">
              <Avatar className="mb-4 h-24 w-24">
                <AvatarImage src={session.expert_profile_image || "/placeholder.svg"} alt={session.expert_name} />
                <AvatarFallback className="bg-[#ffc6a8] text-deep-cocoa">
                  {session.expert_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <h3 className="mb-1 text-center font-semibold text-deep-cocoa">{session.expert_name}</h3>

              <Button
                variant="outline"
                size="sm"
                className="mt-4 border-[#ffc6a8] text-deep-cocoa hover:bg-[#fff2e7] hover:cursor-pointer"
                onClick={handleMessageTutor}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Message tutor
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardContent className="p-6">
            <h2 className="mb-4 text-xl font-semibold text-deep-cocoa">{session.topic}</h2>

            <div className="mb-6 space-y-4">
              <div className="flex items-start">
                <Calendar className="mr-3 mt-0.5 h-5 w-5 text-[#ffc6a8]" />
                <div>
                  <p className="font-medium text-deep-cocoa">Date</p>
                  <p className="text-gray-600">{formatDate(session.date)}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Clock className="mr-3 mt-0.5 h-5 w-5 text-[#ffc6a8]" />
                <div>
                  <p className="font-medium text-deep-cocoa">Time</p>
                  <p className="text-gray-600">{formatTime(session.date)}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Clock className="mr-3 mt-0.5 h-5 w-5 text-[#ffc6a8]" />
                <div>
                  <p className="font-medium text-deep-cocoa">Duration</p>
                  <p className="text-gray-600">{session.duration} minutes</p>
                </div>
              </div>

              {session.notes && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="mb-2 font-medium text-deep-cocoa">Notes</p>
                  <p className="text-gray-600">{session.notes}</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {session.status === "scheduled" && isUpcoming(session.date) && (
                <>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button className="w-full bg-[#ff9b7b] text-white hover:bg-[#ff8a63] hover:cursor-pointer" onClick={handleJoinLesson}>
                      <Video className="mr-2 h-4 w-4" />
                      Join lesson
                    </Button>
                  </motion.div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 border-[#ffc6a8] text-deep-cocoa hover:bg-[#fff2e7] hover:cursor-pointer"
                      onClick={handleRescheduleLesson}
                    >
                      Reschedule
                    </Button>

                    <Button
                      variant="outline"
                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:cursor-pointer"
                      onClick={handleCancelLesson}
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              )}

              {session.status === "cancelled" && (
                <Button
                  className="w-full bg-[#ffc6a8] text-deep-cocoa hover:bg-[#ffb289] hover:cursor-pointer"
                  onClick={handleRescheduleLesson}
                >
                  Schedule new lesson
                </Button>
              )}

              {session.status === "completed" && (
                <Button
                  className="w-full bg-[#ffc6a8] text-deep-cocoa hover:bg-[#ffb289] hover:cursor-pointer"
                  onClick={handleRescheduleLesson}
                >
                  Book another lesson
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
