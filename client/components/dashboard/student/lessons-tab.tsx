"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import axios from "@/lib/axios"
import { format } from "date-fns"
import { Calendar, Clock } from 'lucide-react'

type Session = {
  id: string
  expert_id: string
  expert_name: string
  expert_profile_image?: string
  date: string
  duration: number
  topic: string
  status: string
}

export default function LessonsTab() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true)
        const response = await axios.get("/api/students/sessions")
        
        if (response.data && response.data.length > 0) {
          // Sort sessions by date (ascending)
          const sortedSessions = response.data.sort((a: Session, b: Session) => 
            new Date(a.date).getTime() - new Date(b.date).getTime()
          )
          
          // Filter only future sessions with status "scheduled"
          const upcomingSessions = sortedSessions.filter((session: Session) => 
            new Date(session.date) > new Date() && session.status === "scheduled"
          )
          
          setSessions(upcomingSessions)
        } else {
          setSessions([])
        }
      } catch (error) {
        console.error("Error fetching sessions:", error)
        toast({
          title: "Error",
          description: "Failed to load your lessons. Please try again.",
          variant: "destructive",
        })
        setSessions([])
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [toast])

  const handleScheduleLesson = () => {
    router.push("/dashboard/student/find-tutors")
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="h-24 rounded-lg bg-gray-200"></div>
          ))}
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <h2 className="mb-2 text-xl font-bold text-deep-cocoa">No upcoming lessons</h2>
          <p className="mb-6 text-gray-500">
            Don&apos;t put your goals on hold!
            <br />
            Schedule your next lesson now to see progress.
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button className="bg-[#ffc6a8] text-deep-cocoa hover:bg-[#ffb289]" onClick={handleScheduleLesson}>
              Schedule lesson
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => (
        <Card key={session.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row">
              <div className="flex items-center gap-4 border-b border-gray-100 bg-white p-4 md:w-2/3 md:border-b-0 md:border-r">
                <div className="h-12 w-12 overflow-hidden rounded-full bg-gray-100">
                  {session.expert_profile_image ? (
                    <img
                      src={session.expert_profile_image || "/placeholder.svg"}
                      alt={session.expert_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#ffc6a8]">
                      <span className="text-sm font-bold text-deep-cocoa">
                        {session.expert_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-deep-cocoa">{session.expert_name}</h3>
                  <p className="text-sm text-gray-500">{session.topic}</p>
                  <div className="mt-1 flex items-center text-sm text-gray-500">
                    <Calendar className="mr-1 h-4 w-4" />
                    <span className="mr-2">
                      {format(new Date(session.date), "EEE, MMM d, yyyy")}
                    </span>
                    <Clock className="mr-1 h-4 w-4" />
                    <span>
                      {format(new Date(session.date), "h:mm a")}
                    </span>
                    <span className="ml-2">({session.duration} min)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between bg-gray-50 p-4 md:w-1/3">
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium capitalize text-green-800">
                  {session.status}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#ffc6a8] text-deep-cocoa hover:bg-[#fff2e7]"
                  onClick={() => router.push(`/dashboard/student/lessons/${session.id}`)}
                >
                  Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
