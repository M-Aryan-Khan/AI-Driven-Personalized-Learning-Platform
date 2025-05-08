"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import axios from "@/lib/axios"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Star,
  Clock,
  MapPin,
  Globe,
  BookOpen,
  MessageCircle,
  Heart,
  CheckCircle,
  Briefcase,
  GraduationCap,
  Languages,
  User,
  Mail,
  Phone,
  FileText,
  Lightbulb,
  Calendar,
} from "lucide-react"
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
  languages: string[]
  experience_years: number
  completed_sessions: number
  education: string
  location?: string
  timezone?: string
  teaching_style?: string
  availability?: Record<string, string[]>
  what_to_expect?: string[]
  email?: string
  phone?: string
}

type Review = {
  id: string
  student_name: string
  student_profile_image?: string
  rating: number
  comment: string
  created_at: string
}

export default function ExpertProfile() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [expert, setExpert] = useState<Expert | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [bookmarked, setBookmarked] = useState(false)

  useEffect(() => {
    const fetchExpertData = async () => {
      try {
        setLoading(true)
        const expertResponse = await axios.get(`/api/students/experts/${params.id}`)

        // Ensure all required fields exist
        const expertData = {
          ...expertResponse.data,
          specialty: expertResponse.data.specialty || "General Tutoring",
          tags: expertResponse.data.tags || [],
          bio:
            expertResponse.data.bio ||
            `Experienced tutor specializing in ${expertResponse.data.specialty || "various subjects"}.`,
          languages: expertResponse.data.languages || ["English"],
          experience_years: expertResponse.data.experience_years || 0,
          completed_sessions: expertResponse.data.completed_sessions || 0,
          education: expertResponse.data.education || "Not specified",
          what_to_expect: expertResponse.data.what_to_expect || [
            "Initial assessment to understand your current level and learning goals",
            "Personalized learning plan based on your needs and objectives",
            "Interactive sessions with real-time feedback and practice exercises",
            "Regular progress tracking to adjust the learning plan as needed",
          ],
          email: expertResponse.data.email || "contact@synapse.edu",
          phone: expertResponse.data.phone || "+1 (555) 123-4567",
        }

        setExpert(expertData)

        // Check if expert is bookmarked
        const bookmarksResponse = await axios.get("/api/students/bookmarks")
        const bookmarkedExperts = bookmarksResponse.data.map((expert: Expert) => expert.id)
        setBookmarked(bookmarkedExperts.includes(params.id as string))

        // Fetch reviews
        try {
          const reviewsResponse = await axios.get(`/api/reviews/expert/${params.id}`)
          setReviews(reviewsResponse.data)
        } catch (error) {
          console.error("Error fetching reviews:", error)
          setReviews([])
        }
      } catch (error) {
        console.error("Error fetching expert:", error)
        toast({
          title: "Error",
          description: "Failed to load tutor profile",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchExpertData()
    }
  }, [params.id, toast])

  const handleBookmark = async () => {
    try {
      if (bookmarked) {
        await axios.delete(`/api/students/bookmark/${params.id}`)
        setBookmarked(false)
        toast({
          title: "Success",
          description: "Tutor removed from bookmarks",
        })
      } else {
        await axios.post(`/api/students/bookmark/${params.id}`)
        setBookmarked(true)
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
    router.push(`/dashboard/student/lessons/schedule?expert=${params.id}`)
  }

  const handleSendMessage = () => {
    router.push(`/dashboard/student/messages?expert=${params.id}`)
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl">
        <div className="animate-pulse">
          <div className="mb-8 flex flex-col gap-6 md:flex-row">
            <div className="h-48 w-48 rounded-lg bg-gray-200"></div>
            <div className="flex-1">
              <div className="mb-2 h-8 w-3/4 rounded bg-gray-200"></div>
              <div className="mb-4 h-4 w-1/2 rounded bg-gray-200"></div>
              <div className="mb-6 h-24 w-full rounded bg-gray-200"></div>
              <div className="flex gap-2">
                <div className="h-10 w-32 rounded bg-gray-200"></div>
                <div className="h-10 w-32 rounded bg-gray-200"></div>
              </div>
            </div>
          </div>
          <div className="h-12 w-full rounded bg-gray-200"></div>
          <div className="mt-6 h-64 w-full rounded bg-gray-200"></div>
        </div>
      </div>
    )
  }

  if (!expert) {
    return (
      <div className="container mx-auto max-w-6xl">
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow">
          <h3 className="mb-2 text-xl font-semibold text-deep-cocoa">Tutor not found</h3>
          <p className="text-gray-500">The tutor you're looking for doesn't exist or has been removed.</p>
          <Button
            className="mt-4 bg-[#ffc6a8] text-deep-cocoa hover:bg-[#ffb289]"
            onClick={() => router.push("/dashboard/student/find-tutors")}
          >
            Back to Tutors
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-6xl">
      <div className="mb-8 flex flex-col gap-6 md:flex-row">
        <div className="md:w-1/3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="sticky top-24"
          >
            <Card className="overflow-hidden shadow-md">
              <CardContent className="p-0">
                <div className="relative">
                  {expert.profile_image ? (
                    <img
                      src={expert.profile_image || "/placeholder.svg"}
                      alt={`${expert.first_name} ${expert.last_name}`}
                      className="h-64 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-64 w-full items-center justify-center bg-gradient-to-r from-[#ffc6a8] to-[#ffb289]">
                      <span className="text-6xl font-bold text-white">
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
                    <Heart className={`h-5 w-5 ${bookmarked ? "fill-red-500 text-red-500" : "text-gray-500"}`} />
                  </Button>
                </div>

                <div className="p-4">
                  <h1 className="mb-1 text-2xl font-bold text-deep-cocoa">
                    {expert.first_name} {expert.last_name}
                  </h1>
                  <p className="mb-3 text-gray-600">{expert.specialty}</p>

                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex items-center text-amber-500">
                      <Star className="mr-1 h-5 w-5 fill-amber-500" />
                      <span className="font-medium">{expert.rating.toFixed(1)}</span>
                    </div>
                    <Separator orientation="vertical" className="h-4" />
                    <div className="flex items-center text-gray-500">
                      <CheckCircle className="mr-1 h-4 w-4" />
                      <span>{expert.completed_sessions} sessions</span>
                    </div>
                  </div>

                  <div className="mb-4 flex flex-wrap gap-2">
                    {expert.tags?.map((tag) => (
                      <Badge key={tag} variant="outline" className="bg-[#fff8f0] text-deep-cocoa">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Clock className="mr-2 h-4 w-4" />
                      <span>{expert.experience_years} years</span>
                    </div>
                    {expert.location && (
                      <div className="flex items-center text-gray-600">
                        <MapPin className="mr-2 h-4 w-4" />
                        <span>{expert.location}</span>
                      </div>
                    )}
                    {expert.timezone && (
                      <div className="flex items-center text-gray-600">
                        <Globe className="mr-2 h-4 w-4" />
                        <span>{expert.timezone}</span>
                      </div>
                    )}
                    <div className="flex items-center text-gray-600">
                      <Languages className="mr-2 h-4 w-4" />
                      <span>{expert.languages?.join(", ")}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-xl font-bold text-deep-cocoa">${expert.hourly_rate.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">per hour</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      className="w-full bg-[#ff9b7b] text-white hover:bg-[#ff8a63]"
                      onClick={handleScheduleLesson}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule Lesson
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-[#ffc6a8] text-deep-cocoa hover:bg-[#fff2e7]"
                      onClick={handleSendMessage}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Send Message
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="mb-6 shadow-md">
              <CardContent className="p-6">
                <div className="mb-6">
                  <h2 className="mb-3 text-xl font-semibold text-deep-cocoa">About Me</h2>
                  <p className="whitespace-pre-line text-gray-700">{expert.bio}</p>
                </div>

                <Separator className="my-6" />

                <div className="mb-6">
                  <h2 className="mb-3 flex items-center text-xl font-semibold text-deep-cocoa">
                    <GraduationCap className="mr-2 h-5 w-5" />
                    Education
                  </h2>
                  <p className="text-gray-700">{expert.education}</p>
                </div>

                <Separator className="my-6" />

                <div className="mb-6">
                  <h2 className="mb-3 flex items-center text-xl font-semibold text-deep-cocoa">
                    <Briefcase className="mr-2 h-5 w-5" />
                    Experience
                  </h2>
                  <div className="flex items-center text-gray-700">
                    <span className="font-medium">{expert.experience_years} years</span>
                    <span className="mx-2">•</span>
                    <span>{expert.completed_sessions} completed sessions</span>
                  </div>
                </div>

                {expert.teaching_style && (
                  <>
                    <Separator className="my-6" />
                    <div>
                      <h2 className="mb-3 flex items-center text-xl font-semibold text-deep-cocoa">
                        <BookOpen className="mr-2 h-5 w-5" />
                        Teaching Style
                      </h2>
                      <p className="text-gray-700">{expert.teaching_style}</p>
                    </div>
                  </>
                )}

                <Separator className="my-6" />

                <div>
                  <h2 className="mb-3 flex items-center text-xl font-semibold text-deep-cocoa">
                    <User className="mr-2 h-5 w-5" />
                    Contact Information
                  </h2>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-700">
                      <Mail className="mr-2 h-4 w-4 text-gray-500" />
                      <span>{expert.email}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Phone className="mr-2 h-4 w-4 text-gray-500" />
                      <span>{expert.phone}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="mb-6 shadow-md">
              <CardContent className="p-6">
                <h2 className="mb-4 text-xl font-semibold text-deep-cocoa">Lesson Packages</h2>

                <div className="grid gap-4 md:grid-cols-3">
                  <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }} className="h-full">
                    <Card className="h-full flex flex-col border-2 border-[#ffc6a8]">
                      <CardContent className="p-4 flex-grow">
                        <h3 className="mb-2 text-lg font-semibold text-deep-cocoa">Single Lesson</h3>
                        <p className="mb-3 text-sm text-gray-600">Perfect for trying out or occasional sessions</p>
                        <p className="mb-1 text-xl font-bold text-deep-cocoa">${expert.hourly_rate.toFixed(2)}</p>
                        <p className="mb-4 text-xs text-gray-500">per hour</p>
                        <Button
                          className="w-full mt-auto bg-[#ffc6a8] text-deep-cocoa hover:bg-[#ffb289]"
                          onClick={handleScheduleLesson}
                        >
                          Book Now
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }} className="h-full">
                    <Card className="h-full flex flex-col border-2 border-[#ff9b7b]">
                      <CardContent className="p-4 flex-grow">
                        <div className="mb-2 rounded-full bg-[#ff9b7b] px-2 py-1 text-center text-xs font-medium text-white">
                          POPULAR
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-deep-cocoa">5 Lesson Package</h3>
                        <p className="mb-3 text-sm text-gray-600">Save 5% on regular sessions</p>
                        <p className="mb-1 text-xl font-bold text-deep-cocoa">
                          ${(expert.hourly_rate * 0.95).toFixed(2)}
                        </p>
                        <p className="mb-4 text-xs text-gray-500">per hour (5% off)</p>
                        <Button
                          className="w-full mt-auto bg-[#ff9b7b] text-white hover:bg-[#ff8a63]"
                          onClick={handleScheduleLesson}
                        >
                          Book Package
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }} className="h-full">
                    <Card className="h-full flex flex-col border-2 border-gray-200">
                      <CardContent className="p-4 flex-grow">
                        <h3 className="mb-2 text-lg font-semibold text-deep-cocoa">10 Lesson Package</h3>
                        <p className="mb-3 text-sm text-gray-600">Save 10% on regular sessions</p>
                        <p className="mb-1 text-xl font-bold text-deep-cocoa">
                          ${(expert.hourly_rate * 0.9).toFixed(2)}
                        </p>
                        <p className="mb-4 text-xs text-gray-500">per hour (10% off)</p>
                        <Button
                          variant="outline"
                          className="w-full mt-auto border-[#ffc6a8] text-deep-cocoa hover:bg-[#fff2e7]"
                          onClick={handleScheduleLesson}
                        >
                          Book Package
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="mb-6 shadow-md">
              <CardContent className="p-6">
                <h2 className="mb-4 text-xl font-semibold text-deep-cocoa">What to Expect</h2>

                <div className="space-y-4">
                  {expert.what_to_expect?.map((item, index) => (
                    <div key={index} className="flex items-start">
                      <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#ffc6a8] text-deep-cocoa">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-gray-700">{item}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <h2 className="mb-4 text-xl font-semibold text-deep-cocoa">Learning Resources</h2>
                  <div className="rounded-lg border border-gray-200 bg-[#fff8f0] p-4">
                    <div className="mb-4 flex items-start">
                      <FileText className="mr-3 mt-1 h-5 w-5 text-deep-cocoa" />
                      <div>
                        <h3 className="font-medium text-deep-cocoa">Course Materials</h3>
                        <p className="text-sm text-gray-600">
                          Access to comprehensive study materials, practice exercises, and reference guides.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Lightbulb className="mr-3 mt-1 h-5 w-5 text-deep-cocoa" />
                      <div>
                        <h3 className="font-medium text-deep-cocoa">Personalized Approach</h3>
                        <p className="text-sm text-gray-600">
                          Lessons are tailored to your learning style, pace, and specific goals.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="mb-6 shadow-md">
              <CardContent className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-deep-cocoa">Student Reviews</h2>
                  <div className="flex items-center">
                    <Star className="mr-1 h-5 w-5 fill-amber-500 text-amber-500" />
                    <span className="font-medium">{expert.rating.toFixed(1)}</span>
                  </div>
                </div>

                {reviews.length === 0 ? (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
                    <h3 className="mb-2 text-lg font-medium text-deep-cocoa">No Reviews Yet</h3>
                    <p className="text-gray-500">Be the first to leave a review after your lesson!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <motion.div
                        key={review.id}
                        className="rounded-lg border border-gray-200 p-4"
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="mb-3 flex items-center">
                          <Avatar className="mr-3 h-10 w-10">
                            {review.student_profile_image ? (
                              <AvatarImage
                                src={review.student_profile_image || "/placeholder.svg"}
                                alt={review.student_name}
                              />
                            ) : (
                              <AvatarFallback className="bg-[#ffc6a8] text-white">
                                {review.student_name[0]}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <p className="font-medium text-deep-cocoa">{review.student_name}</p>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating ? "fill-amber-500 text-amber-500" : "text-gray-300"
                                  }`}
                                />
                              ))}
                              <span className="ml-2 text-xs text-gray-500">
                                {new Date(review.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex justify-center"
          >
            <Button
              className="bg-[#ff9b7b] text-white hover:bg-[#ff8a63] px-8"
              onClick={handleScheduleLesson}
              size="lg"
            >
              <Calendar className="mr-2 h-5 w-5" />
              Schedule a Lesson Now
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
