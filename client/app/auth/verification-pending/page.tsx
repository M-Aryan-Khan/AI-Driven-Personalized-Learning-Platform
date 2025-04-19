"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Mail, RefreshCw } from 'lucide-react'
import { toast } from "@/hooks/use-toast"
import AuthHeader from "@/components/auth-header"
import api from "@/lib/axios"

export default function VerificationPendingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email")

  const [isResending, setIsResending] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    // Redirect if no email is provided
    if (!email) {
      router.push("/auth/login")
    }

    // Set up cooldown timer if active
    if (cooldown > 0) {
      const timer = setTimeout(() => {
        setCooldown((prev) => prev - 1)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [email, router, cooldown])

  const handleResendCode = async () => {
    if (cooldown > 0 || !email) return

    setIsResending(true)

    try {
      const response = await api.post("/api/auth/resend-verification", { email });

      toast({
        title: "Verification code sent!",
        description: "Please check your email for the new verification code.",
      })

      // Set cooldown to 60 seconds
      setCooldown(60)
    } catch (error) {
      console.error("Resend error:", error)

      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to resend verification code",
      })
    } finally {
      setIsResending(false)
    }
  }

  const handleVerifyNow = () => {
    if (!email) return
    router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`)
  }

  return (
    <div className="min-h-screen bg-vanilla-cream flex flex-col">
      <AuthHeader />

      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-rose-dust/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-warm-coral/10 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-warm-coral" />
            </div>

            <h1 className="text-2xl font-bold text-deep-cocoa">Check your email</h1>

            <p className="text-rose-dust">
              We've sent a verification code to <span className="font-medium text-deep-cocoa">{email}</span>. Please
              check your inbox and enter the code to verify your account.
            </p>

            <div className="pt-4 space-y-4">
              <motion.button
                onClick={handleVerifyNow}
                className="w-full bg-warm-coral hover:bg-[#ff8c61] text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2"
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 10px 25px -5px rgba(255, 132, 116, 0.4)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                Enter Verification Code
                <ArrowRight size={18} />
              </motion.button>

              <div className="text-center">
                <p className="text-sm text-rose-dust mb-2">Didn't receive the code?</p>
                <button
                  onClick={handleResendCode}
                  disabled={isResending || cooldown > 0}
                  className="text-warm-coral hover:underline inline-flex items-center gap-1 disabled:opacity-50 disabled:hover:no-underline"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      Sending...
                    </>
                  ) : cooldown > 0 ? (
                    `Resend code (${cooldown}s)`
                  ) : (
                    <>
                      <RefreshCw className="h-3 w-3" />
                      Resend verification code
                    </>
                  )}
                </button>
              </div>

              <div className="text-center text-sm text-rose-dust">
                <Link href="/auth/login" className="text-warm-coral hover:underline">
                  Back to login
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
