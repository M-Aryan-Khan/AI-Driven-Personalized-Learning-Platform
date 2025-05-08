"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Save, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import axios from "@/lib/axios"

export default function ExpertSettings() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  const [emailNotifications, setEmailNotifications] = useState({
    newBookings: true,
    bookingReminders: true,
    bookingCancellations: true,
    messages: true,
    reviews: true,
    paymentReceipts: true,
    platformUpdates: false,
    marketingEmails: false,
  })

  const [savingNotifications, setSavingNotifications] = useState(false)
  const [deactivating, setDeactivating] = useState(false)
  const [confirmDeactivation, setConfirmDeactivation] = useState(false)
  const [deactivationReason, setDeactivationReason] = useState("")

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate passwords
    if (!currentPassword) {
      toast({
        title: "Error",
        description: "Please enter your current password",
        variant: "destructive",
      })
      return
    }

    if (!newPassword) {
      toast({
        title: "Error",
        description: "Please enter a new password",
        variant: "destructive",
      })
      return
    }

    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "New password must be at least 8 characters long",
        variant: "destructive",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      })
      return
    }

    try {
      setChangingPassword(true)

      await axios.post("/api/experts/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      })

      toast({
        title: "Success",
        description: "Your password has been changed successfully",
      })

      // Clear form
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      console.error("Error changing password:", error)

      const errorMessage = error.response?.data?.detail || "Failed to change password. Please try again."

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setChangingPassword(false)
    }
  }

  const handleSaveNotifications = async () => {
    try {
      setSavingNotifications(true)

      // In a real app, you would save to your API
      // await axios.put("/api/experts/notification-settings", emailNotifications)

      // For now, just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Success",
        description: "Notification settings saved successfully",
      })
    } catch (error) {
      console.error("Error saving notification settings:", error)
      toast({
        title: "Error",
        description: "Failed to save notification settings",
        variant: "destructive",
      })
    } finally {
      setSavingNotifications(false)
    }
  }

  const handleDeactivateAccount = async () => {
    if (!confirmDeactivation) {
      setConfirmDeactivation(true)
      return
    }

    try {
      setDeactivating(true)

      // In a real app, you would call your API
      // await axios.post("/api/experts/deactivate", { reason: deactivationReason })

      // For now, just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Account Deactivated",
        description: "Your account has been deactivated. We're sorry to see you go.",
      })

      // Log out the user
      logout()

      // Redirect to home page
      router.push("/")
    } catch (error) {
      console.error("Error deactivating account:", error)
      toast({
        title: "Error",
        description: "Failed to deactivate account",
        variant: "destructive",
      })
    } finally {
      setDeactivating(false)
    }
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-deep-cocoa">Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your password to keep your account secure</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 hover:cursor-pointer"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 hover:cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500">Password must be at least 8 characters long</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 hover:cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" disabled={changingPassword} className="bg-warm-coral text-white hover:bg-[#ff8c61] hover:cursor-pointer">
                {changingPassword ? "Changing Password..." : "Change Password"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Notifications</CardTitle>
            <CardDescription>Manage which emails you receive from Synapse</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-deep-cocoa">New Booking Notifications</p>
                  <p className="text-sm text-gray-500">Receive an email when a student books a session with you</p>
                </div>
                <Switch
                  checked={emailNotifications.newBookings}
                  onCheckedChange={(checked) => setEmailNotifications((prev) => ({ ...prev, newBookings: checked }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-deep-cocoa">Booking Reminders</p>
                  <p className="text-sm text-gray-500">Receive reminders about upcoming sessions</p>
                </div>
                <Switch
                  checked={emailNotifications.bookingReminders}
                  onCheckedChange={(checked) =>
                    setEmailNotifications((prev) => ({ ...prev, bookingReminders: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-deep-cocoa">Booking Cancellations</p>
                  <p className="text-sm text-gray-500">Receive notifications when a student cancels a session</p>
                </div>
                <Switch
                  checked={emailNotifications.bookingCancellations}
                  onCheckedChange={(checked) =>
                    setEmailNotifications((prev) => ({ ...prev, bookingCancellations: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-deep-cocoa">New Messages</p>
                  <p className="text-sm text-gray-500">Receive notifications when you get a new message</p>
                </div>
                <Switch
                  checked={emailNotifications.messages}
                  onCheckedChange={(checked) => setEmailNotifications((prev) => ({ ...prev, messages: checked }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-deep-cocoa">New Reviews</p>
                  <p className="text-sm text-gray-500">Receive notifications when a student leaves a review</p>
                </div>
                <Switch
                  checked={emailNotifications.reviews}
                  onCheckedChange={(checked) => setEmailNotifications((prev) => ({ ...prev, reviews: checked }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-deep-cocoa">Payment Receipts</p>
                  <p className="text-sm text-gray-500">Receive receipts for payments</p>
                </div>
                <Switch
                  checked={emailNotifications.paymentReceipts}
                  onCheckedChange={(checked) =>
                    setEmailNotifications((prev) => ({ ...prev, paymentReceipts: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-deep-cocoa">Platform Updates</p>
                  <p className="text-sm text-gray-500">Receive updates about new features and improvements</p>
                </div>
                <Switch
                  checked={emailNotifications.platformUpdates}
                  onCheckedChange={(checked) =>
                    setEmailNotifications((prev) => ({ ...prev, platformUpdates: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-deep-cocoa">Marketing Emails</p>
                  <p className="text-sm text-gray-500">Receive promotional emails and special offers</p>
                </div>
                <Switch
                  checked={emailNotifications.marketingEmails}
                  onCheckedChange={(checked) =>
                    setEmailNotifications((prev) => ({ ...prev, marketingEmails: checked }))
                  }
                />
              </div>

              <div className="mt-6">
                <Button
                  onClick={handleSaveNotifications}
                  disabled={savingNotifications}
                  className="bg-warm-coral text-white hover:bg-[#ff8c61] hover:cursor-pointer"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {savingNotifications ? "Saving..." : "Save Notification Settings"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Deactivate Account</CardTitle>
            <CardDescription>Temporarily disable your account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
              <div className="flex items-start">
                <AlertTriangle className="mr-3 h-5 w-5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">Warning: Account Deactivation</h3>
                  <p className="mt-1 text-sm">
                    Deactivating your account will hide your profile from students and prevent new bookings. Your
                    account data will be preserved, and you can reactivate your account at any time by logging in.
                  </p>
                </div>
              </div>
            </div>

            {confirmDeactivation ? (
              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deactivation-reason">Please tell us why you're leaving (optional)</Label>
                  <Input
                    id="deactivation-reason"
                    value={deactivationReason}
                    onChange={(e) => setDeactivationReason(e.target.value)}
                    placeholder="Your feedback helps us improve"
                  />
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="hover:cursor-pointer" onClick={() => setConfirmDeactivation(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDeactivateAccount} className="hover:cursor-pointer" disabled={deactivating}>
                    {deactivating ? "Deactivating..." : "Confirm Deactivation"}
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="destructive" className="mt-6 bg-red-600 text-white hover:cursor-pointer" onClick={handleDeactivateAccount}>
                Deactivate Account
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
