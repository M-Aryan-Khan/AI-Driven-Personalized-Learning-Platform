"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Copy, Mail, Share2 } from "lucide-react"
import { motion } from "framer-motion"

export default function ReferFriendPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  // Generate a mock referral code
  const referralCode = `SYNAPSE-${user?.first_name?.substring(0, 3).toUpperCase() || "REF"}-${Math.floor(
    Math.random() * 10000,
  )
    .toString()
    .padStart(4, "0")}`
  const referralLink = `https://synapse.com/refer?code=${referralCode}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink)
    toast({
      title: "Success",
      description: "Referral link copied to clipboard",
    })
  }

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      setEmail("")
      toast({
        title: "Success",
        description: "Invitation sent successfully",
      })
    }, 1000)
  }

  const handleShareLink = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "Join Synapse",
          text: `Join Synapse with my referral link and get started with expert-led IT learning!`,
          url: referralLink,
        })
        .catch((error) => console.log("Error sharing", error))
    } else {
      handleCopyLink()
    }
  }

  return (
    <div className="container mx-auto max-w-4xl">
      <h1 className="mb-6 text-3xl font-bold text-deep-cocoa">Refer a friend</h1>

      <div className="mb-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 text-xl font-bold text-deep-cocoa">Share your referral link</h2>
            <p className="mb-6 text-gray-600">
              Share this link with your friends and both of you will receive 1 free lesson when they sign up.
            </p>

            <div className="mb-6">
              <Label htmlFor="referral-link" className="mb-2 block">
                Your referral link
              </Label>
              <div className="flex">
                <Input id="referral-link" value={referralLink} readOnly className="rounded-r-none" />
                <Button
                  onClick={handleCopyLink}
                  className="rounded-l-none bg-[#ffc6a8] text-deep-cocoa hover:bg-[#ffb289]"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mb-6">
              <Label htmlFor="referral-code" className="mb-2 block">
                Your referral code
              </Label>
              <div className="flex">
                <Input id="referral-code" value={referralCode} readOnly className="rounded-r-none" />
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(referralCode)
                    toast({
                      title: "Success",
                      description: "Referral code copied to clipboard",
                    })
                  }}
                  className="rounded-l-none bg-[#ffc6a8] text-deep-cocoa hover:bg-[#ffb289]"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button className="w-full bg-[#ffc6a8] text-deep-cocoa hover:bg-[#ffb289]" onClick={handleShareLink}>
                <Share2 className="mr-2 h-4 w-4" />
                Share link
              </Button>
            </motion.div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 text-xl font-bold text-deep-cocoa">Invite via email</h2>
            <p className="mb-6 text-gray-600">Send an invitation email to your friends directly.</p>

            <form onSubmit={handleSendEmail}>
              <div className="mb-6">
                <Label htmlFor="friend-email" className="mb-2 block">
                  Friend&apos;s email
                </Label>
                <Input
                  id="friend-email"
                  type="email"
                  placeholder="friend@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  className="w-full bg-[#ffc6a8] text-deep-cocoa hover:bg-[#ffb289]"
                  disabled={loading}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  {loading ? "Sending..." : "Send invitation"}
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <h2 className="mb-4 text-xl font-bold text-deep-cocoa">How it works</h2>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#fff2e7] text-xl font-bold text-deep-cocoa">
                1
              </div>
              <h3 className="mb-2 font-semibold text-deep-cocoa">Share your link</h3>
              <p className="text-sm text-gray-600">
                Share your unique referral link with friends who might be interested in learning.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#fff2e7] text-xl font-bold text-deep-cocoa">
                2
              </div>
              <h3 className="mb-2 font-semibold text-deep-cocoa">Friend signs up</h3>
              <p className="text-sm text-gray-600">Your friend creates an account using your referral link or code.</p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#fff2e7] text-xl font-bold text-deep-cocoa">
                3
              </div>
              <h3 className="mb-2 font-semibold text-deep-cocoa">Both get rewarded</h3>
              <p className="text-sm text-gray-600">
                You both receive 1 free lesson once they complete their first paid lesson.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
