"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "@/lib/axios"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { format, parseISO, isPast, isToday, isFuture } from "date-fns"
import { Calendar, Clock, GraduationCap, Star, MessageCircle, Video, FileText, AlertCircle } from 'lucide-react'
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

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
  notes?: string
  materials?: string[]
  recording_url?: string
}

export default function LessonsTab() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [sessions, setSessions] = useState<Session[]>([])
  const [activeTab, setActiveTab] = useState("upcoming")
  const [reviewSession, setReviewSession] = useState<Session | null>(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState("")
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const response = await axios.get("/api/students/sessions")
      
      // Convert date strings to Date objects for sorting
      const sessionsWithParsedDates = response.data.map((session: Session) => ({
        ...session,
        parsedDate: new Date(session.date)
      }))
      
      // Sort by date (ascending for upcoming, descending for past)
      sessionsWithParsedDates.sort((a: any, b: any) => a.parsedDate - b.parsedDate)
      
      setSessions(sessionsWithParsedDates)
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

  const handleJoinSession = (meetingLink: string) => {
    window.open(meetingLink, "_blank")
  }

  const openReviewDialog = (session: Session) => {
    setReviewSession(session)
    setReviewRating(5)
    setReviewComment("")
    setReviewDialogOpen(true)
  }

  const submitReview = async () => {
    if (!reviewSession) return

    try {
      setSubmittingReview(true)
      
      await axios.post(`/api/reviews/expert/${reviewSession.expert_id}`, {
        rating: reviewRating,
        comment: reviewComment
      })
      
      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
      })
      
      setReviewDialogOpen(false)
    } catch (error: any) {
      console.error("Error submitting review:", error)
      
      if (error.response?.status === 400 && error.response?.data?.detail?.includes("already reviewed")) {
        toast({
          title: "Already Reviewed",
          description: "You have already submitted a review for this session",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to submit your review. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setSubmittingReview(false)
    }
  }

  const getUpcomingSessions = () => {
    return sessions.filter(session => 
      (session.status === "scheduled" || session.status === "confirmed") && 
      isFuture(new Date(session.date))
    )
  }

  const getCompletedSessions = () => {
    return sessions.filter(session => 
      session.status === "completed" || 
      (isPast(new Date(session.date)) && session.status === "scheduled")
    )
  }

  const getCancelledSessions = () => {
    return sessions.filter(session => session.status === "cancelled")
  }

  const renderSessionCard = (session: Session) => {
    const sessionDate = new Date(session.date)
    const isPastSession = isPast(sessionDate)
    const isTodaySession = isToday(sessionDate)
    
    return (
      <motion.div
        key={session.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row">
              <div className="flex items-center gap-4 border-b border-gray-100 bg-white p-4 md:w-2/3 md:border-b-0 md:border-r">
                <div className="flex-shrink-0">
                  {session.expert_profile_image ? (
                    <img
                      src={session.expert_profile_image || "/placeholder.svg"}
                      alt={session.expert_name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-[#ffc6a8] to-[#ffb289]">
                      <span className="text-lg font-bold text-white">
                        {session.expert_name?.charAt(0) || "E"}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="font-medium text-deep-cocoa">{session.expert_name}</h3>
                    <Badge
                      variant="outline"
                      className={`
                        ${session.status === "scheduled" ? "border-blue-200 bg-blue-50 text-blue-700" : ""}
                        ${session.status === "completed" ? "border-green-200 bg-green-50 text-green-700" : ""}
                        ${session.status === "cancelled" ? "border-red-200 bg-red-50 text-red-700" : ""}
                      `}
                    >
                      {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                    </Badge>
                  </div>
                  
                  <h4 className="mt-1 font-medium text-gray-800">{session.topic}</h4>
                  
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-4 w-4" />
                      <span>{format(sessionDate, "MMM d, yyyy")}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      <span>{format(sessionDate, "h:mm a")} ({session.duration} min)</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col justify-center gap-2 bg-gray-50 p-4 md:w-1/3">
                {session.status === "scheduled" && !isPastSession && (
                  <>
                    <Button
                      variant="outline"
                      className="border-[#ffc6a8] text-deep-cocoa hover:bg-[#fff2e7]"
                      onClick={() => handleViewSession(session.id)}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                    
                    {session.meeting_link && isTodaySession && (
                      <Button
                        className="bg-[#ff9b7b] text-white hover:bg-[#ff8a63]"
                        onClick={() => handleJoinSession(session.meeting_link!)}
                      >
                        <Video className="mr-2 h-4 w-4" />
                        Join Session
                      </Button>
                    )}
                  </>
                )}
                
                {session.status === "completed" && (
                  <>
                    <Button
                      variant="outline"
                      className="border-[#ffc6a8] text-deep-cocoa hover:bg-[#fff2e7]"
                      onClick={() => handleViewSession(session.id)}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                    
                    <Button
                      className="bg-[#ff9b7b] text-white hover:bg-[#ff8a63]"
                      onClick={() => openReviewDialog(session)}
                    >
                      <Star className="mr-2 h-4 w-4" />
                      Leave Review
                    </Button>
                  </>
                )}
                
                {session.status === "cancelled" && (
                  <Button
                    variant="outline"
                    className="border-gray-200 text-gray-600 hover:bg-gray-50"
                    onClick={() => handleViewSession(session.id)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  const renderEmptyState = (message: string) => (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
      <div className="mb-3 rounded-full bg-gray-100 p-3">
        <AlertCircle className="h-6 w-6 text-gray-400" />
      </div>
      <h3 className="mb-1 text-lg font-medium text-deep-cocoa">No lessons found</h3>
      <p className="mb-4 text-gray-500">{message}</p>
      <Button
        className="bg-[#ff9b7b] text-white hover:bg-[#ff8a63]"
        onClick={handleScheduleLesson}
      >
        Schedule a Lesson
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
                  <div className="flex gap-4">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-24" />
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

  const upcomingSessions = getUpcomingSessions()
  const completedSessions = getCompletedSessions()
  const cancelledSessions = getCancelledSessions()

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="upcoming">Upcoming ({upcomingSessions.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedSessions.length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({cancelledSessions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingSessions.length > 0 ? (
            upcomingSessions.map(renderSessionCard)
          ) : (
            renderEmptyState("You don't have any upcoming lessons scheduled")
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedSessions.length > 0 ? (
            completedSessions.map(renderSessionCard)
          ) : (
            renderEmptyState("You haven't completed any lessons yet")
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          {cancelledSessions.length > 0 ? (
            cancelledSessions.map(renderSessionCard)
          ) : (
            renderEmptyState("You don't have any cancelled lessons")
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Leave a Review</DialogTitle>
          </DialogHeader>
          
          {reviewSession && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {reviewSession.expert_profile_image ? (
                    <img
                      src={reviewSession.expert_profile_image || "/placeholder.svg"}
                      alt={reviewSession.expert_name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[#ffc6a8] to-[#ffb289]">
                      <span className="text-base font-bold text-white">
                        {reviewSession.expert_name?.charAt(0) || "E"}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-deep-cocoa">{reviewSession.expert_name}</h4>
                  <p className="text-sm text-gray-500">{reviewSession.topic}</p>
                </div>
              </div>
              
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setReviewRating(rating)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          rating <= reviewRating
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-gray-200 text-gray-200"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Your Review</label>
                <Textarea
                  placeholder="Share your experience with this expert..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReviewDialogOpen(false)}
              disabled={submittingReview}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#ff9b7b] text-white hover:bg-[#ff8a63]"
              onClick={submitReview}
              disabled={!reviewComment || submittingReview}
            >
              {submittingReview ? "Submitting..." : "Submit Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
