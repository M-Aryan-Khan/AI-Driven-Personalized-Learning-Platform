"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import axios from "@/lib/axios"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Upload } from "lucide-react"

export default function SettingsPage() {
  const { user, updateUser } = useAuth()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    bio: user?.bio || "",
    phone_number: "",
    time_zone: user?.time_zone || "",
    learning_goals: user?.learning_goals?.join(", ") || "",
    preferred_languages: user?.preferred_languages?.join(", ") || "",
  })

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  })

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfileData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)

      const formattedData = {
        ...profileData,
        learning_goals: profileData.learning_goals
          ? profileData.learning_goals.split(",").map((goal) => goal.trim())
          : [],
        preferred_languages: profileData.preferred_languages
          ? profileData.preferred_languages.split(",").map((lang) => lang.trim())
          : [],
      }

      const response = await axios.put("/api/students/profile", formattedData)

      updateUser(response.data)

      toast({
        title: "Success",
        description: "Your profile has been updated",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordData.new_password !== passwordData.confirm_password) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      await axios.post("/api/auth/change-password", {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      })

      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      })

      toast({
        title: "Success",
        description: "Your password has been updated",
      })
    } catch (error) {
      console.error("Error updating password:", error)
      toast({
        title: "Error",
        description: "Failed to update password. Please check your current password.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)

    try {
      setLoading(true)

      const response = await axios.post("/api/students/profile/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      updateUser({
        ...user,
        profile_image: response.data.image_url,
      })

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

  const userInitials = user?.first_name && user?.last_name ? `${user.first_name[0]}${user.last_name[0]}` : "ST"

  return (
    <div className="container mx-auto max-w-4xl">
      <h1 className="mb-6 text-3xl font-bold text-deep-cocoa">Settings</h1>

      <Tabs defaultValue="account">
        <div className="flex">
          <div className="mr-8 w-48 shrink-0">
            <TabsList className="flex w-full flex-col items-start justify-start">
              <TabsTrigger value="account" className="mb-1 w-full justify-start px-2">
                Account
              </TabsTrigger>
              <TabsTrigger value="password" className="mb-1 w-full justify-start px-2">
                Password
              </TabsTrigger>
              <TabsTrigger value="email" className="mb-1 w-full justify-start px-2">
                Email
              </TabsTrigger>
              <TabsTrigger value="payment-methods" className="mb-1 w-full justify-start px-2">
                Payment methods
              </TabsTrigger>
              <TabsTrigger value="payment-history" className="mb-1 w-full justify-start px-2">
                Payment history
              </TabsTrigger>
              <TabsTrigger value="autoconfirmation" className="mb-1 w-full justify-start px-2">
                Autoconfirmation
              </TabsTrigger>
              <TabsTrigger value="calendar" className="mb-1 w-full justify-start px-2">
                Calendar
              </TabsTrigger>
              <TabsTrigger value="notifications" className="mb-1 w-full justify-start px-2">
                Notifications
              </TabsTrigger>
              <TabsTrigger value="delete-account" className="mb-1 w-full justify-start px-2">
                Delete account
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1">
            <TabsContent value="account">
              <Card>
                <CardContent className="p-6">
                  <h2 className="mb-6 text-2xl font-bold text-deep-cocoa">Account Settings</h2>

                  <div className="mb-8">
                    <h3 className="mb-4 text-lg font-semibold text-deep-cocoa">Profile image</h3>
                    <div className="flex items-center gap-6">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={user?.profile_image || ""} alt={user?.first_name || "User"} />
                        <AvatarFallback className="bg-[#ffc6a8] text-2xl text-deep-cocoa">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <Label htmlFor="profile-image" className="mb-2 block">
                          <Button variant="outline" className="border-[#ffc6a8] text-deep-cocoa hover:bg-[#fff2e7]">
                            <Upload className="mr-2 h-4 w-4" />
                            Upload photo
                          </Button>
                        </Label>
                        <Input
                          id="profile-image"
                          type="file"
                          accept="image/jpeg, image/png"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                        <p className="text-sm text-gray-500">
                          Maximum size — 2MB
                          <br />
                          JPG or PNG format
                        </p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleProfileSubmit}>
                    <div className="mb-6 grid gap-6 md:grid-cols-2">
                      <div>
                        <Label htmlFor="first_name" className="mb-2 block">
                          First name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="first_name"
                          name="first_name"
                          value={profileData.first_name}
                          onChange={handleProfileChange}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="last_name" className="mb-2 block">
                          Last name
                        </Label>
                        <Input
                          id="last_name"
                          name="last_name"
                          value={profileData.last_name}
                          onChange={handleProfileChange}
                        />
                      </div>
                    </div>

                    <div className="mb-6">
                      <Label htmlFor="phone_number" className="mb-2 block">
                        Phone number
                      </Label>
                      <Input
                        id="phone_number"
                        name="phone_number"
                        value={profileData.phone_number}
                        onChange={handleProfileChange}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div className="mb-6">
                      <Label htmlFor="time_zone" className="mb-2 block">
                        Time zone
                      </Label>
                      <Input
                        id="time_zone"
                        name="time_zone"
                        value={profileData.time_zone}
                        onChange={handleProfileChange}
                        placeholder="e.g. America/New_York"
                      />
                    </div>

                    <div className="mb-6">
                      <Label htmlFor="learning_goals" className="mb-2 block">
                        Learning goals (comma separated)
                      </Label>
                      <Input
                        id="learning_goals"
                        name="learning_goals"
                        value={profileData.learning_goals}
                        onChange={handleProfileChange}
                        placeholder="e.g. Python, Machine Learning, Web Development"
                      />
                    </div>

                    <div className="mb-6">
                      <Label htmlFor="preferred_languages" className="mb-2 block">
                        Preferred languages (comma separated)
                      </Label>
                      <Input
                        id="preferred_languages"
                        name="preferred_languages"
                        value={profileData.preferred_languages}
                        onChange={handleProfileChange}
                        placeholder="e.g. English, Spanish, French"
                      />
                    </div>

                    <div className="mb-6">
                      <Label htmlFor="bio" className="mb-2 block">
                        Bio
                      </Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        value={profileData.bio}
                        onChange={handleProfileChange}
                        rows={4}
                        placeholder="Tell tutors a bit about yourself and your learning goals..."
                      />
                    </div>

                    <Button
                      type="submit"
                      className="bg-[#ffc6a8] text-deep-cocoa hover:bg-[#ffb289]"
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Save changes"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="password">
              <Card>
                <CardContent className="p-6">
                  <h2 className="mb-6 text-2xl font-bold text-deep-cocoa">Change Password</h2>

                  <form onSubmit={handlePasswordSubmit}>
                    <div className="mb-6">
                      <Label htmlFor="current_password" className="mb-2 block">
                        Current password
                      </Label>
                      <Input
                        id="current_password"
                        name="current_password"
                        type="password"
                        value={passwordData.current_password}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>

                    <div className="mb-6">
                      <Label htmlFor="new_password" className="mb-2 block">
                        New password
                      </Label>
                      <Input
                        id="new_password"
                        name="new_password"
                        type="password"
                        value={passwordData.new_password}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>

                    <div className="mb-6">
                      <Label htmlFor="confirm_password" className="mb-2 block">
                        Confirm new password
                      </Label>
                      <Input
                        id="confirm_password"
                        name="confirm_password"
                        type="password"
                        value={passwordData.confirm_password}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="bg-[#ffc6a8] text-deep-cocoa hover:bg-[#ffb289]"
                      disabled={loading}
                    >
                      {loading ? "Updating..." : "Update password"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="email">
              <Card>
                <CardContent className="p-6">
                  <h2 className="mb-6 text-2xl font-bold text-deep-cocoa">Email Settings</h2>

                  <div className="mb-6">
                    <Label htmlFor="email" className="mb-2 block">
                      Email address
                    </Label>
                    <Input id="email" type="email" value={user?.email || ""} disabled />
                    <p className="mt-2 text-sm text-gray-500">To change your email address, please contact support.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payment-methods">
              <Card>
                <CardContent className="p-6">
                  <h2 className="mb-6 text-2xl font-bold text-deep-cocoa">Payment Methods</h2>

                  <p className="text-gray-500">You don&apos;t have any payment methods yet.</p>

                  <Button className="mt-4 bg-[#ffc6a8] text-deep-cocoa hover:bg-[#ffb289]">Add payment method</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payment-history">
              <Card>
                <CardContent className="p-6">
                  <h2 className="mb-6 text-2xl font-bold text-deep-cocoa">Payment History</h2>

                  <p className="text-gray-500">You don&apos;t have any payment history yet.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="autoconfirmation">
              <Card>
                <CardContent className="p-6">
                  <h2 className="mb-6 text-2xl font-bold text-deep-cocoa">Autoconfirmation</h2>

                  <p className="text-gray-500">This feature is coming soon.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="calendar">
              <Card>
                <CardContent className="p-6">
                  <h2 className="mb-6 text-2xl font-bold text-deep-cocoa">Calendar Settings</h2>

                  <p className="text-gray-500">Calendar integration features are coming soon.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardContent className="p-6">
                  <h2 className="mb-6 text-2xl font-bold text-deep-cocoa">Notification Settings</h2>

                  <p className="text-gray-500">Notification settings are coming soon.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="delete-account">
              <Card>
                <CardContent className="p-6">
                  <h2 className="mb-6 text-2xl font-bold text-deep-cocoa">Delete Account</h2>

                  <p className="mb-4 text-gray-500">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>

                  <Button variant="destructive">Delete my account</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  )
}
