"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import axios from "@/lib/axios"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, Heart, MessageSquare, Star } from "lucide-react"
import { motion } from "framer-motion"

type Expert = {
  id: string
  first_name: string
  last_name: string
  email: string
  profile_image?: string
  specialty: string
  hourly_rate: number
  rating: number
  tags: string[]
  bio: string
  experience_years: number
  languages: string[]
  education: string
  completed_sessions: number
}

export default function ExpertProfile() {
  const { id } = useParams()
  const [expert, setExpert] = useState<Expert | null>(null)
  const [loading, setLoading] = useState(true)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchExpertDetails = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`/api/students/experts/${id}`)
        setExpert(response.data)

        // Check if expert is bookmarked
        const bookmarksResponse = await axios.get("/api/students/bookmarks")
        const bookmarkedIds = bookmarksResponse.data.map((expert: Expert) => expert.id)
        setIsBookmarked(bookmarkedIds.includes(id))
      } catch (error) {
        console.error("Error fetching expert details:", error)
        toast({
          title: "Error",
          description: "Failed to load tutor details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchExpertDetails()
    }
  }, [id, toast])

  const handleBookmark = async () => {
    try {
      if (isBookmarked) {
        await axios.delete(`/api/students/bookmark/${id}`)
        setIsBookmarked(false)
        toast({
          title: "Success",
          description: "Tutor removed from bookmarks",
        })
      } else {
        await axios.post(`/api/students/bookmark/${id}`)
        setIsBookmarked(true)
        toast({
          title: "Success",
          description: "Tutor added to bookmarks",
        })
      }
    } catch (error) {
      console.error("Error updating bookmark:", error)
      toast({
        title: "Error",
        description: "Failed to update bookmarks",
        variant: "destructive",
      })
    }
  }

  const handleScheduleLesson = () => {
    router.push(`/dashboard/student/lessons/schedule?expert=${id}`)
  }

  const handleSendMessage = () => {
    router.push(`/dashboard/student/messages?expert=${id}`)
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

  if (!expert) {
    return (
      <div className="container mx-auto max-w-4xl py-8 text-center">
        <h2 className="mb-4 text-2xl font-bold text-deep-cocoa">Tutor not found</h2>
        <p className="mb-6 text-gray-500">The tutor you're looking for doesn't exist or has been removed.</p>
        <Button
          onClick={() => router.push("/dashboard/student/find-tutors")}
          className="bg-[#ffc6a8] text-deep-cocoa hover:bg-[#ffb289]"
        >
          Browse Tutors
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl">
      <div className="mb-8 grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <div className="mb-4 overflow-hidden rounded-lg bg-white shadow">
            <div className="relative h-64 bg-gray-100">
              {expert.profile_image ? (
                <img
                  src={expert.profile_image || "/placeholder.svg"}
                  alt={`${expert.first_name} ${expert.last_name}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#ffc6a8]">
                  <span className="text-4xl font-bold text-deep-cocoa">
                    {expert.first_name[0]}
                    {expert.last_name[0]}
                  </span>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 rounded-full bg-white/80 p-1 hover:bg-white"
                onClick={handleBookmark}
              >
                <Heart className={`h-5 w-5 ${isBookmarked ? "fill-red-500 text-red-500" : "text-gray-500"}`} />
              </Button>
            </div>
            <div className="p-4">
              <div className="mb-2 flex items-center">
                <h1 className="mr-2 text-xl font-bold text-deep-cocoa">
                  {expert.first_name} {expert.last_name}
                </h1>
                <div className="flex items-center text-amber-500">
                  <Star className="mr-1 h-4 w-4 fill-amber-500" />
                  {expert.rating.toFixed(1)}
                </div>
              </div>
              <p className="mb-4 text-gray-600">{expert.specialty}</p>

              <div className="mb-4">
                <p className="text-lg font-semibold text-deep-cocoa">
                  ${expert.hourly_rate.toFixed(2)}
                  <span className="text-sm font-normal text-gray-500"> / hour</span>
                </p>
              </div>

              <div className="space-y-2">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button className="w-full bg-[#ff9b7b] text-white hover:bg-[#ff8a63]" onClick={handleScheduleLesson}>
                    Schedule lesson
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="outline"
                    className="w-full border-[#ffc6a8] text-deep-cocoa hover:bg-[#fff2e7]"
                    onClick={handleSendMessage}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Send message
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>

          <Card>
            <CardContent className="p-4">
              <h3 className="mb-2 font-semibold text-deep-cocoa">Languages</h3>
              <div className="mb-4 flex flex-wrap gap-2">
                {expert.languages?.map((language) => (
                  <span key={language} className="rounded-full bg-[#fff2e7] px-3 py-1 text-sm text-deep-cocoa">
                    {language}
                  </span>
                ))}
              </div>

              <h3 className="mb-2 font-semibold text-deep-cocoa">Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {expert.tags?.map((tag) => (
                  <span key={tag} className="rounded-full bg-[#fff2e7] px-3 py-1 text-sm text-deep-cocoa">
                    {tag}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Tabs defaultValue="about">
            <TabsList className="mb-4 w-full">
              <TabsTrigger value="about" className="flex-1">
                About
              </TabsTrigger>
              <TabsTrigger value="schedule" className="flex-1">
                Schedule
              </TabsTrigger>
              <TabsTrigger value="reviews" className="flex-1">
                Reviews
              </TabsTrigger>
            </TabsList>

            <TabsContent value="about">
              <Card>
                <CardContent className="p-6">
                  <h2 className="mb-4 text-xl font-bold text-deep-cocoa">About me</h2>
                  <p className="mb-6 whitespace-pre-line text-gray-700">{expert.bio}</p>

                  <div className="mb-6 grid gap-4 md:grid-cols-2">
                    <div className="flex items-center">
                      <Clock className="mr-2 h-5 w-5 text-[#ffc6a8]" />
                      <div>
                        <p className="font-semibold text-deep-cocoa">Experience</p>
                        <p className="text-gray-600">{expert.experience_years} years</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-5 w-5 text-[#ffc6a8]" />
                      <div>
                        <p className="font-semibold text-deep-cocoa">Completed sessions</p>
                        <p className="text-gray-600">{expert.completed_sessions}</p>
                      </div>
                    </div>
                  </div>

                  <h3 className="mb-2 text-lg font-semibold text-deep-cocoa">Education</h3>
                  <p className="text-gray-700">{expert.education}</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schedule">
              <Card>
                <CardContent className="p-6">
                  <h2 className="mb-4 text-xl font-bold text-deep-cocoa">Availability</h2>
                  <p className="mb-6 text-gray-600">
                    To see the tutor's availability and schedule a lesson, click the button below.
                  </p>
                  <Button className="bg-[#ffc6a8] text-deep-cocoa hover:bg-[#ffb289]" onClick={handleScheduleLesson}>
                    Schedule lesson
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews">
              <Card>
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-deep-cocoa">Reviews</h2>
                    <div className="flex items-center">
                      <Star className="mr-1 h-5 w-5 fill-amber-500 text-amber-500" />
                      <span className="font-semibold">{expert.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
                    <p className="text-gray-600">No reviews yet</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
