"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, DollarSign, Clock, Download, CreditCard, ChevronRight, FileText, Loader2, AlertTriangle, Plus, BanknoteIcon as Bank, CheckCircle, X } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import axios from "@/lib/axios"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type Earning = {
  id: string
  session_id: string
  student_name: string
  date: string
  amount: number
  status: "pending" | "paid" | "cancelled"
  payout_date?: string
}

type PaymentMethod = {
  id: string
  type: "paypal" | "bank_transfer"
  details: {
    email?: string
    account_number?: string
    routing_number?: string
    bank_name?: string
  }
  is_default: boolean
}

type EarningsStats = {
  total_earnings: number
  pending_earnings: number
  paid_earnings: number
  total_sessions: number
}

export default function ExpertEarnings() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [earnings, setEarnings] = useState<Earning[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [activeTab, setActiveTab] = useState("overview")
  const [timeFilter, setTimeFilter] = useState("this_month")
  const [stats, setStats] = useState<EarningsStats>({
    total_earnings: 0,
    pending_earnings: 0,
    paid_earnings: 0,
    total_sessions: 0,
  })

  // Payment method form state
  const [addingPaymentMethod, setAddingPaymentMethod] = useState(false)
  const [paymentMethodType, setPaymentMethodType] = useState<"paypal" | "bank_transfer">("paypal")
  const [paypalEmail, setPaypalEmail] = useState("")
  const [bankName, setBankName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [routingNumber, setRoutingNumber] = useState("")
  const [accountHolderName, setAccountHolderName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    fetchEarningsData()
  }, [timeFilter])

  const fetchEarningsData = async () => {
    try {
      setLoading(true)

      // Fetch earnings data
      const earningsResponse = await axios.get(`/api/experts/earnings?timeFilter=${timeFilter}`)
      
      if (earningsResponse.data) {
        setEarnings(earningsResponse.data.earnings || [])
        setStats(earningsResponse.data.stats || {
          total_earnings: 0,
          pending_earnings: 0,
          paid_earnings: 0,
          total_sessions: 0,
        })
      }

      // Fetch payment methods
      const paymentMethodsResponse = await axios.get('/api/experts/payment-methods')
      
      if (paymentMethodsResponse.data) {
        setPaymentMethods(paymentMethodsResponse.data || [])
      }

    } catch (error) {
      console.error("Error fetching earnings data:", error)
      
      // Set empty data if API fails
      setEarnings([])
      setStats({
        total_earnings: 0,
        pending_earnings: 0,
        paid_earnings: 0,
        total_sessions: 0,
      })
      setPaymentMethods([])
      
      toast({
        title: "Error",
        description: "Failed to load earnings data. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddPaymentMethod = async () => {
    try {
      setIsSubmitting(true)
      
      if (paymentMethodType === "paypal" && !paypalEmail) {
        toast({
          title: "Missing information",
          description: "Please enter your PayPal email address",
          variant: "destructive",
        })
        return
      }
      
      if (paymentMethodType === "bank_transfer" && (!bankName || !accountNumber || !routingNumber || !accountHolderName)) {
        toast({
          title: "Missing information",
          description: "Please fill in all bank account details",
          variant: "destructive",
        })
        return
      }
      
      const payload = {
        type: paymentMethodType,
        details: paymentMethodType === "paypal" 
          ? { email: paypalEmail }
          : { 
              bank_name: bankName,
              account_number: accountNumber,
              routing_number: routingNumber,
              account_holder_name: accountHolderName
            },
        is_default: paymentMethods.length === 0 // Make default if it's the first payment method
      }
      
      const response = await axios.post('/api/experts/payment-methods', payload)
      
      if (response.data) {
        // Refresh payment methods
        fetchEarningsData()
        
        toast({
          title: "Success",
          description: "Payment method added successfully",
        })
        
        // Reset form
        setPaymentMethodType("paypal")
        setPaypalEmail("")
        setBankName("")
        setAccountNumber("")
        setRoutingNumber("")
        setAccountHolderName("")
        setDialogOpen(false)
      }
    } catch (error) {
      console.error("Error adding payment method:", error)
      toast({
        title: "Error",
        description: "Failed to add payment method. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSetDefaultPaymentMethod = async (id: string) => {
    try {
      await axios.put(`/api/experts/payment-methods/${id}/default`)
      
      // Update local state
      const updatedMethods = paymentMethods.map(method => ({
        ...method,
        is_default: method.id === id
      }))
      
      setPaymentMethods(updatedMethods)
      
      toast({
        title: "Success",
        description: "Default payment method updated",
      })
    } catch (error) {
      console.error("Error setting default payment method:", error)
      toast({
        title: "Error",
        description: "Failed to update default payment method",
        variant: "destructive",
      })
    }
  }

  const handleRemovePaymentMethod = async (id: string) => {
    try {
      await axios.delete(`/api/experts/payment-methods/${id}`)
      
      // Update local state
      const updatedMethods = paymentMethods.filter(method => method.id !== id)
      setPaymentMethods(updatedMethods)
      
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
    }
  }

  const handleDownloadStatement = async () => {
    try {
      toast({
        title: "Generating statement",
        description: "Your earnings statement is being generated...",
      })
      
      const response = await axios.get(`/api/experts/earnings/statement?timeFilter=${timeFilter}`, {
        responseType: 'blob'
      })
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `earnings-statement-${timeFilter}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      
      toast({
        title: "Success",
        description: "Statement downloaded successfully",
      })
    } catch (error) {
      console.error("Error downloading statement:", error)
      toast({
        title: "Error",
        description: "Failed to download statement. Please try again.",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "paid":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getFilteredEarnings = () => {
    return earnings
  }

  const filteredEarnings = getFilteredEarnings()

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 md:px-6">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-deep-cocoa md:text-3xl">Earnings</h1>
          <p className="text-gray-600">Track your income from teaching sessions</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="outline"
            className="border-[#ffc6a8] text-deep-cocoa hover:bg-[#fff2e7] hover:cursor-pointer"
            onClick={handleDownloadStatement}
          >
            <Download className="mr-2 h-4 w-4" />
            Download Statement
          </Button>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-warm-coral text-deep-cocoa hover:bg-[#ff8c61] hover:cursor-pointer">
                <CreditCard className="mr-2 h-4 w-4" />
                Add Payment Method
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Payment Method</DialogTitle>
                <DialogDescription>
                  Add a payment method to receive your earnings
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="payment-type">Payment Method Type</Label>
                  <Select
                    value={paymentMethodType}
                    onValueChange={(value: "paypal" | "bank_transfer") => setPaymentMethodType(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {paymentMethodType === "paypal" ? (
                  <div className="space-y-2">
                    <Label htmlFor="paypal-email">PayPal Email</Label>
                    <Input
                      id="paypal-email"
                      type="email"
                      placeholder="your-email@example.com"
                      value={paypalEmail}
                      onChange={(e) => setPaypalEmail(e.target.value)}
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="bank-name">Bank Name</Label>
                      <Input
                        id="bank-name"
                        placeholder="Enter bank name"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="account-number">Account Number</Label>
                      <Input
                        id="account-number"
                        placeholder="Enter account number"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="routing-number">Routing Number</Label>
                      <Input
                        id="routing-number"
                        placeholder="Enter routing number"
                        value={routingNumber}
                        onChange={(e) => setRoutingNumber(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="account-holder">Account Holder Name</Label>
                      <Input
                        id="account-holder"
                        placeholder="Enter account holder name"
                        value={accountHolderName}
                        onChange={(e) => setAccountHolderName(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)} className="hover:cursor-pointer">
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddPaymentMethod} 
                  disabled={isSubmitting}
                  className="bg-warm-coral text-deep-cocoa hover:bg-[#ff8c61] hover:cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Payment Method
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 grid w-full grid-cols-1 md:grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="payment_methods">Payment Methods</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Earnings</p>
                    <h3 className="mt-1 text-2xl font-bold text-deep-cocoa">{formatCurrency(stats.total_earnings)}</h3>
                  </div>
                  <div className="rounded-full bg-green-100 p-3 text-green-600">
                    <DollarSign className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Pending</p>
                    <h3 className="mt-1 text-2xl font-bold text-deep-cocoa">
                      {formatCurrency(stats.pending_earnings)}
                    </h3>
                  </div>
                  <div className="rounded-full bg-yellow-100 p-3 text-yellow-600">
                    <Clock className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Paid</p>
                    <h3 className="mt-1 text-2xl font-bold text-deep-cocoa">{formatCurrency(stats.paid_earnings)}</h3>
                  </div>
                  <div className="rounded-full bg-blue-100 p-3 text-blue-600">
                    <CreditCard className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Sessions</p>
                    <h3 className="mt-1 text-2xl font-bold text-deep-cocoa">{stats.total_sessions}</h3>
                  </div>
                  <div className="rounded-full bg-purple-100 p-3 text-purple-600">
                    <Calendar className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your most recent earnings from teaching sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                          <div>
                            <div className="h-4 w-40 rounded bg-gray-200"></div>
                            <div className="mt-2 h-3 w-24 rounded bg-gray-200"></div>
                          </div>
                        </div>
                        <div className="h-6 w-20 rounded bg-gray-200"></div>
                      </div>
                      <Separator className="my-4" />
                    </div>
                  ))}
                </div>
              ) : earnings.length > 0 ? (
                <div className="space-y-4">
                  {earnings.slice(0, 5).map((earning) => (
                    <div key={earning.id}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff2e7]">
                            <DollarSign className="h-5 w-5 text-warm-coral" />
                          </div>
                          <div>
                            <p className="font-medium text-deep-cocoa">Session with {earning.student_name}</p>
                            <p className="text-sm text-gray-500">{formatDate(earning.date)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={getStatusColor(earning.status)}>
                            {earning.status.charAt(0).toUpperCase() + earning.status.slice(1)}
                          </Badge>
                          <span className="font-medium text-deep-cocoa">{formatCurrency(earning.amount)}</span>
                        </div>
                      </div>
                      <Separator className="my-4" />
                    </div>
                  ))}

                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      className="border-[#ffc6a8] text-deep-cocoa hover:bg-[#fff2e7] hover:cursor-pointer"
                      onClick={() => setActiveTab("transactions")}
                    >
                      View All Transactions
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="rounded-full bg-gray-100 p-3">
                    <DollarSign className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-deep-cocoa">No transactions yet</h3>
                  <p className="text-gray-500">Complete sessions to start earning</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
              <CardDescription>Your payment methods and payout schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="mb-2 text-lg font-medium text-deep-cocoa">Payout Schedule</h3>
                  <p className="text-gray-600">
                    Payments are processed every Monday for all completed sessions from the previous week. Funds
                    typically arrive in your account within 3-5 business days after processing.
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="mb-2 text-lg font-medium text-deep-cocoa">Default Payment Method</h3>

                  {paymentMethods.length > 0 ? (
                    <div className="rounded-lg border border-gray-200 p-4">
                      {paymentMethods.filter(method => method.is_default).map(method => (
                        <div key={method.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {method.type === "paypal" ? (
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="h-5 w-5 text-blue-600"
                                >
                                  <path d="M7 11l5-5 5 5M7 17l5-5 5 5" />
                                </svg>
                              </div>
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                                <Bank className="h-5 w-5 text-green-600" />
                              </div>
                            )}

                            <div>
                              <p className="font-medium text-deep-cocoa">
                                {method.type === "paypal" ? "PayPal" : "Bank Transfer"}
                              </p>
                              <p className="text-sm text-gray-500">
                                {method.type === "paypal"
                                  ? method.details.email
                                  : `${method.details.bank_name} ****${method.details.account_number?.slice(-4)}`}
                              </p>
                            </div>
                          </div>

                          <Badge>Default</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">
                      <CreditCard className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                      <h3 className="text-lg font-medium text-deep-cocoa">No payment method</h3>
                      <p className="mb-4 text-gray-500">Add a payment method to receive your earnings</p>
                      <Button
                        onClick={() => setDialogOpen(true)}
                        className="bg-warm-coral text-deep-cocoa hover:bg-[#ff8c61] hover:cursor-pointer"
                      >
                        Add Payment Method
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <CardTitle>Transactions History</CardTitle>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Select value={timeFilter} onValueChange={setTimeFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select time period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="this_month">This Month</SelectItem>
                      <SelectItem value="last_month">Last Month</SelectItem>
                      <SelectItem value="this_year">This Year</SelectItem>
                      <SelectItem value="all_time">All Time</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    className="border-[#ffc6a8] text-deep-cocoa hover:bg-[#fff2e7] hover:cursor-pointer"
                    onClick={handleDownloadStatement}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                          <div>
                            <div className="h-4 w-40 rounded bg-gray-200"></div>
                            <div className="mt-2 h-3 w-24 rounded bg-gray-200"></div>
                          </div>
                        </div>
                        <div className="h-6 w-20 rounded bg-gray-200"></div>
                      </div>
                      <Separator className="my-4" />
                    </div>
                  ))}
                </div>
              ) : filteredEarnings.length > 0 ? (
                <div className="space-y-4">
                  {filteredEarnings.map((earning) => (
                    <div key={earning.id}>
                      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff2e7]">
                            <DollarSign className="h-5 w-5 text-warm-coral" />
                          </div>
                          <div>
                            <p className="font-medium text-deep-cocoa">Session with {earning.student_name}</p>
                            <p className="text-sm text-gray-500">{formatDate(earning.date)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={getStatusColor(earning.status)}>
                            {earning.status.charAt(0).toUpperCase() + earning.status.slice(1)}
                          </Badge>
                          <span className="font-medium text-deep-cocoa">{formatCurrency(earning.amount)}</span>
                        </div>
                      </div>
                      <Separator className="my-4" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="rounded-full bg-gray-100 p-3">
                    <FileText className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-deep-cocoa">No transactions found</h3>
                  <p className="text-gray-500">
                    {timeFilter === "this_month"
                      ? "You don't have any transactions this month"
                      : timeFilter === "last_month"
                        ? "You don't have any transactions from last month"
                        : "No transactions found for the selected period"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment_methods">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <CardTitle>Payment Methods</CardTitle>

                <Button 
                  onClick={() => setDialogOpen(true)} 
                  className="bg-warm-coral text-deep-cocoa hover:bg-[#ff8c61] hover:cursor-pointer"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Add Payment Method
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {paymentMethods.length > 0 ? (
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="rounded-lg border border-gray-200 p-4">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          {method.type === "paypal" ? (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-5 w-5 text-blue-600"
                              >
                                <path d="M7 11l5-5 5 5M7 17l5-5 5 5" />
                              </svg>
                            </div>
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                              <Bank className="h-5 w-5 text-green-600" />
                            </div>
                          )}

                          <div>
                            <p className="font-medium text-deep-cocoa">
                              {method.type === "paypal" ? "PayPal" : "Bank Transfer"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {method.type === "paypal"
                                ? method.details.email
                                : `${method.details.bank_name} ****${method.details.account_number?.slice(-4)}`}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {method.is_default && <Badge>Default</Badge>}
                          {!method.is_default && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="hover:cursor-pointer"
                              onClick={() => handleSetDefaultPaymentMethod(method.id)}
                            >
                              <CheckCircle className="mr-1 h-4 w-4" />
                              Set as Default
                            </Button>
                          )}
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="hover:cursor-pointer"
                            onClick={() => handleRemovePaymentMethod(method.id)}
                          >
                            <X className="mr-1 h-4 w-4" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="rounded-full bg-gray-100 p-3">
                    <CreditCard className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-deep-cocoa">No payment methods</h3>
                  <p className="mb-4 text-gray-500">Add a payment method to receive your earnings</p>
                  <Button 
                    onClick={() => setDialogOpen(true)} 
                    className="bg-warm-coral text-deep-cocoa hover:bg-[#ff8c61] hover:cursor-pointer"
                  >
                    Add Payment Method
                  </Button>
                </div>
              )}

              <div className="mt-8 rounded-lg bg-blue-50 p-4 text-blue-800">
                <h3 className="mb-2 font-medium">Payment Information</h3>
                <ul className="list-inside list-disc space-y-1 text-sm">
                  <li>Payments are processed every Monday for the previous week</li>
                  <li>Funds typically arrive in your account within 3-5 business days</li>
                  <li>A 5% service fee is deducted from each transaction</li>
                  <li>Minimum payout amount is $20</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
