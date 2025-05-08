"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare, Star } from 'lucide-react'
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"

type Expert = {
  id: string
  first_name: string
  last_name: string
  profile_image?: string
  specialty: string
  hourly_rate: number
  rating: number
}

export default function ExpertsTab() {
  const [experts, setExperts] = useState<Expert[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchBookmarkedExperts = async () => {
      try {
        setLoading(true)
        const response = await axios.get("/api/students/bookmarks")
        
        if (response.data && Array.isArray(response.data)) {
          setExperts(response.data)
        } else {
          setExperts([])
        }
      } catch (error) {
        console.error("Error fetching bookmarked experts:", error)
        setExperts([])
      } finally {
        setLoading(false)
      }
    }

    fetchBookmarkedExperts()
  }, [])

  const handleExpertClick = (expertId: string) => {
    router.push(`/dashboard/student/experts/${expertId}`)
  }

  const handleScheduleLesson = (expertId: string) => {
    router.push(`/dashboard/student/lessons/schedule?expert=${expertId}`)
  }

  const handleSendMessage = (expertId: string) => {
    router.push(`/dashboard/student/messages?expert=${expertId}`)
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="h-40 bg-gray-100">
                  <Skeleton className="h-full w-full" />
                </div>
                <div className="p-4">
                  <Skeleton className="mb-2 h-4 w-3/4" />
                  <Skeleton className="mb-4 h-3 w-1/2" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    )
  }

  if (experts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <h2 className="mb-2 text-xl font-bold text-deep-cocoa">No experts yet</h2>
          <p className="mb-6 text-gray-500">
            You haven&apos;t saved any experts yet. Find experts and bookmark them to see them here.
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              className="bg-[#ffc6a8] text-deep-cocoa hover:bg-[#ffb289]"
              onClick={() => router.push("/dashboard/student/find-tutors")}
            >
              Find experts
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {experts.map((expert) => (
        <Card key={expert.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="cursor-pointer" onClick={() => handleExpertClick(expert.id)}>
              <div className="h-40 bg-gray-100">
                {expert.profile_image ? (
                  <img
                    src={expert.profile_image || "/placeholder.svg"}
                    alt={`${expert.first_name} ${expert.last_name}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#ffc6a8]">
                    <span className="text-2xl font-bold text-deep-cocoa">
                      {expert.first_name[0]}
                      {expert.last_name[0]}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="mb-1 flex items-center">
                  <h3 className="mr-2 font-semibold text-deep-cocoa">
                    {expert.first_name} {expert.last_name}
                  </h3>
                  <div className="flex items-center text-sm text-amber-500">
                    <Star className="mr-1 h-4 w-4 fill-amber-500" />
                    {expert.rating.toFixed(1)}
                  </div>
                </div>
                <p className="mb-2 text-sm text-gray-500">{expert.specialty}</p>
                <p className="mb-4 text-sm font-semibold text-deep-cocoa">${expert.hourly_rate.toFixed(2)} per hour</p>

                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-[#ffc6a8] text-deep-cocoa hover:bg-[#ffb289]"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleScheduleLesson(expert.id)
                    }}
                  >
                    Schedule
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-[#ffc6a8] text-deep-cocoa hover:bg-[#fff2e7]"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSendMessage(expert.id)
                    }}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
