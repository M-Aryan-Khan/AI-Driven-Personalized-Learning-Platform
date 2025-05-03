"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import axios from "@/lib/axios"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Clock } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

type Expert = {
  id: string
  first_name: string
  last_name: string
  profile_image?: string
  specialty: string
  hourly_rate: number
  rating: number
}

export default function ScheduleLessonPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const expertParam = searchParams.get("expert")
  const router = useRouter()
  const { toast } = useToast()

  const [expert, setExpert] = useState<Expert | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [date, setDate] = useState<Date | undefined>(undefined)
  const [time, setTime] = useState<string>("")
  const [duration, setDuration] = useState<string>("60")
  const [topic, setTopic] = useState<string>("")
  const [notes, setNotes] = useState<string>("")

  useEffect(() => {
    const fetchExpertDetails = async () => {
      if (!expertParam) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await axios.get(`/api/students/experts/${expertParam}`)
        setExpert(response.data)
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

    fetchExpertDetails()
  }, [expertParam, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!date || !time || !duration || !topic) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (!expert) {
      toast({
        title: "Error",
        description: "Please select a tutor",
        variant: "destructive",
      })
      return
    }

    // Combine date and time
    const [hours, minutes] = time.split(":").map(Number)
    const lessonDate = new Date(date)
    lessonDate.setHours(hours, minutes)

    try {
      setSubmitting(true)

      const response = await axios.post("/api/students/sessions", {
        expert_id: expert.id,
        student_id: user?.id,
        date: lessonDate.toISOString(),
        duration: Number.parseInt(duration),
        topic,
        notes,
      })

      toast({
        title: "Success",
        description: "Lesson scheduled successfully",
      })

      router.push(`/dashboard/student/lessons/${response.data.session_id}`)
    } catch (error) {
      console.error("Error scheduling lesson:", error)
      toast({
        title: "Error",
        description: "Failed to schedule lesson",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const timeSlots = [
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
    "19:00",
    "19:30",
  ]

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

  return (
    <div className="container mx-auto max-w-4xl">
      <h1 className="mb-6 text-3xl font-bold text-deep-cocoa">Schedule lesson</h1>

      <form onSubmit={handleSubmit}>
        <div className="mb-8 grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardContent className="p-4">
              <h2 className="mb-4 text-lg font-semibold text-deep-cocoa">Selected Tutor</h2>

              {expert ? (
                <div className="flex flex-col items-center">
                  <Avatar className="mb-4 h-24 w-24">
                    <AvatarImage
                      src={expert.profile_image || "/placeholder.svg"}
                      alt={`${expert.first_name} ${expert.last_name}`}
                    />
                    <AvatarFallback className="bg-[#ffc6a8] text-deep-cocoa">
                      {expert.first_name[0]}
                      {expert.last_name[0]}
                    </AvatarFallback>
                  </Avatar>

                  <h3 className="mb-1 text-center font-semibold text-deep-cocoa">
                    {expert.first_name} {expert.last_name}
                  </h3>
                  <p className="mb-2 text-center text-sm text-gray-500">{expert.specialty}</p>
                  <p className="text-center text-lg font-semibold text-deep-cocoa">
                    ${expert.hourly_rate.toFixed(2)}/hour
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <p className="mb-4 text-center text-gray-500">No tutor selected</p>
                  <Button
                    className="bg-[#ffc6a8] text-deep-cocoa hover:bg-[#ffb289]"
                    onClick={() => router.push("/dashboard/student/find-tutors")}
                  >
                    Find tutors
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardContent className="p-6">
              <h2 className="mb-4 text-lg font-semibold text-deep-cocoa">Lesson Details</h2>

              <div className="mb-4">
                <Label htmlFor="topic" className="mb-2 block">
                  Topic <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Introduction to Python"
                  required
                />
              </div>

              <div className="mb-4 grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="mb-2 block">
                    Date <span className="text-red-500">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal", !date && "text-gray-400")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Select a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label htmlFor="time" className="mb-2 block">
                    Time <span className="text-red-500">*</span>
                  </Label>
                  <Select value={time} onValueChange={setTime}>
                    <SelectTrigger id="time" className={!time ? "text-gray-400" : ""}>
                      <SelectValue placeholder="Select a time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4" />
                            {slot}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mb-4">
                <Label htmlFor="duration" className="mb-2 block">
                  Duration <span className="text-red-500">*</span>
                </Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger id="duration">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                    <SelectItem value="120">120 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mb-6">
                <Label htmlFor="notes" className="mb-2 block">
                  Notes for the tutor (optional)
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Share any specific topics or questions you'd like to cover in this lesson..."
                  rows={4}
                />
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  className="w-full bg-[#ff9b7b] text-white hover:bg-[#ff8a63]"
                  disabled={submitting || !expert}
                >
                  {submitting ? "Scheduling..." : "Schedule lesson"}
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}
