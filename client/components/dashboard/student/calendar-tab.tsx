"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "@/lib/axios"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
  isToday,
} from "date-fns"
import { ChevronLeft, ChevronRight, CalendarIcon, Clock, AlertCircle } from 'lucide-react'

type Session = {
  id: string
  expert_id: string
  expert_name: string
  expert_profile_image?: string
  date: string
  duration: number
  topic: string
  description?: string
  status: string
  meeting_link?: string
}

export default function CalendarTab() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [sessions, setSessions] = useState<Session[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const response = await axios.get("/api/students/sessions")
      setSessions(response.data)
    } catch (error) {
      console.error("Error fetching sessions:", error)
      toast({
        title: "Error",
        description: "Failed to load your lessons",
        variant: "destructive",
      })
      setSessions([])
    } finally {
      setLoading(false)
    }
  }

  const handleScheduleLesson = () => {
    router.push("/dashboard/student/find-tutors")
  }

  const handleViewSession = (sessionId: string) => {
    router.push(`/dashboard/student/lessons/${sessionId}`)
  }

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const getSessionsForDay = (day: Date) => {
    return sessions.filter((session) => {
      const sessionDate = new Date(session.date)
      return isSameDay(sessionDate, day)
    })
  }

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

    // Create array of week arrays for rendering
    const weeks: Date[][] = []
    let week: Date[] = []

    // Add empty cells for days before the first of the month
    const firstDayOfMonth = monthStart.getDay()
    for (let i = 0; i < firstDayOfMonth; i++) {
      week.push(new Date(0)) // placeholder
    }

    // Add the days of the month
    days.forEach((day) => {
      week.push(day)
      if (week.length === 7) {
        weeks.push(week)
        week = []
      }
    })

    // Add empty cells for days after the last of the month
    if (week.length > 0) {
      for (let i = week.length; i < 7; i++) {
        week.push(new Date(0)) // placeholder
      }
      weeks.push(week)
    }

    return (
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="flex items-center justify-between bg-gray-50 px-4 py-3">
          <h3 className="font-medium text-deep-cocoa">{format(currentMonth, "MMMM yyyy")}</h3>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 text-center text-xs font-medium text-gray-500">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 divide-x divide-y divide-gray-200">
          {weeks.map((week, weekIndex) =>
            week.map((day, dayIndex) => {
              const isValidDay = day.getTime() !== 0
              const isCurrentMonth = isValidDay && isSameMonth(day, currentMonth)
              const isCurrentDay = isValidDay && isToday(day)
              const dayClasses = `min-h-[100px] p-2 ${
                isCurrentMonth ? "bg-white" : "bg-gray-50 text-gray-400"
              } ${isCurrentDay ? "font-bold" : ""}`

              const sessionsForDay = isValidDay ? getSessionsForDay(day) : []

              return (
                <div key={`${weekIndex}-${dayIndex}`} className={dayClasses}>
                  {isValidDay && (
                    <>
                      <div className="mb-1 text-right text-sm">{format(day, "d")}</div>
                      <div className="space-y-1">
                        {sessionsForDay.map((session) => {
                          const sessionDate = new Date(session.date)
                          return (
                            <div
                              key={session.id}
                              className={`cursor-pointer rounded px-1 py-0.5 text-xs ${
                                session.status === "scheduled"
                                  ? "bg-blue-50 text-blue-700"
                                  : session.status === "completed"
                                  ? "bg-green-50 text-green-700"
                                  : "bg-red-50 text-red-700"
                              }`}
                              onClick={() => handleViewSession(session.id)}
                            >
                              <div className="font-medium truncate">{format(sessionDate, "h:mm a")}</div>
                              <div className="truncate">{session.topic}</div>
                            </div>
                          )
                        })}
                      </div>
                    </>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return <Skeleton className="h-[600px] w-full rounded-lg" />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          className="bg-[#ff9b7b] text-white hover:bg-[#ff8a63]"
          onClick={handleScheduleLesson}
        >
          Schedule Lesson
        </Button>
      </div>

      {sessions.length > 0 ? (
        renderCalendar()
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
          <div className="mb-3 rounded-full bg-gray-100 p-3">
            <CalendarIcon className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="mb-1 text-lg font-medium text-deep-cocoa">No lessons scheduled</h3>
          <p className="mb-4 text-gray-500">Schedule your first lesson to see it on the calendar</p>
          <Button
            className="bg-[#ff9b7b] text-white hover:bg-[#ff8a63]"
            onClick={handleScheduleLesson}
          >
            Schedule a Lesson
          </Button>
        </div>
      )}

      {sessions.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-3 font-medium text-deep-cocoa">Upcoming Lessons</h3>
          <div className="space-y-3">
            {sessions
              .filter((session) => session.status === "scheduled")
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .slice(0, 3)
              .map((session) => {
                const sessionDate = new Date(session.date)
                return (
                  <Card
                    key={session.id}
                    className="flex cursor-pointer items-center justify-between p-3 hover:bg-gray-50"
                    onClick={() => handleViewSession(session.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff2e7]">
                        <CalendarIcon className="h-5 w-5 text-[#ff9b7b]" />
                      </div>
                      <div>
                        <h4 className="font-medium text-deep-cocoa">{session.topic}</h4>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span>{format(sessionDate, "MMM d, yyyy")}</span>
                          <span className="flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {format(sessionDate, "h:mm a")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                      {session.duration} min
                    </Badge>
                  </Card>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}
