"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "@/lib/axios"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { format, addDays, startOfWeek, endOfWeek, isSameDay, parseISO } from "date-fns"

type Session = {
  id: string
  expert_id: string
  expert_name: string
  date: string
  duration: number
  topic: string
  status: string
}

export default function CalendarTab() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [currentView, setCurrentView] = useState<"week" | "day">("week")
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true)
        const response = await axios.get("/api/students/sessions")
        
        if (response.data && Array.isArray(response.data)) {
          // Filter only scheduled sessions
          const scheduledSessions = response.data.filter((session: Session) => 
            session.status === "scheduled"
          )
          setSessions(scheduledSessions)
        } else {
          setSessions([])
        }
      } catch (error) {
        console.error("Error fetching sessions:", error)
        toast({
          title: "Error",
          description: "Failed to load your sessions. Please try again.",
          variant: "destructive",
        })
        setSessions([])
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [toast])

  const getWeekDates = () => {
    const dates = []
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 }) // 0 = Sunday
    
    for (let i = 0; i < 7; i++) {
      dates.push(addDays(weekStart, i))
    }

    return dates
  }

  const weekDates = getWeekDates()

  const getTimeSlots = () => {
    const slots = []
    for (let hour = 0; hour < 25; hour++) {
      slots.push(`${hour}:00`)
    }
    return slots
  }

  const timeSlots = getTimeSlots()

  const handlePrevWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() - 7)
    setCurrentDate(newDate)
  }

  const handleNextWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + 7)
    setCurrentDate(newDate)
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const formatWeekRange = () => {
    const startDate = weekDates[0]
    const endDate = weekDates[6]
    return `${format(startDate, "MMM d")} – ${format(endDate, "MMM d, yyyy")}`
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return isSameDay(date, today)
  }

  const getSessionsForDateAndTime = (date: Date, timeSlot: string) => {
    const hour = parseInt(timeSlot.split(":")[0])
    
    return sessions.filter((session) => {
      const sessionDate = new Date(session.date)
      return (
        isSameDay(sessionDate, date) &&
        sessionDate.getHours() === hour
      )
    })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-[600px] w-full rounded-lg" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevWeek} className="h-8 w-8 rounded-full p-0 hover:cursor-pointer">
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="sm" onClick={handleToday} className="h-8 rounded-full hover:cursor-pointer">
            Today
          </Button>

          <Button variant="outline" size="icon" onClick={handleNextWeek} className="h-8 w-8 rounded-full p-0 hover:cursor-pointer">
            <ChevronRight className="h-4 w-4" />
          </Button>

          <h2 className="ml-2 text-lg font-semibold text-deep-cocoa">{formatWeekRange()}</h2>
        </div>

        <div className="flex gap-2">
          <Button
            variant={currentView === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentView("week")}
            className={currentView === "week" ? "bg-[#ffc6a8] text-deep-cocoa hover:bg-[#ffb289] hover:cursor-pointer" : "hover:cursor-pointer"}
          >
            Week
          </Button>

          <Button
            variant={currentView === "day" ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentView("day")}
            className={currentView === "day" ? "bg-[#ffc6a8] text-deep-cocoa hover:bg-[#ffb289] hover:cursor-pointer" : "hover:cursor-pointer"}
          >
            Day
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-8 border-b">
            <div className="border-r p-2 text-center text-xs font-medium text-gray-500">Time</div>
            {weekDates.map((date, index) => (
              <div key={index} className={`p-2 text-center ${isToday(date) ? "bg-[#fff2e7]" : ""}`}>
                <div className="text-xs font-medium text-gray-500">
                  {format(date, "EEE")}
                </div>
                <div className={`text-sm font-semibold ${isToday(date) ? "text-deep-cocoa" : ""}`}>
                  {format(date, "d")}
                </div>
              </div>
            ))}
          </div>

          <div className="h-[600px] overflow-y-auto">
            {timeSlots.map((timeSlot, timeIndex) => (
              <div key={timeSlot} className="grid grid-cols-8 border-b">
                <div className="border-r p-2 text-center text-xs font-medium text-gray-500">{timeSlot}</div>

                {weekDates.map((date, dateIndex) => {
                  const sessionsAtSlot = getSessionsForDateAndTime(date, timeSlot)

                  return (
                    <div
                      key={dateIndex}
                      className={`relative min-h-[60px] border-r p-1 ${isToday(date) ? "bg-[#fff2e7]/30" : ""}`}
                    >
                      {sessionsAtSlot.map((session) => (
                        <motion.div
                          key={session.id}
                          whileHover={{ scale: 1.02 }}
                          className="cursor-pointer rounded bg-[#ffc6a8] p-1 text-xs text-deep-cocoa"
                          onClick={() => router.push(`/dashboard/student/lessons/${session.id}`)}
                        >
                          <div className="font-medium">{session.expert_name}</div>
                          <div className="truncate">{session.topic}</div>
                          <div className="text-xs opacity-75">
                            {format(parseISO(session.date), "h:mm a")}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
