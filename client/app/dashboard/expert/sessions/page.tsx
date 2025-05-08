"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Search, Filter, ChevronDown, X, MessageSquare, FileText } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import axios from "@/lib/axios"

type Session = {
  id: string
  student_name: string
  student_id: string
  student_profile_image?: string
  date: string
  duration: number
  topic: string
  description?: string
  status: string
  meeting_link?: string
  notes?: string
}

export default function ExpertSessions() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [sessions, setSessions] = useState<Session[]>([])
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([])
  const [activeTab, setActiveTab] = useState("upcoming")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [showSessionDetails, setShowSessionDetails] = useState(false)
  const [meetingLink, setMeetingLink] = useState("")
  const [sessionNotes, setSessionNotes] = useState("")
  const [savingSession, setSavingSession] = useState(false)

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true)

        const response = await axios.get("/api/experts/sessions")
        setSessions(response.data)
      } catch (error) {
        console.error("Error fetching sessions:", error)
        toast({
          title: "Error",
          description: "Failed to load sessions",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [toast])

  useEffect(() => {
    // Filter sessions based on active tab, search term, and status filter
    let filtered = [...sessions]

    // Filter by tab
    if (activeTab === "upcoming") {
      filtered = filtered.filter((session) => session.status === "scheduled" && new Date(session.date) > new Date())
    } else if (activeTab === "past") {
      filtered = filtered.filter((session) => session.status === "completed" || new Date(session.date) < new Date())
    } else if (activeTab === "cancelled") {
      filtered = filtered.filter((session) => session.status === "cancelled")
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (session) =>
          session.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          session.topic.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((session) => session.status === statusFilter)
    }

    // Sort by date
    filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    setFilteredSessions(filtered)
  }, [sessions, activeTab, searchTerm, statusFilter])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
  }

  const handleResetFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
  }

  const handleViewSessionDetails = (session: Session) => {
    setSelectedSession(session)
    setMeetingLink(session.meeting_link || "")
    setSessionNotes(session.notes || "")
    setShowSessionDetails(true)
  }

  const handleCloseSessionDetails = () => {
    setShowSessionDetails(false)
    setSelectedSession(null)
  }

  const handleUpdateSession = async () => {
    if (!selectedSession) return

    try {
      setSavingSession(true)

      const updateData = {
        meeting_link: meetingLink,
        notes: sessionNotes,
      }

      await axios.put(`/api/experts/sessions/${selectedSession.id}`, updateData)

      // Update session in state
      setSessions(
        sessions.map((session) =>
          session.id === selectedSession.id ? { ...session, meeting_link: meetingLink, notes: sessionNotes } : session,
        ),
      )

      toast({
        title: "Success",
        description: "Session updated successfully",
      })

      handleCloseSessionDetails()
    } catch (error) {
      console.error("Error updating session:", error)
      toast({
        title: "Error",
        description: "Failed to update session",
        variant: "destructive",
      })
    } finally {
      setSavingSession(false)
    }
  }

  const handleCompleteSession = async () => {
    if (!selectedSession) return

    try {
      setSavingSession(true)

      await axios.put(`/api/experts/sessions/${selectedSession.id}`, {
        status: "completed",
        notes: sessionNotes,
      })

      // Update session in state
      setSessions(
        sessions.map((session) =>
          session.id === selectedSession.id ? { ...session, status: "completed", notes: sessionNotes } : session,
        ),
      )

      toast({
        title: "Success",
        description: "Session marked as completed",
      })

      handleCloseSessionDetails()
    } catch (error) {
      console.error("Error completing session:", error)
      toast({
        title: "Error",
        description: "Failed to complete session",
        variant: "destructive",
      })
    } finally {
      setSavingSession(false)
    }
  }

  const handleCancelSession = async () => {
    if (!selectedSession) return

    try {
      setSavingSession(true)

      await axios.put(`/api/experts/sessions/${selectedSession.id}`, {
        status: "cancelled",
      })

      // Update session in state
      setSessions(
        sessions.map((session) => (session.id === selectedSession.id ? { ...session, status: "cancelled" } : session)),
      )

      toast({
        title: "Success",
        description: "Session cancelled successfully",
      })

      handleCloseSessionDetails()
    } catch (error) {
      console.error("Error cancelling session:", error)
      toast({
        title: "Error",
        description: "Failed to cancel session",
        variant: "destructive",
      })
    } finally {
      setSavingSession(false)
    }
  }

  const handleMessageStudent = (studentId: string) => {
    router.push(`/dashboard/expert/messages?student=${studentId}`)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const isSessionInPast = (dateString: string) => {
    return new Date(dateString) < new Date()
  }

  return (
    <div className="container mx-auto max-w-6xl">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-deep-cocoa">Sessions</h1>
          <p className="text-gray-600">Manage your teaching sessions</p>
        </div>

        <Button
          onClick={() => router.push("/dashboard/expert/availability")}
          className="bg-warm-coral text-white hover:bg-[#ff8c61]"
        >
          <Calendar className="mr-2 h-4 w-4" />
          Set Availability
        </Button>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by student name or topic..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="flex items-center gap-2 border-[#ffc6a8] text-deep-cocoa hover:bg-[#fff2e7]"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
                Filters
                <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
              </Button>

              {statusFilter !== "all" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-deep-cocoa"
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
                      <label className="mb-2 block text-sm font-medium text-gray-700">Status</label>
                      <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All statuses</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-gray-200"></div>
                      <div className="flex-1">
                        <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                        <div className="mt-2 h-3 w-1/2 rounded bg-gray-200"></div>
                      </div>
                    </div>
                    <Separator className="my-4" />
                  </div>
                ))}
              </div>
            ) : filteredSessions.length > 0 ? (
              <div className="space-y-4">
                {filteredSessions.map((session) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="cursor-pointer rounded-lg border border-gray-200 p-4 hover:border-[#ffc6a8] hover:bg-[#fff8f0]"
                    onClick={() => handleViewSessionDetails(session)}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={session.student_profile_image || ""} alt={session.student_name} />
                        <AvatarFallback className="bg-[#ffc6a8] text-deep-cocoa">
                          {session.student_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                          <h3 className="font-medium text-deep-cocoa">{session.student_name}</h3>
                          <Badge className={getStatusColor(session.status)}>
                            {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="mt-1 flex flex-col gap-1 text-sm text-gray-500 sm:flex-row sm:items-center sm:gap-4">
                          <div className="flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {formatDate(session.date)}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            {session.duration} minutes
                          </div>
                        </div>
                        <p className="mt-1 text-sm text-gray-700">{session.topic}</p>
                      </div>
                      <div className="flex gap-2 self-end sm:self-center">
                        {session.status === "scheduled" && !isSessionInPast(session.date) && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-[#ffc6a8] text-deep-cocoa hover:bg-[#fff2e7]"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMessageStudent(session.student_id)
                            }}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#ffc6a8] text-deep-cocoa hover:bg-[#fff2e7]"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewSessionDetails(session)
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-gray-200 p-8 text-center">
                <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-xl font-semibold text-deep-cocoa">No sessions found</h3>
                <p className="text-gray-500">
                  {activeTab === "upcoming"
                    ? "You don't have any upcoming sessions. Set your availability to receive bookings."
                    : activeTab === "past"
                      ? "You don't have any past sessions yet."
                      : "You don't have any cancelled sessions."}
                </p>
                {activeTab === "upcoming" && (
                  <Button
                    onClick={() => router.push("/dashboard/expert/availability")}
                    className="mt-4 bg-[#ffc6a8] text-deep-cocoa hover:bg-[#ffb289]"
                  >
                    Set Availability
                  </Button>
                )}
              </div>
            )}
          </Tabs>
        </CardContent>
      </Card>

      {/* Session Details Modal */}
      {showSessionDetails && selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-lg bg-white p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-deep-cocoa">Session Details</h2>
              <Button variant="ghost" size="sm" onClick={handleCloseSessionDetails}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="mb-6 flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={selectedSession.student_profile_image || ""} alt={selectedSession.student_name} />
                <AvatarFallback className="bg-[#ffc6a8] text-deep-cocoa">
                  {selectedSession.student_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-medium text-deep-cocoa">{selectedSession.student_name}</h3>
                <Badge className={getStatusColor(selectedSession.status)}>
                  {selectedSession.status.charAt(0).toUpperCase() + selectedSession.status.slice(1)}
                </Badge>
              </div>
            </div>

            <div className="mb-6 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-gray-500">Date & Time</p>
                <p className="text-deep-cocoa">{formatDate(selectedSession.date)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Duration</p>
                <p className="text-deep-cocoa">{selectedSession.duration} minutes</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Topic</p>
                <p className="text-deep-cocoa">{selectedSession.topic}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <p className="text-deep-cocoa">
                  {selectedSession.status.charAt(0).toUpperCase() + selectedSession.status.slice(1)}
                </p>
              </div>
            </div>

            {selectedSession.description && (
              <div className="mb-6">
                <p className="mb-1 text-sm font-medium text-gray-500">Description</p>
                <p className="rounded-md bg-gray-50 p-3 text-deep-cocoa">{selectedSession.description}</p>
              </div>
            )}

            <div className="mb-6">
              <label className="mb-1 block text-sm font-medium text-gray-500">Meeting Link</label>
              <Input
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="Add Zoom/Google Meet link here"
                disabled={selectedSession.status === "cancelled"}
              />
            </div>

            <div className="mb-6">
              <label className="mb-1 block text-sm font-medium text-gray-500">Session Notes</label>
              <textarea
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="Add notes about the session here"
                className="w-full rounded-md border border-gray-300 p-3 focus:border-[#ffc6a8] focus:outline-none focus:ring-1 focus:ring-[#ffc6a8]"
                rows={4}
                disabled={selectedSession.status === "cancelled"}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                className="border-[#ffc6a8] text-deep-cocoa hover:bg-[#fff2e7]"
                onClick={() => handleMessageStudent(selectedSession.student_id)}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Message Student
              </Button>

              {selectedSession.status === "scheduled" && (
                <>
                  <Button
                    className="bg-warm-coral text-white hover:bg-[#ff8c61]"
                    onClick={handleUpdateSession}
                    disabled={savingSession}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    {savingSession ? "Saving..." : "Save Changes"}
                  </Button>

                  {!isSessionInPast(selectedSession.date) && (
                    <Button
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                      onClick={handleCancelSession}
                      disabled={savingSession}
                    >
                      Cancel Session
                    </Button>
                  )}

                  {isSessionInPast(selectedSession.date) && (
                    <Button
                      className="bg-green-600 text-white hover:bg-green-700"
                      onClick={handleCompleteSession}
                      disabled={savingSession}
                    >
                      Mark as Completed
                    </Button>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
