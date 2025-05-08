"use client"

import { useState, useEffect } from "react"
import { format, parseISO, isBefore, isEqual, startOfDay } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import axios from "@/lib/axios"
import { useRouter } from "next/navigation"
import { Loader2, Save, CalendarIcon, X, Plus, Clock, AlertCircle } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface TimeSlot {
  id?: string
  day: string
  startTime: string
  endTime: string
}

interface BlockedDate {
  id?: string
  date: Date
  reason: string
}

interface AvailabilitySettings {
  timezone: string
  bufferTime: number
  maxSessionsPerDay: number
  autoAccept: boolean
}

export default function AvailabilityPage() {
  const { toast } = useToast()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("weekly")

  const [weeklySchedule, setWeeklySchedule] = useState<TimeSlot[]>([])
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [blockReason, setBlockReason] = useState("")
  const [datePickerOpen, setDatePickerOpen] = useState(false)

  const [settings, setSettings] = useState<AvailabilitySettings>({
    timezone: "UTC",
    bufferTime: 15,
    maxSessionsPerDay: 5,
    autoAccept: false,
  })

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  const timeOptions = Array.from({ length: 24 * 4 }, (_, i) => {
    const hour = Math.floor(i / 4)
    const minute = (i % 4) * 15
    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
  })

  useEffect(() => {
    fetchAvailabilitySettings()
  }, [])

  const fetchAvailabilitySettings = async () => {
    try {
      setLoading(true)
      const response = await axios.get("/api/experts/availability")

      if (response.data) {
        const { weeklySchedule, blockedDates, settings } = response.data

        if (weeklySchedule) {
          setWeeklySchedule(weeklySchedule)
        } else {
          // Initialize with empty schedule for each day
          const initialSchedule: TimeSlot[] = []
          daysOfWeek.forEach((day) => {
            initialSchedule.push({
              day,
              startTime: "09:00",
              endTime: "17:00",
            })
          })
          setWeeklySchedule(initialSchedule)
        }

        if (blockedDates) {
          setBlockedDates(
            blockedDates.map((date: any) => ({
              ...date,
              date: parseISO(date.date),
            })),
          )
        }

        if (settings) {
          setSettings({
            timezone: settings.timezone || "UTC",
            bufferTime: settings.bufferTime || 15,
            maxSessionsPerDay: settings.maxSessionsPerDay || 5,
            autoAccept: settings.autoAccept || false,
          })
        }
      }
    } catch (error) {
      console.error("Error fetching availability settings:", error)

      // Initialize with default values if API fails
      const initialSchedule: TimeSlot[] = []
      daysOfWeek.forEach((day) => {
        initialSchedule.push({
          day,
          startTime: "09:00",
          endTime: "17:00",
        })
      })
      setWeeklySchedule(initialSchedule)

      toast({
        title: "Error",
        description: "Failed to load your availability settings. Default values have been set.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const saveAvailabilitySettings = async () => {
    try {
      setSaving(true)

      const payload = {
        weeklySchedule,
        blockedDates: blockedDates.map((date) => ({
          ...date,
          date: format(date.date, "yyyy-MM-dd"),
        })),
        settings: {
          timezone: settings.timezone,
          bufferTime: settings.bufferTime,
          maxSessionsPerDay: settings.maxSessionsPerDay,
          autoAccept: settings.autoAccept,
        },
      }

      await axios.put("/api/experts/availability", payload)

      toast({
        title: "Success",
        description: "Your availability settings have been saved.",
      })
    } catch (error) {
      console.error("Error saving availability settings:", error)
      toast({
        title: "Error",
        description: "Failed to save your availability settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const addTimeSlot = (day: string) => {
    setWeeklySchedule([
      ...weeklySchedule,
      {
        day,
        startTime: "09:00",
        endTime: "17:00",
      },
    ])
  }

  const updateTimeSlot = (index: number, field: keyof TimeSlot, value: any) => {
    const updatedSchedule = [...weeklySchedule]
    updatedSchedule[index] = {
      ...updatedSchedule[index],
      [field]: value,
    }
    setWeeklySchedule(updatedSchedule)
  }

  const removeTimeSlot = (index: number) => {
    const updatedSchedule = [...weeklySchedule]
    updatedSchedule.splice(index, 1)
    setWeeklySchedule(updatedSchedule)
  }

  const addBlockedDate = () => {
    if (!selectedDate) return

    // Check if date is already blocked
    const isAlreadyBlocked = blockedDates.some((date) => isEqual(startOfDay(date.date), startOfDay(selectedDate)))

    if (isAlreadyBlocked) {
      toast({
        title: "Date already blocked",
        description: "This date is already in your blocked dates list.",
        variant: "destructive",
      })
      return
    }

    if (!blockReason.trim()) {
      toast({
        title: "Reason required",
        description: "Please provide a reason for blocking this date.",
        variant: "destructive",
      })
      return
    }

    setBlockedDates([
      ...blockedDates,
      {
        date: selectedDate,
        reason: blockReason,
      },
    ])

    setBlockReason("")
    setDatePickerOpen(false)
  }

  const removeBlockedDate = (index: number) => {
    const updatedBlockedDates = [...blockedDates]
    updatedBlockedDates.splice(index, 1)
    setBlockedDates(updatedBlockedDates)
  }

  const handleSettingChange = (field: keyof AvailabilitySettings, value: any) => {
    setSettings({
      ...settings,
      [field]: value,
    })
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-warm-coral" />
          <p className="mt-2 text-deep-cocoa">Loading your availability settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-6xl py-6 px-4 md:px-6">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-deep-cocoa md:text-3xl">Manage Your Availability</h1>
        <Button onClick={saveAvailabilitySettings} disabled={saving} className="bg-[#ffc6a8] hover:cursor-pointer">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="weekly">Weekly Schedule</TabsTrigger>
          <TabsTrigger value="blocked">Blocked Dates</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Availability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {daysOfWeek.map((day) => (
                <div key={day} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-deep-cocoa">{day}</h3>
                    <Button
                      className="bg-warm-coral text-deep-cocoa hover:bg-[#ff8c61] hover:cursor-pointer"
                      size="sm"
                      onClick={() => addTimeSlot(day)}
                    >
                      <Plus className="mr-1 h-4 w-4" />
                      Add Time Slot
                    </Button>
                  </div>

                  {weeklySchedule
                    .filter((slot) => slot.day === day)
                    .map((slot, index) => {
                      const slotIndex = weeklySchedule.findIndex((s) => s === slot)
                      return (
                        <div
                          key={index}
                          className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0 p-3 rounded-md border border-gray-200 bg-gray-50"
                        >
                          <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label>Start Time</Label>
                              <Select
                                value={slot.startTime}
                                onValueChange={(value) => updateTimeSlot(slotIndex, "startTime", value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select start time" />
                                </SelectTrigger>
                                <SelectContent>
                                  {timeOptions.map((time) => (
                                    <SelectItem key={`start-${time}`} value={time}>
                                      {time}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>End Time</Label>
                              <Select
                                value={slot.endTime}
                                onValueChange={(value) => updateTimeSlot(slotIndex, "endTime", value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select end time" />
                                </SelectTrigger>
                                <SelectContent>
                                  {timeOptions.map((time) => (
                                    <SelectItem key={`end-${time}`} value={time}>
                                      {time}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end space-x-4">
                            <Button
                              variant="destructive"
                              className="hover:cursor-pointer"
                              size="icon"
                              onClick={() => removeTimeSlot(slotIndex)}
                            >
                              <X className="h-4 w-4" />
                              <span className="sr-only">Remove</span>
                            </Button>
                          </div>
                        </div>
                      )
                    })}

                  {weeklySchedule.filter((slot) => slot.day === day).length === 0 && (
                    <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-gray-300 p-6 text-center">
                      <Clock className="mb-2 h-8 w-8 text-gray-400" />
                      <p className="text-sm text-gray-500">No time slots added for {day}.</p>
                      <Button
                        className="mt-2 bg-warm-coral text-deep-cocoa hover:bg-[#ff8c61] hover:cursor-pointer"
                        size="sm"
                        onClick={() => addTimeSlot(day)}
                      >
                        <Plus className="mr-1 h-4 w-4" />
                        Add Time Slot
                      </Button>
                    </div>
                  )}

                  <Separator />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Availability Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={settings.timezone} onValueChange={(value) => handleSettingChange("timezone", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                      <SelectItem value="Europe/London">London (GMT)</SelectItem>
                      <SelectItem value="Europe/Paris">Central European Time (CET)</SelectItem>
                      <SelectItem value="Asia/Tokyo">Japan Standard Time (JST)</SelectItem>
                      <SelectItem value="Australia/Sydney">Australian Eastern Time (AET)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="buffer-time">Buffer Time Between Sessions</Label>
                  <Select
                    value={settings.bufferTime.toString()}
                    onValueChange={(value) => handleSettingChange("bufferTime", Number.parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select buffer time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No buffer</SelectItem>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-sessions">Maximum Sessions Per Day</Label>
                  <Input
                    id="max-sessions"
                    type="number"
                    min="1"
                    max="20"
                    value={settings.maxSessionsPerDay}
                    onChange={(e) => handleSettingChange("maxSessionsPerDay", Number.parseInt(e.target.value))}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="auto-accept"
                    checked={settings.autoAccept}
                    onChange={(e) => handleSettingChange("autoAccept", e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-warm-coral focus:ring-warm-coral"
                  />
                  <Label htmlFor="auto-accept">Automatically accept booking requests</Label>
                </div>
              </div>

              <div className="rounded-lg bg-blue-50 p-4 text-blue-800">
                <div className="flex items-start">
                  <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">Availability Tips</h3>
                    <ul className="mt-1 list-inside list-disc space-y-1 text-sm">
                      <li>Set your weekly schedule to reflect your regular availability</li>
                      <li>Block specific dates for vacations, holidays, or personal time</li>
                      <li>Buffer time helps you prepare between sessions</li>
                      <li>Setting a maximum number of sessions per day prevents burnout</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blocked" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Block Dates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Date to Block</Label>
                  <div className="flex space-x-2">
                    <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal hover:cursor-pointer"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : "Select a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={(date) => isBefore(date, startOfDay(new Date()))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="block-reason">Reason</Label>
                  <Input
                    id="block-reason"
                    placeholder="e.g., Vacation, Personal day"
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                  />
                </div>

                <Button
                  onClick={addBlockedDate}
                  disabled={!selectedDate || !blockReason.trim()}
                  className="w-full bg-red-500 text-white  hover:cursor-pointer"
                >
                  Block Selected Date
                </Button>

                <div className="rounded-lg bg-amber-50 p-4 text-amber-800">
                  <div className="flex items-start">
                    <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0" />
                    <div className="text-sm">
                      <p>Blocked dates will not be available for students to book sessions.</p>
                      <p className="mt-1">Any existing sessions on blocked dates will need to be rescheduled.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Blocked Dates</CardTitle>
              </CardHeader>
              <CardContent>
                {blockedDates.length > 0 ? (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {blockedDates
                      .sort((a, b) => a.date.getTime() - b.date.getTime())
                      .map((blockedDate, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-md bg-gray-50">
                          <div>
                            <p className="font-medium text-deep-cocoa">{format(blockedDate.date, "MMMM d, yyyy")}</p>
                            <p className="text-sm text-gray-500">{blockedDate.reason}</p>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="hover:cursor-pointer"
                            onClick={() => removeBlockedDate(index)}
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Remove</span>
                          </Button>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-gray-300 p-8 text-center">
                    <CalendarIcon className="mb-2 h-8 w-8 text-gray-400" />
                    <p className="text-gray-500">No dates blocked yet.</p>
                    <p className="text-sm text-gray-400 mt-1">Block dates when you're unavailable.</p>
                  </div>
                )}

                {blockedDates.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">
                      Showing {blockedDates.length} blocked date{blockedDates.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Blocked Dates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {blockedDates
                  .filter((date) => !isBefore(date.date, startOfDay(new Date())))
                  .sort((a, b) => a.date.getTime() - b.date.getTime())
                  .slice(0, 8)
                  .map((date, index) => (
                    <div
                      key={index}
                      className="flex flex-col justify-between rounded-md border border-red-200 bg-red-50 p-3"
                    >
                      <div>
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
                          {format(date.date, "MMM d, yyyy")}
                        </Badge>
                        <p className="mt-1 text-sm text-gray-700">{date.reason}</p>
                      </div>
                    </div>
                  ))}

                {blockedDates.filter((date) => !isBefore(date.date, startOfDay(new Date()))).length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center rounded-md border border-dashed border-gray-300 p-6 text-center">
                    <p className="text-gray-500">No upcoming blocked dates.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
