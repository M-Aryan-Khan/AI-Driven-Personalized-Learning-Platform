"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Plus, Trash2, Save, Eye, EyeOff } from "lucide-react"
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

export default function ExpertProfile() {
  const { user, refreshUser } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [formData, setFormData] = useState<ExpertFormData>({
    // Basic Info
    first_name: "",
    last_name: "",
    specialty: "",
    bio: "",
    hourly_rate: 0,

    // Qualifications
    education: "",
    experience_years: 0,
    languages: [],
    tags: [],

    // Teaching Details
    teaching_style: "",
    what_to_expect: [],

    // Contact & Location
    location: "",
    timezone: "",
    phone: "",

    // Profile Image
    profile_image: "",
  })

  const [newTag, setNewTag] = useState("")
  const [newLanguage, setNewLanguage] = useState("")
  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const response = await axios.get("/api/experts/profile")

        // Map API response to form data
        setFormData({
          first_name: response.data.first_name || "",
          last_name: response.data.last_name || "",
          specialty: response.data.specialty || "",
          bio: response.data.bio || "",
          hourly_rate: response.data.hourly_rate || 45,
          education: response.data.education || "",
          experience_years: response.data.experience_years || 0,
          languages: response.data.languages || ["English"],
          tags: response.data.tags || [],
          teaching_style: response.data.teaching_style || "",
          what_to_expect: response.data.what_to_expect || [""],
          location: response.data.location || "",
          timezone: response.data.timezone || "UTC+00:00",
          phone: response.data.phone || "",
          profile_image: response.data.profile_image || "",
        })
      } catch (error) {
        console.error("Error fetching profile:", error)
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [toast])

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
      setSaving(true)

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
      setSaving(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      setSaving(true)

      // Filter out empty what_to_expect items
      const cleanedFormData = {
        ...formData,
        what_to_expect: formData.what_to_expect.filter((item) => item.length > 0),
      }

      // Update profile
      await axios.put("/api/experts/profile", cleanedFormData)

      // Refresh user data
      await refreshUser()

      toast({
        title: "Success",
        description: "Your profile has been updated successfully!",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const userInitials =
    formData.first_name && formData.last_name
      ? `${formData.first_name[0]}${formData.last_name[0]}`
      : user?.first_name && user?.last_name
        ? `${user.first_name[0]}${user.last_name[0]}`
        : "EX"

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <div className="flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#ffc6a8] border-t-transparent"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-deep-cocoa">Your Profile</h1>
          <p className="text-gray-600">Manage how you appear to students on Synapse</p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="border-[#ffc6a8] text-deep-cocoa hover:bg-[#fff2e7] hover:cursor-pointer"
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Exit Preview
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Preview Profile
              </>
            )}
          </Button>

          <Button onClick={handleSaveProfile} disabled={saving} className="bg-warm-coral text-white hover:bg-[#ff8c61] hover:cursor-pointer">
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </div>

      {previewMode ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center md:flex-row md:items-start md:gap-6">
              <div className="mb-4 md:mb-0">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={formData.profile_image || ""} alt={formData.first_name || "Expert"} />
                  <AvatarFallback className="bg-[#ffc6a8] text-4xl text-deep-cocoa">{userInitials}</AvatarFallback>
                </Avatar>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-deep-cocoa">
                  {formData.first_name} {formData.last_name}
                </h2>
                <p className="text-lg text-warm-coral">{formData.specialty}</p>

                <div className="mt-2 flex flex-wrap justify-center gap-2 md:justify-start">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600 md:justify-start">
                  <div className="flex items-center">
                    <span className="font-medium">Experience:</span>
                    <span className="ml-1">{formData.experience_years} years</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium">Rate:</span>
                    <span className="ml-1">${formData.hourly_rate}/hour</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium">Location:</span>
                    <span className="ml-1">{formData.location}</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="grid gap-8 md:grid-cols-3">
              <div className="md:col-span-2">
                <div className="mb-6">
                  <h3 className="mb-2 text-lg font-medium text-deep-cocoa">About Me</h3>
                  <p className="text-gray-700">{formData.bio}</p>
                </div>

                <div className="mb-6">
                  <h3 className="mb-2 text-lg font-medium text-deep-cocoa">Teaching Style</h3>
                  <p className="text-gray-700">{formData.teaching_style}</p>
                </div>

                <div>
                  <h3 className="mb-2 text-lg font-medium text-deep-cocoa">What to Expect</h3>
                  <ul className="list-inside list-disc space-y-2 text-gray-700">
                    {formData.what_to_expect
                      .filter((item) => item.length > 0)
                      .map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                  </ul>
                </div>
              </div>

              <div>
                <div className="rounded-lg bg-[#fff8f0] p-4">
                  <h3 className="mb-3 text-lg font-medium text-deep-cocoa">Details</h3>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Languages</p>
                      <p className="text-gray-700">{formData.languages.join(", ")}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500">Education</p>
                      <p className="text-gray-700">{formData.education}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500">Timezone</p>
                      <p className="text-gray-700">{formData.timezone}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="qualifications">Qualifications</TabsTrigger>
                <TabsTrigger value="teaching">Teaching</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
              </TabsList>

              <TabsContent value="basic">
                <div className="space-y-6">
                  <div className="flex flex-col items-center gap-4 sm:flex-row">
                    <div className="flex flex-col items-center">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={formData.profile_image || ""} alt={formData.first_name || "User"} />
                        <AvatarFallback className="bg-[#ffc6a8] text-2xl text-deep-cocoa">
                          {userInitials}
                        </AvatarFallback>
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
                </div>
              </TabsContent>

              <TabsContent value="qualifications">
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
                            <Trash2 className="h-3 w-3" />
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
                            <Trash2 className="h-3 w-3" />
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
                </div>
              </TabsContent>

              <TabsContent value="teaching">
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
                </div>
              </TabsContent>

              <TabsContent value="contact">
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
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleSaveProfile}
                disabled={saving}
                className="bg-warm-coral text-white hover:bg-[#ff8c61] hover:cursor-pointer"
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
