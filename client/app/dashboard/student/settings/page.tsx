"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { Upload, Edit, Check, X, Trash2 } from "lucide-react"
import CalendarTab from "@/components/dashboard/student/calendar-tab"
import { Switch } from "@/components/ui/switch"

export default function SettingsPage() {
  const { user, updateUser } = useAuth()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    bio: user?.bio || "",
    time_zone: user?.time_zone || "",
    learning_goals: user?.learning_goals?.join(", ") || "",
    preferred_languages: user?.preferred_languages?.join(", ") || "",
  })

  const [originalProfileData, setOriginalProfileData] = useState({ ...profileData })

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  })

  const [paymentMethod, setPaymentMethod] = useState({
    card_type: "visa",
    last_four: "",
    expiry_month: "",
    expiry_year: "",
    cardholder_name: "",
    is_default: true,
  })

  interface PaymentMethod {
    id: string
    card_type: string
    last_four: string
    expiry_month: string
    expiry_year: string
    cardholder_name: string
    is_default: boolean
  }

  interface PaymentHistory {
    id: string
    date: string
    description: string
    amount: number
    status: string
  }

  const [savedPaymentMethods, setSavedPaymentMethods] = useState<PaymentMethod[]>([])
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([])
  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    sms_notifications: false,
    marketing_emails: true,
  })

  // Fetch payment methods and payment history on component mount
  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        const [methodsResponse, historyResponse] = await Promise.all([
          axios.get("/api/students/payment-methods"),
          axios.get("/api/students/payment-history"),
        ])

        setSavedPaymentMethods(methodsResponse.data || [])
        setPaymentHistory(historyResponse.data || [])
      } catch (error) {
        console.error("Error fetching payment data:", error)
      }
    }

    fetchPaymentData()
  }, [])

  // Start editing profile
  const handleEditProfile = () => {
    setOriginalProfileData({ ...profileData })
    setIsEditing(true)
  }

  // Cancel editing profile
  const handleCancelEdit = () => {
    setProfileData({ ...originalProfileData })
    setIsEditing(false)
  }

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfileData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPaymentMethod((prev) => ({ ...prev, [name]: value }))
  }

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
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
      setIsEditing(false)

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

  const [deletePassword, setDeletePassword] = useState("")

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)

      await axios.delete("/api/students/delete-account", {
        data: { password: deletePassword },
      })

      toast({
        title: "Account Deleted",
        description: "Your account has been successfully deleted.",
      })

      // Log the user out and redirect
      window.location.href = "/"
    } catch (error) {
      console.error("Delete account error:", error)
      toast({
        title: "Error",
        description: "Failed to delete account. Please check your password.",
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

      await axios.put("/api/students/change-password", {
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

  const handleAddPaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)

      const response = await axios.post("/api/students/payment-methods", paymentMethod)

      setSavedPaymentMethods([...savedPaymentMethods, response.data])

      // Reset form
      setPaymentMethod({
        card_type: "visa",
        last_four: "",
        expiry_month: "",
        expiry_year: "",
        cardholder_name: "",
        is_default: true,
      })

      toast({
        title: "Success",
        description: "Payment method added successfully",
      })
    } catch (error) {
      console.error("Error adding payment method:", error)
      toast({
        title: "Error",
        description: "Failed to add payment method",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePaymentMethod = async (id: string) => {
    try {
      setLoading(true)

      await axios.delete(`/api/students/payment-methods/${id}`)

      setSavedPaymentMethods(savedPaymentMethods.filter((method) => method.id !== id))

      toast({
        title: "Success",
        description: "Payment method removed successfully",
      })
    } catch (error) {
      console.error("Error removing payment method:", error)
      toast({
        title: "Error",
        description: "Failed to remove payment method",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSetDefaultPaymentMethod = async (id: string) => {
    try {
      setLoading(true)

      await axios.put(`/api/students/payment-methods/${id}/default`)

      // Update local state
      setSavedPaymentMethods(
        savedPaymentMethods.map((method) => ({
          ...method,
          is_default: method.id === id,
        })),
      )

      toast({
        title: "Success",
        description: "Default payment method updated",
      })
    } catch (error) {
      console.error("Error updating default payment method:", error)
      toast({
        title: "Error",
        description: "Failed to update default payment method",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNotifications = async () => {
    try {
      setLoading(true)

      await axios.put("/api/students/notifications", notificationSettings)

      toast({
        title: "Success",
        description: "Notification settings updated successfully",
      })
    } catch (error) {
      console.error("Error updating notification settings:", error)
      toast({
        title: "Error",
        description: "Failed to update notification settings",
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
    <div className="container mx-auto max-w-6xl min-h-[80vh]">
      <h1 className="mb-6 text-3xl font-bold text-deep-cocoa">Settings</h1>

      <Tabs defaultValue="account" className="h-full">
        <div className="flex h-full">
          <div className="mr-8 w-48 shrink-0">
            <TabsList className="flex w-full flex-col items-start justify-start">
              <TabsTrigger value="account" className="mb-1 w-full justify-start px-2">
                Account
              </TabsTrigger>
              <TabsTrigger value="password" className="mb-1 w-full justify-start px-2">
                Password
              </TabsTrigger>
              <TabsTrigger value="payment-methods" className="mb-1 w-full justify-start px-2">
                Payment methods
              </TabsTrigger>
              <TabsTrigger value="payment-history" className="mb-1 w-full justify-start px-2">
                Payment history
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
            <TabsContent value="account" className="h-full">
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-deep-cocoa">Account Settings</h2>
                    {!isEditing ? (
                      <Button
                        onClick={handleEditProfile}
                        variant="outline"
                        className="border-[#ffc6a8] text-deep-cocoa hover:bg-[#fff2e7] hover:cursor-pointer"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          onClick={handleCancelEdit}
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50 hover:cursor-pointer"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Cancel
                        </Button>
                        <Button
                          onClick={handleProfileSubmit}
                          className="bg-[#ffc6a8] text-deep-cocoa hover:bg-[#ffb289] hover:cursor-pointer"
                          disabled={loading}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Save Changes
                        </Button>
                      </div>
                    )}
                  </div>

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
                          <Button variant="outline" className="border-[#ffc6a8] text-deep-cocoa hover:bg-[#fff2e7] hover:cursor-pointer">
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

                  <form>
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
                          disabled={!isEditing}
                          className={!isEditing ? "bg-gray-50" : ""}
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
                          disabled={!isEditing}
                          className={!isEditing ? "bg-gray-50" : ""}
                        />
                      </div>
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
                        disabled={!isEditing}
                        className={!isEditing ? "bg-gray-50" : ""}
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
                        disabled={!isEditing}
                        className={!isEditing ? "bg-gray-50" : ""}
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
                        disabled={!isEditing}
                        className={!isEditing ? "bg-gray-50" : ""}
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
                        disabled={!isEditing}
                        className={!isEditing ? "bg-gray-50" : ""}
                      />
                    </div>
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
                      className="bg-[#ffc6a8] text-deep-cocoa hover:bg-[#ffb289] hover:cursor-pointer"
                      disabled={loading}
                    >
                      {loading ? "Updating..." : "Update password"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payment-methods">
              <Card>
                <CardContent className="p-6">
                  <h2 className="mb-6 text-2xl font-bold text-deep-cocoa">Payment Methods</h2>

                  {savedPaymentMethods.length > 0 && (
                    <div className="mb-8 rounded-lg border border-gray-200 p-6">
                      <h3 className="mb-4 text-lg font-semibold text-deep-cocoa">Saved Payment Methods</h3>

                      {savedPaymentMethods.map((method) => (
                        <div
                          key={method.id}
                          className="mb-4 flex items-center justify-between rounded-lg border border-gray-200 p-4"
                        >
                          <div className="flex items-center">
                            <div className="mr-4 h-10 w-16 rounded bg-[#ffc6a8] flex items-center justify-center">
                              <span className="text-sm font-medium text-deep-cocoa">
                                {method.card_type === "visa"
                                  ? "VISA"
                                  : method.card_type === "mastercard"
                                    ? "MC"
                                    : method.card_type === "amex"
                                      ? "AMEX"
                                      : method.card_type === "discover"
                                        ? "DISC"
                                        : "CARD"}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">•••• •••• •••• {method.last_four}</p>
                              <p className="text-sm text-gray-500">
                                Expires {method.expiry_month}/{method.expiry_year}
                              </p>
                              {method.is_default && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {!method.is_default && (
                              <Button
                                variant="outline"
                                className="text-green-600 hover:bg-green-50"
                                onClick={() => handleSetDefaultPaymentMethod(method.id)}
                              >
                                Set Default
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              className="text-red-500 hover:bg-red-50 hover:cursor-pointer"
                              onClick={() => handleDeletePaymentMethod(method.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {savedPaymentMethods.length === 0 && (
                    <div className="mb-8 rounded-lg border border-gray-200 p-6">
                      <p className="text-gray-500 text-center py-4">You don't have any payment methods yet.</p>
                    </div>
                  )}

                  <div className="rounded-lg border border-gray-200 p-6">
                    <h3 className="mb-4 text-lg font-semibold text-deep-cocoa">Add New Payment Method</h3>

                    <form onSubmit={handleAddPaymentMethod}>
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                          <Label htmlFor="card_type" className="mb-2 block">
                            Card Type
                          </Label>
                          <select
                            id="card_type"
                            name="card_type"
                            value={paymentMethod.card_type}
                            onChange={(e) => setPaymentMethod({ ...paymentMethod, card_type: e.target.value })}
                            className="w-full rounded-md border border-gray-300 p-2"
                          >
                            <option value="visa">Visa</option>
                            <option value="mastercard">Mastercard</option>
                            <option value="amex">American Express</option>
                            <option value="discover">Discover</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        <div>
                          <Label htmlFor="cardholder_name" className="mb-2 block">
                            Name on Card
                          </Label>
                          <Input
                            id="cardholder_name"
                            name="cardholder_name"
                            placeholder="John Doe"
                            value={paymentMethod.cardholder_name}
                            onChange={handlePaymentMethodChange}
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="last_four" className="mb-2 block">
                            Last 4 Digits
                          </Label>
                          <Input
                            id="last_four"
                            name="last_four"
                            placeholder="1234"
                            maxLength={4}
                            value={paymentMethod.last_four}
                            onChange={handlePaymentMethodChange}
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="expiry_month" className="mb-2 block">
                              Expiry Month
                            </Label>
                            <Input
                              id="expiry_month"
                              name="expiry_month"
                              placeholder="MM"
                              maxLength={2}
                              value={paymentMethod.expiry_month}
                              onChange={handlePaymentMethodChange}
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="expiry_year" className="mb-2 block">
                              Expiry Year
                            </Label>
                            <Input
                              id="expiry_year"
                              name="expiry_year"
                              placeholder="YY"
                              maxLength={2}
                              value={paymentMethod.expiry_year}
                              onChange={handlePaymentMethodChange}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex items-center">
                        <input
                          id="default-payment"
                          type="checkbox"
                          checked={paymentMethod.is_default}
                          onChange={(e) => setPaymentMethod({ ...paymentMethod, is_default: e.target.checked })}
                          className="h-4 w-4 rounded border-gray-300 text-[#ffc6a8] focus:ring-[#ffc6a8]"
                        />
                        <Label htmlFor="default-payment" className="ml-2">
                          Set as default payment method
                        </Label>
                      </div>

                      <Button
                        type="submit"
                        className="mt-6 bg-[#ffc6a8] text-deep-cocoa hover:bg-[#ffb289] hover:cursor-pointer"
                        disabled={loading}
                      >
                        {loading ? "Processing..." : "Add Payment Method"}
                      </Button>

                      <p className="mt-4 text-xs text-gray-500">Your payment information is encrypted and secure.</p>
                    </form>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payment-history">
              <Card>
                <CardContent className="p-6">
                  <h2 className="mb-6 text-2xl font-bold text-deep-cocoa">Payment History</h2>

                  {paymentHistory.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="py-2 px-4 text-left">Date</th>
                            <th className="py-2 px-4 text-left">Description</th>
                            <th className="py-2 px-4 text-left">Amount</th>
                            <th className="py-2 px-4 text-left">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paymentHistory.map((payment) => (
                            <tr key={payment.id} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-4">{new Date(payment.date).toLocaleDateString()}</td>
                              <td className="py-3 px-4">{payment.description}</td>
                              <td className="py-3 px-4">${payment.amount.toFixed(2)}</td>
                              <td className="py-3 px-4">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    payment.status === "completed"
                                      ? "bg-green-100 text-green-800"
                                      : payment.status === "pending"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : payment.status === "failed"
                                          ? "bg-red-100 text-red-800"
                                          : "bg-blue-100 text-blue-800"
                                  }`}
                                >
                                  {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">You don&apos;t have any payment history yet.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="calendar">
              <Card>
                <CardContent className="p-6">
                  <h2 className="mb-6 text-2xl font-bold text-deep-cocoa">Calendar Settings</h2>

                  <p className="text-gray-500 mb-3">You can view your calendar and sessions here:</p>
                  <CalendarTab />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardContent className="p-6">
                  <h2 className="mb-6 text-2xl font-bold text-deep-cocoa">Notification Settings</h2>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-deep-cocoa">Email Notifications</h3>
                        <p className="text-sm text-gray-500">
                          Receive notifications about sessions, messages, and updates via email
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.email_notifications}
                        onCheckedChange={(checked) => handleNotificationChange("email_notifications", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-deep-cocoa">SMS Notifications</h3>
                        <p className="text-sm text-gray-500">Receive text message reminders for upcoming sessions</p>
                      </div>
                      <Switch
                        checked={notificationSettings.sms_notifications}
                        onCheckedChange={(checked) => handleNotificationChange("sms_notifications", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-deep-cocoa">Marketing Emails</h3>
                        <p className="text-sm text-gray-500">
                          Receive promotional emails about new features and special offers
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.marketing_emails}
                        onCheckedChange={(checked) => handleNotificationChange("marketing_emails", checked)}
                      />
                    </div>

                    <Button
                      onClick={handleSaveNotifications}
                      className="mt-4 bg-[#ffc6a8] text-deep-cocoa hover:bg-[#ffb289]"
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Save notification preferences"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="delete-account">
              <Card>
                <CardContent className="p-6">
                  <h2 className="mb-6 text-2xl font-bold text-red-600">Delete Account</h2>
                  <p className="mb-4 text-sm text-gray-600">
                    This action is <strong>irreversible</strong>. Once you delete your account, all your data will be
                    permanently removed.
                  </p>
                  <form onSubmit={handleDeleteAccount}>
                    <div className="mb-4">
                      <Label htmlFor="delete_password" className="mb-2 block text-red-700">
                        Confirm password to delete account
                      </Label>
                      <Input
                        id="delete_password"
                        name="delete_password"
                        type="password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      variant="destructive"
                      className="bg-red-600 hover:bg-red-700 text-white"
                      disabled={loading}
                    >
                      {loading ? "Deleting..." : "Delete Account"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  )
}
