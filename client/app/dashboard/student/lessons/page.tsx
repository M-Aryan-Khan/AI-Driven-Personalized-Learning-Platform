"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, GraduationCap } from "lucide-react"
import LessonsTab from "@/components/dashboard/student/lessons-tab"
import CalendarTab from "@/components/dashboard/student/calendar-tab"
import TutorsTab from "@/components/dashboard/student/tutors-tab"
import { motion } from "framer-motion"

export default function MyLessons() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  const [activeTab, setActiveTab] = useState(tabParam || "lessons")
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true)
        // In a real app, this would be an API call
        // const response = await axios.get("/api/students/sessions")
        // setSessions(response.data)

        // For development, use empty array or mock data
        setSessions([])
      } catch (error) {
        // Silently handle error - don't show error messages
        console.error("Error fetching sessions:", error)
        setSessions([]) // Set empty array instead of showing error
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [])

  return (
    <div className="container mx-auto max-w-6xl">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <h1 className="text-3xl font-bold text-deep-cocoa">My lessons</h1>

        <div className="flex gap-2">
          <Button variant="outline" className="border-gray-300 text-gray-600 hover:bg-gray-50 hover:cursor-pointer">
            Transfer lessons or subscription
          </Button>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button className="bg-[#ff9b7b] text-white hover:bg-[#ff8a63] hover:cursor-pointer">Schedule lesson</Button>
          </motion.div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 w-full">
          <TabsTrigger value="lessons" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Lessons
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="tutors" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Tutors
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lessons">
          <LessonsTab />
        </TabsContent>

        <TabsContent value="calendar">
          <CalendarTab />
        </TabsContent>

        <TabsContent value="tutors">
          <TutorsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
