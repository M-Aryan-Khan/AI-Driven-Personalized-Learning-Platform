"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "@/lib/axios"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Star, MessageCircle, Calendar, GraduationCap, AlertCircle } from 'lucide-react'
import { motion } from "framer-motion"

type Expert = {
  id: string
  first_name: string
  last_name: string
  profile_image?: string
  specialty: string
  hourly_rate: number
  rating: number
  tags?: string[]
  bio?: string
}

export default function ExpertsTab() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [experts, setExperts] = useState<Expert[]>([])
  const [favoriteExperts, setFavoriteExperts] = useState<Expert[]>([])

  useEffect(() => {
    fetchExperts()
  }, [])

  const fetchExperts = async () => {
    try {
      setLoading(true)
      
      // Fetch experts the student has had sessions with
      const response = await axios.get("/api/students/experts")
      
      // Sort by rating (highest first)
      const sortedExperts = response.data.sort((a: Expert, b: Expert) => b.rating - a.rating)
      
      setExperts(sortedExperts)
      
      // Fetch bookmarked/favorite experts
      try {
        const bookmarksResponse = await axios.get("/api/students/bookmarks")
        setFavoriteExperts(bookmarksResponse.data)
      } catch (error) {
        console.error("Error fetching bookmarks:", error)
        setFavoriteExperts([])
      }
    } catch (error) {
      console.error("Error fetching experts:", error)
      toast({
        title: "Error",
        description: "Failed to load your experts",
        variant: "destructive",
      })
      setExperts([])
    } finally {
      setLoading(false)
    }
  }

  const handleFindExperts = () => {
    router.push("/dashboard/student/find-tutors")
  }

  const handleViewExpert = (expertId: string) => {
    router.push(`/dashboard/student/experts/${expertId}`)
  }

  const handleScheduleLesson = (expertId: string) => {
    router.push(`/dashboard/student/lessons/schedule?expert=${expertId}`)
  }

  const handleMessage = (expertId: string) => {
    router.push(`/dashboard/student/messages?expert=${expertId}`)
  }

  const renderExpertCard = (expert: Expert) => {
    return (
      <motion.div
        key={expert.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row">
              <div className="flex items-center gap-4 border-b border-gray-100 bg-white p-4 md:w-2/3 md:border-b-0 md:border-r">
                <div className="flex-shrink-0">
                  {expert.profile_image ? (
                    <img
                      src={expert.profile_image || "/placeholder.svg"}
                      alt={`${expert.first_name} ${expert.last_name}`}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-[#ffc6a8] to-[#ffb289]">
                      <span className="text-lg font-bold text-white">
                        {expert.first_name.charAt(0)}
                        {expert.last_name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="font-medium text-deep-cocoa">
                      {expert.first_name} {expert.last_name}
                    </h3>
                    <div className="flex items-center">
                      <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{expert.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  
                  <h4 className="mt-1 text-gray-800">{expert.specialty}</h4>
                  
                  <div className="mt-2 flex flex-wrap gap-1">
                    {expert.tags?.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="bg-gray-50">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col justify-center gap-2 bg-gray-50 p-4 md:w-1/3">
                <Button
                  className="bg-[#ff9b7b] text-white hover:bg-[#ff8a63]"
                  onClick={() => handleScheduleLesson(expert.id)}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule
                </Button>
                
                <Button
                  variant="outline"
                  className="border-[#ffc6a8] text-deep-cocoa hover:bg-[#fff2e7]"
                  onClick={() => handleMessage(expert.id)}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Message
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
      <div className="mb-3 rounded-full bg-gray-100 p-3">
        <GraduationCap className="h-6 w-6 text-gray-400" />
      </div>
      <h3 className="mb-1 text-lg font-medium text-deep-cocoa">No experts found</h3>
      <p className="mb-4 text-gray-500">You haven't had any lessons with experts yet</p>
      <Button
        className="bg-[#ff9b7b] text-white hover:bg-[#ff8a63]"
        onClick={handleFindExperts}
      >
        Find Experts
      </Button>
    </div>
  )

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="overflow-hidden rounded-lg border border-gray-200">
            <div className="flex flex-col md:flex-row">
              <div className="flex items-center gap-4 p-4 md:w-2/3 md:border-r">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-center gap-2 bg-gray-50 p-4 md:w-1/3">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          className="bg-[#ff9b7b] text-white hover:bg-[#ff8a63]"
          onClick={handleFindExperts}
        >
          Find More Experts
        </Button>
      </div>

      {favoriteExperts.length > 0 && (
        <div>
          <h3 className="mb-3 font-medium text-deep-cocoa">Favorite Experts</h3>
          <div className="space-y-4">
            {favoriteExperts.map(renderExpertCard)}
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-3 font-medium text-deep-cocoa">Your Experts</h3>
        {experts.length > 0 ? (
          <div className="space-y-4">
            {experts.map(renderExpertCard)}
          </div>
        ) : (
          renderEmptyState()
        )}
      </div>
    </div>
  )
}
