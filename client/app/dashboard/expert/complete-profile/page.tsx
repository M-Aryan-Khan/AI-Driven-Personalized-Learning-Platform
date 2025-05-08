"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Upload, Check, X, Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import axios from "@/lib/axios"

// Define the form data type to fix TypeScript errors
interface ExpertFormData {
  first_name: string
  last_name: string
  specialty: string
  bio: string
  hourly_rate: number
  education: string
  experience_years: number
  languages: string[]
  tags: string[]
  teaching_style: string
  what_to_expect: string[]
  location: string
  timezone: string
  phone: string
  profile_image: string
}

export default function CompleteProfile() {
  const { user, refreshUser } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("basic")
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<ExpertFormData>({
    // Basic Info
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    specialty: "",
    bio: "",
    hourly_rate: 45,

    // Qualifications
    education: "",
    experience_years: 1,
    languages: ["English"],
    tags: [],

    // Teaching Details
    teaching_style: "",
    what_to_expect: ["", "", ""],

    // Contact & Location
    location: "",
    timezone: "",
    phone: "",

    // Profile Image
    profile_image: user?.profile_image || "",
  })

  const [newTag, setNewTag] = useState("")
  const [newLanguage, setNewLanguage] = useState("")
  const [progress, setProgress] = useState(0)

  // Calculate completion progress
  useEffect(() => {
    let completed = 0
    let total = 0

    // Basic Info (5 fields)
    if (formData.first_name) completed++
    if (formData.last_name) completed++
    if (formData.specialty) completed++
    if (formData.bio && formData.bio.length >= 100) completed++
    if (formData.hourly_rate > 0) completed++
    total += 5

    // Qualifications (4 fields)
    if (formData.education) completed++
    if (formData.experience_years > 0) completed++
    if (formData.languages.length > 0) completed++
    if (formData.tags.length >= 3) completed++
    total += 4

    // Teaching Details (2 fields)
    if (formData.teaching_style && formData.teaching_style.length >= 50) completed++
    if (formData.what_to_expect.filter((item) => item.length > 0).length >= 2) completed++
    total += 2

    // Contact & Location (3 fields)
    if (formData.location) completed++
    if (formData.timezone) completed++
    if (formData.phone) completed++
    total += 3

    // Calculate percentage
    const percentage = Math.round((completed / total) * 100)
    setProgress(percentage)
  }, [formData])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: Number.parseFloat(value) || 0 }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, newTag] }))
      setNewTag("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }))
  }

  const handleAddLanguage = () => {
    if (newLanguage && !formData.languages.includes(newLanguage)) {
      setFormData((prev) => ({ ...prev, languages: [...prev.languages, newLanguage] }))
      setNewLanguage("")
    }
  }

  const handleRemoveLanguage = (language: string) => {
    setFormData((prev) => ({ ...prev, languages: prev.languages.filter((l) => l !== language) }))
  }

  const handleWhatToExpectChange = (index: number, value: string) => {
    const newWhatToExpect = [...formData.what_to_expect]
    newWhatToExpect[index] = value
    setFormData((prev) => ({ ...prev, what_to_expect: newWhatToExpect }))
  }

  const handleAddWhatToExpect = () => {
    setFormData((prev) => ({ ...prev, what_to_expect: [...prev.what_to_expect, ""] }))
  }

  const handleRemoveWhatToExpect = (index: number) => {
    const newWhatToExpect = [...formData.what_to_expect]
    newWhatToExpect.splice(index, 1)
    setFormData((prev) => ({ ...prev, what_to_expect: newWhatToExpect }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)

    try {
      setLoading(true)

      const response = await axios.post("/api/experts/profile/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      setFormData((prev) => ({ ...prev, profile_image: response.data.image_url }))

      toast({
        title: "Success",
        description: "Profile image uploaded successfully",
      })
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Error",
        description: "Failed to upload profile image",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    // Validate form data
    if (!formData.first_name || !formData.last_name) {
      toast({
        title: "Error",
        description: "Please provide your first and last name",
        variant: "destructive",
      })
      setActiveTab("basic")
      return
    }

    if (!formData.specialty) {
      toast({
        title: "Error",
        description: "Please specify your teaching specialty",
        variant: "destructive",
      })
      setActiveTab("basic")
      return
    }

    if (!formData.bio || formData.bio.length < 100) {
      toast({
        title: "Error",
        description: "Please provide a bio of at least 100 characters",
        variant: "destructive",
      })
      setActiveTab("basic")
      return
    }

    if (formData.tags.length < 3) {
      toast({
        title: "Error",
        description: "Please add at least 3 tags/skills",
        variant: "destructive",
      })
      setActiveTab("qualifications")
      return
    }

    try {
      setLoading(true)

      // Filter out empty what_to_expect items
      const cleanedFormData = {
        ...formData,
        what_to_expect: formData.what_to_expect.filter((item) => item.length > 0),
      }

      // Update profile
      await axios.put("/api/experts/profile", cleanedFormData)

      // Mark profile as completed
      await axios.put("/api/experts/profile/complete")

      // Refresh user data
      await refreshUser()

      toast({
        title: "Success",
        description: "Your profile has been completed successfully!",
      })

      // Redirect to dashboard
      router.push("/dashboard/expert")
    } catch (error) {
      console.error("Error completing profile:", error)
      toast({
        title: "Error",
        description: "Failed to complete your profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const nextTab = () => {
    if (activeTab === "basic") setActiveTab("qualifications")
    else if (activeTab === "qualifications") setActiveTab("teaching")
    else if (activeTab === "teaching") setActiveTab("contact")
  }

  const prevTab = () => {
    if (activeTab === "contact") setActiveTab("teaching")
    else if (activeTab === "teaching") setActiveTab("qualifications")
    else if (activeTab === "qualifications") setActiveTab("basic")
  }

  const userInitials = user?.first_name && user?.last_name ? `${user.first_name[0]}${user.last_name[0]}` : "EX"

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <Card className="mb-8">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-deep-cocoa">Complete Your Expert Profile</CardTitle>
          <CardDescription>
            Please complete your profile to start teaching on Synapse. Students will see this information when browsing
            for tutors.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="mb-2 flex justify-between text-sm">
              <span>Profile Completion</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-warm-coral transition-all duration-500 ease-in-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="qualifications">Qualifications</TabsTrigger>
              <TabsTrigger value="teaching">Teaching</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="mt-6">
              <div className="space-y-6">
                <div className="flex flex-col items-center gap-4 sm:flex-row">
                  <div className="flex flex-col items-center">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={formData.profile_image || ""} alt={formData.first_name || "User"} />
                      <AvatarFallback className="bg-[#ffc6a8] text-2xl text-deep-cocoa">{userInitials}</AvatarFallback>
                    </Avatar>

                    <Label htmlFor="profile-image" className="mt-4 cursor-pointer">
                      <div className="flex items-center gap-1 rounded-md bg-[#ffc6a8] px-3 py-2 text-sm font-medium text-deep-cocoa hover:bg-[#ffb289]">
                        <Upload className="h-4 w-4" />
                        Upload Photo
                      </div>
                    </Label>
                    <Input
                      id="profile-image"
                      type="file"
                      accept="image/jpeg, image/png"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <p className="mt-1 text-xs text-gray-500">JPG or PNG, max 2MB</p>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first_name">First Name *</Label>
                        <Input
                          id="first_name"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last_name">Last Name *</Label>
                        <Input
                          id="last_name"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="specialty">Teaching Specialty *</Label>
                      <Input
                        id="specialty"
                        name="specialty"
                        placeholder="e.g. Full Stack Development, Data Science, Machine Learning"
                        value={formData.specialty}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hourly_rate">Hourly Rate (USD) *</Label>
                      <Input
                        id="hourly_rate"
                        name="hourly_rate"
                        type="number"
                        min="5"
                        step="5"
                        value={formData.hourly_rate}
                        onChange={handleNumberInputChange}
                        required
                      />
                      <p className="text-xs text-gray-500">
                        Set a competitive rate to attract students. You can adjust this later.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">
                    Bio *
                    <span className="ml-1 text-xs text-gray-500">
                      ({formData.bio.length}/500 characters, minimum 100)
                    </span>
                  </Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    placeholder="Tell students about yourself, your teaching experience, and your approach to teaching."
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={6}
                    maxLength={500}
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={nextTab} className="bg-warm-coral text-white hover:bg-[#ff8c61] hover:cursor-pointer">
                    Next: Qualifications
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="qualifications" className="mt-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="education">Education *</Label>
                  <Input
                    id="education"
                    name="education"
                    placeholder="e.g. Bachelor's in Computer Science, Stanford University"
                    value={formData.education}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience_years">Years of Experience *</Label>
                  <Input
                    id="experience_years"
                    name="experience_years"
                    type="number"
                    min="0"
                    value={formData.experience_years}
                    onChange={handleNumberInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Languages You Speak *</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.languages.map((language) => (
                      <Badge key={language} variant="secondary" className="flex items-center gap-1">
                        {language}
                        <button
                          onClick={() => handleRemoveLanguage(language)}
                          className="ml-1 rounded-full p-1 hover:bg-gray-200 hover:cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a language"
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                    />
                    <Button
                      type="button"
                      onClick={handleAddLanguage}
                      variant="outline"
                      className="border-[#ffc6a8] text-deep-cocoa hover:bg-[#fff2e7] hover:cursor-pointer"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Skills & Tags *</Label>
                  <p className="text-xs text-gray-500 mb-2">
                    Add at least 3 skills or tags that describe your expertise (e.g. React, Python, Data Structures)
                  </p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 rounded-full p-1 hover:bg-gray-200 hover:cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a skill or tag"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                    />
                    <Button
                      type="button"
                      onClick={handleAddTag}
                      variant="outline"
                      className="border-[#ffc6a8] text-deep-cocoa hover:bg-[#fff2e7] hover:cursor-pointer"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button
                    onClick={prevTab}
                    variant="outline"
                    className="border-[#ffc6a8] text-deep-cocoa hover:bg-[#fff2e7] hover:cursor-pointer"
                  >
                    Back
                  </Button>
                  <Button onClick={nextTab} className="bg-warm-coral text-white hover:bg-[#ff8c61] hover:cursor-pointer">
                    Next: Teaching Details
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="teaching" className="mt-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="teaching_style">
                    Teaching Style *
                    <span className="ml-1 text-xs text-gray-500">
                      ({formData.teaching_style.length}/300 characters, minimum 50)
                    </span>
                  </Label>
                  <Textarea
                    id="teaching_style"
                    name="teaching_style"
                    placeholder="Describe your teaching approach and methodology."
                    value={formData.teaching_style}
                    onChange={handleInputChange}
                    rows={4}
                    maxLength={300}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>What Students Can Expect *</Label>
                  <p className="text-xs text-gray-500 mb-2">
                    Add at least 2 points about what students can expect from your sessions
                  </p>

                  {formData.what_to_expect.map((item, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Input
                        placeholder={`Point ${index + 1}`}
                        value={item}
                        onChange={(e) => handleWhatToExpectChange(index, e.target.value)}
                      />
                      <Button
                        type="button"
                        onClick={() => handleRemoveWhatToExpect(index)}
                        variant="ghost"
                        className="text-red-500 hover:bg-red-50 hover:text-red-600 hover:cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <Button
                    type="button"
                    onClick={handleAddWhatToExpect}
                    variant="outline"
                    className="border-[#ffc6a8] text-deep-cocoa hover:bg-[#fff2e7] hover:cursor-pointer"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Another Point
                  </Button>
                </div>

                <div className="flex justify-between">
                  <Button
                    onClick={prevTab}
                    variant="outline"
                    className="border-[#ffc6a8] text-deep-cocoa hover:bg-[#fff2e7] hover:cursor-pointer"
                  >
                    Back
                  </Button>
                  <Button onClick={nextTab} className="bg-warm-coral text-white hover:bg-[#ff8c61] hover:cursor-pointer">
                    Next: Contact & Location
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contact" className="mt-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="e.g. San Francisco, CA, USA"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone *</Label>
                  <Select value={formData.timezone} onValueChange={(value) => handleSelectChange("timezone", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC-12:00">UTC-12:00</SelectItem>
                      <SelectItem value="UTC-11:00">UTC-11:00</SelectItem>
                      <SelectItem value="UTC-10:00">UTC-10:00 (Hawaii)</SelectItem>
                      <SelectItem value="UTC-09:00">UTC-09:00 (Alaska)</SelectItem>
                      <SelectItem value="UTC-08:00">UTC-08:00 (Pacific Time)</SelectItem>
                      <SelectItem value="UTC-07:00">UTC-07:00 (Mountain Time)</SelectItem>
                      <SelectItem value="UTC-06:00">UTC-06:00 (Central Time)</SelectItem>
                      <SelectItem value="UTC-05:00">UTC-05:00 (Eastern Time)</SelectItem>
                      <SelectItem value="UTC-04:00">UTC-04:00 (Atlantic Time)</SelectItem>
                      <SelectItem value="UTC-03:00">UTC-03:00</SelectItem>
                      <SelectItem value="UTC-02:00">UTC-02:00</SelectItem>
                      <SelectItem value="UTC-01:00">UTC-01:00</SelectItem>
                      <SelectItem value="UTC+00:00">UTC+00:00 (London)</SelectItem>
                      <SelectItem value="UTC+01:00">UTC+01:00 (Central Europe)</SelectItem>
                      <SelectItem value="UTC+02:00">UTC+02:00 (Eastern Europe)</SelectItem>
                      <SelectItem value="UTC+03:00">UTC+03:00 (Moscow)</SelectItem>
                      <SelectItem value="UTC+04:00">UTC+04:00</SelectItem>
                      <SelectItem value="UTC+05:00">UTC+05:00</SelectItem>
                      <SelectItem value="UTC+05:30">UTC+05:30 (India)</SelectItem>
                      <SelectItem value="UTC+06:00">UTC+06:00</SelectItem>
                      <SelectItem value="UTC+07:00">UTC+07:00</SelectItem>
                      <SelectItem value="UTC+08:00">UTC+08:00 (China)</SelectItem>
                      <SelectItem value="UTC+09:00">UTC+09:00 (Japan)</SelectItem>
                      <SelectItem value="UTC+10:00">UTC+10:00</SelectItem>
                      <SelectItem value="UTC+11:00">UTC+11:00</SelectItem>
                      <SelectItem value="UTC+12:00">UTC+12:00</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="e.g. +1 (555) 123-4567"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Your phone number will not be shared with students. It's for account verification only.
                  </p>
                </div>

                <Separator className="my-6" />

                <div className="rounded-lg bg-[#fff8f0] p-4">
                  <h3 className="mb-2 font-medium text-deep-cocoa">Almost Done!</h3>
                  <p className="mb-4 text-sm text-gray-700">
                    After completing your profile, you'll need to set your availability in the dashboard. This will
                    allow students to book sessions with you.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Your profile is {progress}% complete</span>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button
                    onClick={prevTab}
                    variant="outline"
                    className="border-[#ffc6a8] text-deep-cocoa hover:bg-[#fff2e7] hover:cursor-pointer"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={loading || progress < 80}
                    className="bg-warm-coral text-white hover:bg-[#ff8c61] hover:cursor-pointer"
                  >
                    {loading ? "Saving..." : "Complete Profile"}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
