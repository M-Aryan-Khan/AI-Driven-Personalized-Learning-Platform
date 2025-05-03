"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { User } from "lucide-react"

export default function StudentDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [sessionCount, setSessionCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true)

        // Check if we have a token
        const token = localStorage.getItem("token")
        if (!token) {
          console.error("No token found in localStorage")
          setSessionCount(0)
          setLoading(false)
          return
        }

        // For development, use mock data
        if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_USE_MOCK === "true") {
          setSessionCount(0)
          setLoading(false)
          return
        }

        // In a real app, this would be an API call
        // Try to fetch sessions to verify authentication is working
        try {
          const response = await fetch("/api/students/sessions", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (response.ok) {
            const data = await response.json()
            setSessionCount(data.length || 0)
          } else {
            console.error("Failed to fetch sessions:", response.status)
            setSessionCount(0)
          }
        } catch (error) {
          console.error("Error fetching sessions:", error)
          setSessionCount(0)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [])

  const handleFindTutors = () => {
    router.push("/dashboard/student/find-tutors")
  }

  const handleScheduleLesson = () => {
    router.push("/dashboard/student/lessons?tab=calendar")
  }

  return (
    <div className="container mx-auto max-w-5xl">
      <div className="mb-8 rounded-lg bg-[#fff2e7] p-6">
        <h1 className="mb-2 text-2xl font-bold text-deep-cocoa">How&apos;s it going, {user?.first_name || "there"}?</h1>
        <h2 className="mb-6 text-3xl font-bold text-deep-cocoa">Get extra hours to continue learning</h2>

        <div className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-col items-center">
            <div className="mb-4 h-20 w-20 overflow-hidden rounded-full bg-gray-100">
              {user?.profile_image ? (
                <img
                  src={user.profile_image || "/placeholder.svg"}
                  alt={user.first_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#ffc6a8]">
                  <User size={40} className="text-deep-cocoa" />
                </div>
              )}
            </div>
            <h3 className="text-2xl font-bold text-deep-cocoa">{sessionCount} lessons</h3>
            <p className="text-gray-500">on your balance</p>
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              className="mb-4 w-full bg-[#ff9b7b] text-white hover:bg-[#ff8a63]"
              size="lg"
              onClick={handleScheduleLesson}
            >
              Add extra lessons
            </Button>
          </motion.div>

          <Button variant="link" className="w-full text-deep-cocoa" onClick={handleFindTutors}>
            Upgrade subscription
          </Button>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-bold text-deep-cocoa">Subscriptions</h2>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <h3 className="mb-2 text-xl font-semibold text-deep-cocoa">No active subscriptions</h3>
              <p className="mb-4 text-gray-500">Subscribe to a tutor to get regular lessons</p>
              <Button onClick={handleFindTutors} className="bg-[#ffc6a8] text-deep-cocoa hover:bg-[#ffb289]">
                Find tutors
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold text-deep-cocoa">Recommended tutors</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array(3)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="animate-pulse">
                      <div className="h-40 bg-gray-200"></div>
                      <div className="p-4">
                        <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
                        <div className="mb-4 h-3 w-1/2 rounded bg-gray-200"></div>
                        <div className="h-8 w-full rounded bg-gray-200"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
          ) : (
            <Card className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="mb-4 text-gray-500">Find tutors to start your learning journey</p>
                  <Button onClick={handleFindTutors} className="bg-[#ffc6a8] text-deep-cocoa hover:bg-[#ffb289]">
                    Browse tutors
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  )
}
