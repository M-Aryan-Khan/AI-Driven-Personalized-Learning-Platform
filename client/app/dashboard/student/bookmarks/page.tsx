"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "@/lib/axios"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Heart, MessageSquare, Star } from "lucide-react"
import { motion } from "framer-motion"

type Expert = {
  id: string
  first_name: string
  last_name: string
  profile_image?: string
  specialty: string
  hourly_rate: number
  rating: number
  tags: string[]
  bio: string
}

export default function BookmarksPage() {
  const [experts, setExperts] = useState<Expert[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchBookmarkedExperts = async () => {
      try {
        setLoading(true)
        const response = await axios.get("/api/students/bookmarks")
        setExperts(response.data)
      } catch (error) {
        console.error("Error fetching bookmarked experts:", error)
        toast({
          title: "Error",
          description: "Failed to load your bookmarked tutors",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchBookmarkedExperts()
  }, [toast])

  const handleRemoveBookmark = async (expertId: string) => {
    try {
      await axios.delete(`/api/students/bookmark/${expertId}`)
      setExperts(experts.filter((expert) => expert.id !== expertId))
      toast({
        title: "Success",
        description: "Tutor removed from bookmarks",
      })
    } catch (error) {
      console.error("Error removing bookmark:", error)
      toast({
        title: "Error",
        description: "Failed to remove bookmark",
        variant: "destructive",
      })
    }
  }

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
      <div className="container mx-auto max-w-6xl">
        <h1 className="mb-6 text-3xl font-bold text-deep-cocoa">Saved tutors</h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array(6)
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
            ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-6xl">
      <h1 className="mb-6 text-3xl font-bold text-deep-cocoa">Saved tutors</h1>

      {experts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <h2 className="mb-2 text-xl font-bold text-deep-cocoa">No saved tutors</h2>
            <p className="mb-6 text-gray-500">
              You haven&apos;t saved any tutors yet. Find tutors and bookmark them to see them here.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                className="bg-[#ffc6a8] text-deep-cocoa hover:bg-[#ffb289]"
                onClick={() => router.push("/dashboard/student/find-tutors")}
              >
                Find tutors
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {experts.map((expert) => (
            <motion.div key={expert.id} whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
              <Card className="overflow-hidden">
                <div className="cursor-pointer" onClick={() => handleExpertClick(expert.id)}>
                  <div className="relative h-40 bg-gray-100">
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
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 rounded-full bg-white/80 p-1 hover:bg-white"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveBookmark(expert.id)
                      }}
                    >
                      <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                    </Button>
                  </div>

                  <CardContent className="p-4">
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
                    <p className="line-clamp-2 text-sm text-gray-600">{expert.bio}</p>
                  </CardContent>
                </div>

                <CardFooter className="flex justify-between border-t bg-gray-50 p-4">
                  <div>
                    <p className="text-sm font-semibold text-deep-cocoa">${expert.hourly_rate.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">per hour</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-[#ffc6a8] text-deep-cocoa hover:bg-[#ffb289]"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleScheduleLesson(expert.id)
                      }}
                    >
                      Schedule
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-[#ffc6a8] text-deep-cocoa hover:bg-[#fff2e7]"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSendMessage(expert.id)
                      }}
                    >
                      <MessageSquare className="mr-1 h-4 w-4" />
                      Message
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
