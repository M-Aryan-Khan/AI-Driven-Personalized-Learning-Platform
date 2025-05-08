"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import axios from "@/lib/axios"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  format,
  addMinutes,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isPast,
  parseISO,
} from "date-fns"
import { CalendarIcon, Clock, CreditCard, CheckCircle, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"

type Expert = {
  id: string
  first_name: string
  last_name: string
  profile_image?: string
  specialty: string
  hourly_rate: number
  rating: number
}

type PaymentMethod = {
  id: string
  card_number?: string
  card_holder?: string
  expiry_date?: string
  is_default?: boolean
  card_type?: string
}

type Availability = {
  [date: string]: string[] // date in format YYYY-MM-DD, array of times in format HH:MM
}

export default function ScheduleLesson() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { user } = useAuth()

  const [expert, setExpert] = useState<Expert | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }))
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined)
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [duration, setDuration] = useState("60")
  const [topic, setTopic] = useState("")
  const [description, setDescription] = useState("")
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | undefined>(undefined)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availability, setAvailability] = useState<Availability>({})
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  const [availableDates, setAvailableDates] = useState<string[]>([])

  useEffect(() => {
    const expertId = searchParams.get("expert")
    const dateParam = searchParams.get("date")
    const timeParam = searchParams.get("time")

    if (!expertId) {
      toast({
        title: "Error",
        description: "No expert selected",
        variant: "destructive",
      })
      router.push("/dashboard/student/find-tutors")
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch expert details
        const expertResponse = await axios.get(`/api/students/experts/${expertId}`)
        setExpert(expertResponse.data)

        // Fetch payment methods
        try {
          const paymentResponse = await axios.get("/api/students/payment-methods")
          setPaymentMethods(paymentResponse.data || [])

          // Set default payment method if available
          const defaultMethod = paymentResponse.data.find((method: PaymentMethod) => method.is_default)
          if (defaultMethod) {
            setSelectedPaymentMethod(defaultMethod.id)
          } else if (paymentResponse.data.length > 0) {
            setSelectedPaymentMethod(paymentResponse.data[0].id)
          }
        } catch (error) {
          console.error("Error fetching payment methods:", error)
          setPaymentMethods([])
        }

        // Fetch availability for the expert
        await fetchExpertAvailability(expertId)

        // Set date and time if provided in URL
        if (dateParam && timeParam) {
          const parsedDate = parseISO(dateParam)
          setSelectedDate(parsedDate)
          setSelectedTime(timeParam)

          // Update available times for the selected date
          const formattedDate = format(parsedDate, "yyyy-MM-dd")
          if (availability[formattedDate]) {
            setAvailableTimes(availability[formattedDate])
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [searchParams, toast, router])

  const fetchExpertAvailability = async (expertId: string) => {
    try {
      setLoadingAvailability(true)

      // Get the start and end dates for the next 14 days
      const startDate = new Date()
      const endDate = addDays(startDate, 14)

      // Use the main axios instance which already has auth headers set up
      let response = null
      let attempt = 0
      const maxAttempts = 3

      while (attempt < maxAttempts) {
        try {
          // Use the main axios instance that already has auth headers
          response = await axios.get(`/api/students/experts/${expertId}/availability`, {
            params: {
              start_date: format(startDate, "yyyy-MM-dd"),
              end_date: format(endDate, "yyyy-MM-dd"),
            },
            timeout: 60000, // 60 seconds timeout
          })

          // If successful, break out of the retry loop
          break
        } catch (error: any) {
          attempt++
          console.error(`Attempt ${attempt} failed:`, error.message)

          // If it's an auth error, no need to retry
          if (error.response && error.response.status === 401) {
            console.error("Authentication error. Please log in again.")
            throw error
          }

          if (attempt >= maxAttempts) {
            throw error
          }

          // Wait with exponential backoff before retrying
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000))
        }
      }

      if (response && response.data && response.data.availability) {
        setAvailability(response.data.availability)

        // Extract available dates
        const dates = Object.keys(response.data.availability).sort()
        setAvailableDates(dates)

        // If we have dates and no date is selected yet, select the first available date
        if (dates.length > 0 && !selectedDate) {
          const firstDate = parseISO(dates[0])
          setSelectedDate(firstDate)

          // Set available times for this date
          setAvailableTimes(response.data.availability[dates[0]])
        }
      } else {
        // If no availability data is returned, show a message
        toast({
          title: "No availability",
          description: "This tutor has no available time slots in the next 14 days. They may be fully booked or haven't set their availability yet.",
          variant: "default",
        })
        setAvailability({})
        setAvailableDates([])
      }
    } catch (error: any) {
      console.error("Error fetching expert availability:", error)

      // Check if it's an authentication error
      if (error.response && error.response.status === 401) {
        toast({
          title: "Authentication error",
          description: "Your session may have expired. Please log in again.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error loading availability",
          description: "Could not load tutor's availability. Please try again later.",
          variant: "destructive",
        })
      }

      setAvailability({})
      setAvailableDates([])
    } finally {
      setLoadingAvailability(false)
    }
  }

  // Helper function to generate demo availability data
  const generateDemoAvailability = () => {
    const demoAvailability: Availability = {}
    const startDate = new Date()

    // Add some demo time slots for the next 7 days
    for (let i = 1; i <= 7; i++) {
      const date = addDays(startDate, i)
      // Skip weekends in the demo
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        const dateStr = format(date, "yyyy-MM-dd")
        demoAvailability[dateStr] = []

        // Add time slots from 9 AM to 5 PM
        for (let hour = 9; hour < 17; hour++) {
          demoAvailability[dateStr].push(`${hour.toString().padStart(2, "0")}:00`)
          demoAvailability[dateStr].push(`${hour.toString().padStart(2, "0")}:30`)
        }
      }
    }

    setAvailability(demoAvailability)
    const dates = Object.keys(demoAvailability).sort()
    setAvailableDates(dates)

    if (dates.length > 0) {
      const firstDate = parseISO(dates[0])
      setSelectedDate(firstDate)
      setAvailableTimes(demoAvailability[dates[0]])
    }
  }

  // Update available times when date changes
  useEffect(() => {
    if (selectedDate) {
      const dateString = format(selectedDate, "yyyy-MM-dd")
      if (availability[dateString]) {
        setAvailableTimes(availability[dateString])
        // If there are available times and none is selected, select the first one
        if (availability[dateString].length > 0 && !selectedTime) {
          setSelectedTime(availability[dateString][0])
        }
      } else {
        setAvailableTimes([])
        setSelectedTime(undefined)
      }
    }
  }, [selectedDate, availability])

  const handleSubmit = async () => {
    if (!expert || !selectedDate || !selectedTime || !topic || !selectedPaymentMethod) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      const token = localStorage.getItem("token")

      // Parse the time string to create a full date object
      const timeComponents = selectedTime.split(":")
      const hours = Number.parseInt(timeComponents[0])
      const minutes = Number.parseInt(timeComponents[1])

      const sessionDate = new Date(selectedDate)
      sessionDate.setHours(hours)
      sessionDate.setMinutes(minutes)

      // Ensure we have a valid token
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "You need to be logged in to schedule a lesson",
          variant: "destructive",
        })
        router.push("/auth/login")
        return
      }

      // Create session with explicit headers
      const response = await axios.post(
        "/api/students/sessions",
        {
          student_id: user?.id || "current", // Use actual ID if available
          expert_id: expert.id,
          date: sessionDate.toISOString(),
          duration: Number.parseInt(duration),
          topic,
          description,
          payment_method_id: selectedPaymentMethod,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      toast({
        title: "Success",
        description: "Lesson scheduled successfully",
      })

      // Redirect to the session details page
      router.push(`/dashboard/student/lessons/${response.data.session_id}`)
    } catch (error: any) {
      console.error("Error scheduling lesson:", error)

      // More detailed error handling
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status === 403) {
          toast({
            title: "Permission Error",
            description: "You don't have permission to schedule this lesson. Please check your account status.",
            variant: "destructive",
          })
        } else if (error.response.status === 401) {
          toast({
            title: "Authentication Error",
            description: "Your session has expired. Please log in again.",
            variant: "destructive",
          })
          router.push("/auth/login")
        } else {
          toast({
            title: "Error",
            description: error.response.data?.detail || "Failed to schedule lesson",
            variant: "destructive",
          })
        }
      } else if (error.request) {
        // The request was made but no response was received
        toast({
          title: "Network Error",
          description: "No response from server. Please check your internet connection.",
          variant: "destructive",
        })
      } else {
        // Something happened in setting up the request that triggered an Error
        toast({
          title: "Error",
          description: "Failed to schedule lesson: " + error.message,
          variant: "destructive",
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const calculateEndTime = () => {
    if (!selectedTime) return ""

    const timeComponents = selectedTime.split(":")
    const hours = Number.parseInt(timeComponents[0])
    const minutes = Number.parseInt(timeComponents[1])

    const startTime = new Date()
    startTime.setHours(hours)
    startTime.setMinutes(minutes)

    const endTime = addMinutes(startTime, Number.parseInt(duration))
    return format(endTime, "HH:mm")
  }

  const formatCardNumber = (cardNumber?: string) => {
    if (!cardNumber) return "•••• •••• •••• ••••"
    return `•••• •••• •••• ${cardNumber.slice(-4)}`
  }

  // Calendar navigation
  const nextWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, 7))
  }

  const prevWeek = () => {
    const newStart = subDays(currentWeekStart, 7)
    // Don't allow navigating to past weeks
    if (isPast(endOfWeek(newStart, { weekStartsOn: 0 }))) {
      return
    }
    setCurrentWeekStart(newStart)
  }

  // Generate week days
  const weekDays = eachDayOfInterval({
    start: currentWeekStart,
    end: endOfWeek(currentWeekStart, { weekStartsOn: 0 }),
  })

  // Handle date selection
  const handleDateClick = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd")
    if (availability[dateString] && availability[dateString].length > 0) {
      setSelectedDate(date)
    }
  }

  // Check if a date has availability
  const hasAvailability = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd")
    return availability[dateString] && availability[dateString].length > 0
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl py-8">
        <Skeleton className="h-10 w-1/3 mb-6" />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <Skeleton className="h-[400px] w-full rounded-lg" />
            <Skeleton className="h-[200px] w-full rounded-lg" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-[600px] w-full rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  if (!expert) {
    return (
      <div className="container mx-auto max-w-6xl py-8">
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow">
          <h3 className="mb-2 text-xl font-semibold text-deep-cocoa">Expert not found</h3>
          <p className="text-gray-500">The expert you're looking for doesn't exist or has been removed.</p>
          <Button
            className="mt-4 bg-[#ffc6a8] text-deep-cocoa hover:bg-[#ffb289]"
            onClick={() => router.push("/dashboard/student/find-tutors")}
          >
            Back to Experts
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-6xl py-8">
      <h1 className="mb-6 text-3xl font-bold text-deep-cocoa">Schedule a Lesson</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Select Date & Time</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingAvailability ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : (
                <>
                  {/* Date Selection */}
                  <div className="mb-6">
                    <h3 className="mb-3 font-medium">Available Dates</h3>
                    {availableDates.length === 0 && !loadingAvailability && (
                      <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-center">
                        <AlertCircle className="mx-auto mb-2 h-6 w-6 text-amber-500" />
                        <p className="text-amber-800">This tutor has no available time slots in the next 14 days.</p>
                        <p className="mt-2 text-sm text-amber-700">
                          Try checking back later or contact the tutor directly.
                        </p>
                      </div>
                    )}
                    {availableDates.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                        {availableDates.map((dateStr) => {
                          const date = parseISO(dateStr)
                          const isSelected = selectedDate && format(selectedDate, "yyyy-MM-dd") === dateStr

                          return (
                            <Button
                              key={dateStr}
                              variant={isSelected ? "default" : "outline"}
                              className={
                                isSelected
                                  ? "bg-[#ff9b7b] text-white hover:bg-[#ff8a63]"
                                  : "border-[#ffc6a8] text-deep-cocoa hover:bg-[#fff2e7]"
                              }
                              onClick={() => setSelectedDate(date)}
                            >
                              {format(date, "EEE, MMM d")}
                            </Button>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-center">
                        <p className="text-gray-500">No available dates found.</p>
                      </div>
                    )}
                  </div>

                  {/* Time Selection */}
                  {selectedDate ? (
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={selectedDate.toString()}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <h3 className="mb-3 font-medium">Available Times for {format(selectedDate, "EEEE, MMMM d")}</h3>
                        {availableTimes.length > 0 ? (
                          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                            {availableTimes.map((time) => (
                              <Button
                                key={time}
                                variant={selectedTime === time ? "default" : "outline"}
                                className={
                                  selectedTime === time
                                    ? "bg-[#ff9b7b] text-white hover:bg-[#ff8a63]"
                                    : "border-[#ffc6a8] text-deep-cocoa hover:bg-[#fff2e7]"
                                }
                                onClick={() => setSelectedTime(time)}
                              >
                                {time}
                              </Button>
                            ))}
                          </div>
                        ) : (
                          <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-center">
                            <p className="text-gray-500">No available times for this date.</p>
                          </div>
                        )}
                        
                        <div className="mt-4 rounded-md border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800">
                          <div className="flex items-start">
                            <AlertCircle className="mr-2 mt-0.5 h-4 w-4 text-blue-500" />
                            <div>
                              <p className="font-medium">About available time slots</p>
                              <p className="mt-1">
                                Only times when the tutor is available are shown. Times when they already have sessions 
                                scheduled (including buffer time before and after) are automatically removed.
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  ) : (
                    <div className="rounded-md border border-gray-200 bg-[#fff8f0] p-4 text-center">
                      <AlertCircle className="mx-auto mb-2 h-6 w-6 text-[#ff9b7b]" />
                      <p className="text-deep-cocoa">Please select a date to see available times</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6 shadow-md">
            <CardHeader>
              <CardTitle>Lesson Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">Duration</label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                    <SelectItem value="120">120 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">Topic</label>
                <Input
                  placeholder="What would you like to learn?"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Description (Optional)</label>
                <Textarea
                  placeholder="Describe your learning goals and what you'd like to focus on..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Lesson Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6 flex items-center">
                <div className="mr-4">
                  {expert.profile_image ? (
                    <img
                      src={expert.profile_image || "/placeholder.svg"}
                      alt={`${expert.first_name} ${expert.last_name}`}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-[#ffc6a8] to-[#ffb289]">
                      <span className="text-xl font-bold text-white">
                        {expert.first_name[0]}
                        {expert.last_name[0]}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-deep-cocoa">
                    {expert.first_name} {expert.last_name}
                  </h3>
                  <p className="text-sm text-gray-500">{expert.specialty}</p>
                </div>
              </div>

              <div className="space-y-4">
                {selectedDate && selectedTime && (
                  <div className="flex items-start">
                    <CalendarIcon className="mr-3 mt-0.5 h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-deep-cocoa">Date & Time</p>
                      <p className="text-gray-600">{format(selectedDate, "EEEE, MMMM d, yyyy")}</p>
                      <p className="text-gray-600">
                        {selectedTime} - {calculateEndTime()}
                      </p>
                    </div>
                  </div>
                )}

                {duration && (
                  <div className="flex items-start">
                    <Clock className="mr-3 mt-0.5 h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-deep-cocoa">Duration</p>
                      <p className="text-gray-600">{duration} minutes</p>
                    </div>
                  </div>
                )}

                {topic && (
                  <div className="flex items-start">
                    <CheckCircle className="mr-3 mt-0.5 h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-deep-cocoa">Topic</p>
                      <p className="text-gray-600">{topic}</p>
                    </div>
                  </div>
                )}
              </div>

              <Separator className="my-6" />

              <div>
                <h3 className="mb-4 font-medium text-deep-cocoa">Payment Method</h3>

                {paymentMethods.length > 0 ? (
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className={`flex cursor-pointer items-center rounded-md border p-3 transition-colors ${
                          selectedPaymentMethod === method.id
                            ? "border-[#ff9b7b] bg-[#fff8f0]"
                            : "border-gray-200 hover:border-[#ffc6a8]"
                        }`}
                        onClick={() => setSelectedPaymentMethod(method.id)}
                      >
                        <div className="mr-3">
                          <CreditCard className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-deep-cocoa">{method.card_type || "Credit Card"}</p>
                          <p className="text-sm text-gray-500">
                            {formatCardNumber(method.card_number)}
                            {method.expiry_date && <span> • Expires {method.expiry_date}</span>}
                          </p>
                        </div>
                        {selectedPaymentMethod === method.id && <CheckCircle className="h-5 w-5 text-[#ff9b7b]" />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-md border border-gray-200 p-4 text-center">
                    <p className="mb-2 text-gray-600">No payment methods available</p>
                    <Button
                      variant="outline"
                      className="border-[#ffc6a8] text-deep-cocoa hover:bg-[#fff2e7]"
                      onClick={() => router.push("/dashboard/student/settings?tab=payment")}
                    >
                      Add Payment Method
                    </Button>
                  </div>
                )}
              </div>

              <Separator className="my-6" />

              <div>
                <h3 className="mb-2 font-medium text-deep-cocoa">Price Summary</h3>
                <div className="mb-2 flex justify-between">
                  <p className="text-gray-600">Lesson ({duration} min)</p>
                  <p className="font-medium text-deep-cocoa">
                    ${((expert.hourly_rate / 60) * Number.parseInt(duration)).toFixed(2)}
                  </p>
                </div>
                <div className="mb-4 flex justify-between">
                  <p className="text-gray-600">Platform fee</p>
                  <p className="font-medium text-deep-cocoa">$2.00</p>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-4">
                  <p className="font-medium text-deep-cocoa">Total</p>
                  <p className="text-lg font-bold text-deep-cocoa">
                    ${((expert.hourly_rate / 60) * Number.parseInt(duration) + 2).toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-[#ff9b7b] text-white hover:bg-[#ff8a63]"
                onClick={handleSubmit}
                disabled={!selectedDate || !selectedTime || !topic || !selectedPaymentMethod || isSubmitting}
              >
                {isSubmitting ? "Scheduling..." : "Schedule Lesson"}
              </Button>
            </CardFooter>
          </Card>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <Card className="bg-[#fff8f0] shadow-md">
              <CardContent className="p-4">
                <h3 className="mb-2 font-medium text-deep-cocoa">What happens next?</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 mt-0.5 h-4 w-4 text-[#ff9b7b]" />
                    <span>You'll receive a confirmation email with lesson details</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 mt-0.5 h-4 w-4 text-[#ff9b7b]" />
                    <span>Your expert will be notified and can prepare for the lesson</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 mt-0.5 h-4 w-4 text-[#ff9b7b]" />
                    <span>15 minutes before the lesson, you'll receive a link to join</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 mt-0.5 h-4 w-4 text-[#ff9b7b]" />
                    <span>After the lesson, you can leave a review for your expert</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
