"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, Search, Filter, ChevronDown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

type Review = {
  id: string
  student_id: string
  student_name: string
  student_profile_image?: string
  rating: number
  comment: string
  created_at: string
  session_topic?: string
}

export default function ExpertReviews() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState<Review[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [ratingFilter, setRatingFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [showFilters, setShowFilters] = useState(false)
  const [stats, setStats] = useState({
    average_rating: 0,
    total_reviews: 0,
    rating_breakdown: {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    },
  })

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true)

        // In a real app, you would fetch from your API
        // For now, we'll simulate with mock data

        // Mock reviews data
        const mockReviews: Review[] = [
          {
            id: "r1",
            student_id: "s1",
            student_name: "John Doe",
            student_profile_image: "",
            rating: 5,
            comment: "Excellent teacher! Very patient and explains concepts clearly. I learned a lot in our session.",
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            session_topic: "React Fundamentals",
          },
          {
            id: "r2",
            student_id: "s2",
            student_name: "Jane Smith",
            student_profile_image: "",
            rating: 4,
            comment: "Great session, very helpful with my project. Would book again.",
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            session_topic: "Node.js API Development",
          },
          {
            id: "r3",
            student_id: "s3",
            student_name: "Alice Johnson",
            student_profile_image: "",
            rating: 5,
            comment: "Amazing teacher! Helped me understand complex concepts in a simple way.",
            created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            session_topic: "Data Structures",
          },
          {
            id: "r4",
            student_id: "s4",
            student_name: "Bob Brown",
            student_profile_image: "",
            rating: 3,
            comment: "Good session, but we ran out of time before covering everything I wanted to learn.",
            created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            session_topic: "Python Basics",
          },
        ]

        setReviews(mockReviews)

        // Calculate stats
        const totalReviews = mockReviews.length
        const totalRating = mockReviews.reduce((sum, review) => sum + review.rating, 0)
        const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0

        // Calculate rating breakdown
        const ratingBreakdown = {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0,
        }

        mockReviews.forEach((review) => {
          ratingBreakdown[review.rating as keyof typeof ratingBreakdown]++
        })

        setStats({
          average_rating: averageRating,
          total_reviews: totalReviews,
          rating_breakdown: ratingBreakdown,
        })
      } catch (error) {
        console.error("Error fetching reviews:", error)
        toast({
          title: "Error",
          description: "Failed to load reviews",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [toast])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleRatingFilterChange = (value: string) => {
    setRatingFilter(value)
  }

  const handleSortByChange = (value: string) => {
    setSortBy(value)
  }

  const handleResetFilters = () => {
    setSearchTerm("")
    setRatingFilter("all")
    setSortBy("newest")
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getFilteredAndSortedReviews = () => {
    let filtered = [...reviews]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (review) =>
          review.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (review.session_topic && review.session_topic.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Filter by rating
    if (ratingFilter !== "all") {
      const ratingValue = Number.parseInt(ratingFilter)
      filtered = filtered.filter((review) => review.rating === ratingValue)
    }

    // Sort
    if (sortBy === "newest") {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } else if (sortBy === "oldest") {
      filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    } else if (sortBy === "highest") {
      filtered.sort((a, b) => b.rating - a.rating)
    } else if (sortBy === "lowest") {
      filtered.sort((a, b) => a.rating - b.rating)
    }

    return filtered
  }

  const filteredReviews = getFilteredAndSortedReviews()

  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`}
        />
      ))
  }

  const calculateRatingPercentage = (rating: number) => {
    if (stats.total_reviews === 0) return 0
    return (stats.rating_breakdown[rating as keyof typeof stats.rating_breakdown] / stats.total_reviews) * 100
  }

  return (
    <div className="container mx-auto max-w-6xl">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-deep-cocoa">Reviews</h1>
          <p className="text-gray-600">See what your students are saying about your teaching</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Rating Summary</CardTitle>
              <CardDescription>Based on {stats.total_reviews} reviews</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <div className="text-5xl font-bold text-deep-cocoa">{stats.average_rating.toFixed(1)}</div>
                <div className="mt-2 flex items-center">{renderStars(Math.round(stats.average_rating))}</div>
                <p className="mt-1 text-sm text-gray-500">{stats.total_reviews} reviews</p>
              </div>

              <Separator className="my-6" />

              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-2">
                    <div className="flex w-24 items-center">
                      <span className="mr-1 text-sm font-medium">{rating}</span>
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full rounded-full bg-yellow-400"
                          style={{ width: `${calculateRatingPercentage(rating)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-10 text-right text-sm text-gray-500">
                      {stats.rating_breakdown[rating as keyof typeof stats.rating_breakdown]}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-lg bg-[#fff8f0] p-4 text-sm text-deep-cocoa">
                <p className="font-medium">Tips for getting more reviews:</p>
                <ul className="mt-2 list-inside list-disc space-y-1">
                  <li>Ask students to leave a review after a successful session</li>
                  <li>Provide exceptional value in every session</li>
                  <li>Follow up with students after sessions</li>
                  <li>Respond to any concerns promptly</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>All Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search reviews..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="pl-10"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 border-[#ffc6a8] text-deep-cocoa hover:bg-[#fff2e7] hover:cursor-pointer"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                    <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
                  </Button>

                  {(ratingFilter !== "all" || sortBy !== "newest") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-deep-cocoa hover:cursor-pointer"
                      onClick={handleResetFilters}
                    >
                      <X className="mr-1 h-4 w-4" />
                      Reset
                    </Button>
                  )}
                </div>
              </div>

              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-6 overflow-hidden"
                  >
                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="grid gap-6 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">Rating</label>
                          <Select value={ratingFilter} onValueChange={handleRatingFilterChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Filter by rating" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All ratings</SelectItem>
                              <SelectItem value="5">5 stars</SelectItem>
                              <SelectItem value="4">4 stars</SelectItem>
                              <SelectItem value="3">3 stars</SelectItem>
                              <SelectItem value="2">2 stars</SelectItem>
                              <SelectItem value="1">1 star</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">Sort By</label>
                          <Select value={sortBy} onValueChange={handleSortByChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="newest">Newest first</SelectItem>
                              <SelectItem value="oldest">Oldest first</SelectItem>
                              <SelectItem value="highest">Highest rating</SelectItem>
                              <SelectItem value="lowest">Lowest rating</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {loading ? (
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                        <div className="flex-1">
                          <div className="h-4 w-1/3 rounded bg-gray-200"></div>
                          <div className="mt-2 h-3 w-1/4 rounded bg-gray-200"></div>
                          <div className="mt-3 h-3 w-full rounded bg-gray-200"></div>
                          <div className="mt-2 h-3 w-full rounded bg-gray-200"></div>
                          <div className="mt-2 h-3 w-2/3 rounded bg-gray-200"></div>
                        </div>
                      </div>
                      <Separator className="my-6" />
                    </div>
                  ))}
                </div>
              ) : filteredReviews.length > 0 ? (
                <div className="space-y-6">
                  {filteredReviews.map((review) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-start gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={review.student_profile_image || ""} alt={review.student_name} />
                          <AvatarFallback className="bg-[#ffc6a8] text-deep-cocoa">
                            {review.student_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                            <h3 className="font-medium text-deep-cocoa">{review.student_name}</h3>
                            <p className="text-sm text-gray-500">{formatDate(review.created_at)}</p>
                          </div>

                          <div className="mt-1 flex items-center">
                            {renderStars(review.rating)}
                            {review.session_topic && (
                              <span className="ml-3 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                                {review.session_topic}
                              </span>
                            )}
                          </div>

                          <p className="mt-2 text-gray-700">{review.comment}</p>
                        </div>
                      </div>
                      <Separator className="my-6" />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="rounded-full bg-gray-100 p-3">
                    <Star className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-deep-cocoa">No reviews found</h3>
                  <p className="text-gray-500">
                    {searchTerm || ratingFilter !== "all"
                      ? "Try adjusting your filters"
                      : "You don't have any reviews yet"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
