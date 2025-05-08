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
  isSameDay,
  isToday,
  isPast,
  isFuture,
} from "date-fns"
import { CalendarIcon, Clock, CreditCard, CheckCircle, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

type Expert = {
  id: string
  first_name: string
  last_name: string
  profile_image?: string
  specialty: string
  hourly_rate: number
  rating: number
  availability?: Record<string, string[]>
}

type PaymentMethod = {
  id: string
  card_number?: string
  card_holder?: string
  expiry_date?: string
  is_default?: boolean
  card_type?: string
}

export default function ScheduleLesson() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

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
  const [weekAvailability, setWeekAvailability] = useState<Record<string, string[]>>({})
  const [loadingAvailability, setLoadingAvailability] = useState(false)

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

        // Set date and time if provided in URL
        if (dateParam && timeParam) {
          const parsedDate = new Date(dateParam)
          setSelectedDate(parsedDate)
          setSelectedTime(timeParam)

          // Update available times for the selected date
          if (expertResponse.data.availability && expertResponse.data.availability[dateParam]) {
            setAvailableTimes(expertResponse.data.availability[dateParam])
          }
        }

        // Fetch availability for the current week
        await fetchWeekAvailability(expertId, currentWeekStart)
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
  }, [searchParams, toast, router, currentWeekStart])

  const fetchWeekAvailability = async (expertId: string, weekStart: Date) => {
    try {
      setLoadingAvailability(true)
      const weekDates = eachDayOfInterval({
        start: weekStart,
        end: endOfWeek(weekStart, { weekStartsOn: 0 }),
      })

      // In a real implementation, you would fetch this from the API
      // For now, we'll use the expert's availability data that we already have
      if (expert?.availability) {
        const weekAvail: Record<string, string[]> = {}

        weekDates.forEach((date) => {
          const dateStr = format(date, "yyyy-MM-dd")
          if (expert.availability && expert.availability[dateStr]) {
            weekAvail[dateStr] = expert.availability[dateStr]
          } else {
            // Generate some random availability for demo purposes
            if (isFuture(date)) {
              const times = []
              const startHour = 9 + Math.floor(Math.random() * 3) // 9, 10, or 11
              for (let i = 0; i < 3 + Math.floor(Math.random() * 4); i++) {
                // 3-6 slots
                const hour = startHour + i
                times.push(`${hour.toString().padStart(2, "0")}:00`)
              }
              weekAvail[dateStr] = times
            } else {
              weekAvail[dateStr] = []
            }
          }
        })

        setWeekAvailability(weekAvail)
      }
    } catch (error) {
      console.error("Error fetching week availability:", error)
    } finally {
      setLoadingAvailability(false)
    }
  }

  // Update available times when date changes
  useEffect(() => {
    if (selectedDate) {
      const dateString = format(selectedDate, "yyyy-MM-dd")
      if (weekAvailability[dateString]) {
        setAvailableTimes(weekAvailability[dateString])
      } else {
        setAvailableTimes([])
      }
      setSelectedTime(undefined)
    }
  }, [selectedDate, weekAvailability])

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

      // Parse the time string to create a full date object
      const timeComponents = selectedTime.split(":")
      const hours = Number.parseInt(timeComponents[0])
      const minutes = Number.parseInt(timeComponents[1])

      const sessionDate = new Date(selectedDate)
      sessionDate.setHours(hours)
      sessionDate.setMinutes(minutes)

      // Create session
      const response = await axios.post("/api/students/sessions", {
        student_id: "current", // The backend will use the current user's ID
        expert_id: expert.id,
        date: sessionDate.toISOString(),
        duration: Number.parseInt(duration),
        topic,
        description,
        payment_method_id: selectedPaymentMethod,
      })

      toast({
        title: "Success",
        description: "Lesson scheduled successfully",
      })

      // Redirect to the session details page
      router.push(`/dashboard/student/lessons/${response.data.session_id}`)
    } catch (error) {
      console.error("Error scheduling lesson:", error)
      toast({
        title: "Error",
        description: "Failed to schedule lesson",
        variant: "destructive",
      })
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
    if (weekAvailability[dateString] && weekAvailability[dateString].length > 0) {
      setSelectedDate(date)
    }
  }

  // Check if a date has availability
  const hasAvailability = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd")
    return weekAvailability[dateString] && weekAvailability[dateString].length > 0
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
      <div className="container mx-auto max-w-6xl py-4">
        <div className="rounded-lg border border-gray-200 bg-white px-8 text-center shadow">
          <h3 className="mb-2 text-xl font-semibold text-deep-cocoa">Expert not found</h3>
          <p className="text-gray-500">The expert you're looking for doesn't exist or has been removed.</p>
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
      <h1 className="mb-6 text-3xl font-bold text-deep-cocoa">Schedule a Lesson</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Select Date & Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-medium text-deep-cocoa">
                    {format(currentWeekStart, "MMM d")} -{" "}
                    {format(endOfWeek(currentWeekStart, { weekStartsOn: 0 }), "MMM d, yyyy")}
                  </h3>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="icon" onClick={prevWeek} className="h-8 w-8 p-0">
                      <span className="sr-only">Previous week</span>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={nextWeek} className="h-8 w-8 p-0">
                      <span className="sr-only">Next week</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {weekDays.map((day, index) => {
                    const dateStr = format(day, "yyyy-MM-dd")
                    const dayHasAvailability = hasAvailability(day)
                    const isSelected = selectedDate && isSameDay(selectedDate, day)
                    const isPastDay = isPast(day) && !isToday(day)

                    return (
                      <div key={index} className="text-center">
                        <div className="mb-1 text-xs font-medium text-gray-500">{format(day, "EEE")}</div>
                        <motion.div
                          whileHover={!isPastDay && dayHasAvailability ? { scale: 1.1 } : {}}
                          className={`
                            mx-auto flex h-10 w-10 cursor-pointer items-center justify-center rounded-full
                            ${isSelected ? "bg-[#ff9b7b] text-white" : ""}
                            ${!isSelected && dayHasAvailability && !isPastDay ? "border border-[#ffc6a8] hover:bg-[#fff8f0]" : ""}
                            ${isPastDay ? "cursor-not-allowed text-gray-300" : ""}
                            ${isToday(day) && !isSelected ? "border border-[#ff9b7b] font-bold" : ""}
                          `}
                          onClick={() => !isPastDay && dayHasAvailability && handleDateClick(day)}
                        >
                          {format(day, "d")}
                        </motion.div>
                        {dayHasAvailability && !isPastDay && (
                          <div className="mt-1 text-xs text-green-600">{weekAvailability[dateStr]?.length} slots</div>
                        )}
                        {!dayHasAvailability && !isPastDay && (
                          <div className="mt-1 text-xs text-gray-400">No slots</div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {loadingAvailability ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : selectedDate ? (
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
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div className="rounded-md border border-gray-200 bg-[#fff8f0] p-4 text-center">
                  <AlertCircle className="mx-auto mb-2 h-6 w-6 text-[#ff9b7b]" />
                  <p className="text-deep-cocoa">Please select a date to see available times</p>
                </div>
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
                    <span>Your tutor will be notified and can prepare for the lesson</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 mt-0.5 h-4 w-4 text-[#ff9b7b]" />
                    <span>15 minutes before the lesson, you'll receive a link to join</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 mt-0.5 h-4 w-4 text-[#ff9b7b]" />
                    <span>After the lesson, you can leave a review for your tutor</span>
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
