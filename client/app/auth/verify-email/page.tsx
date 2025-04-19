"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, CheckCircle, RefreshCw } from 'lucide-react'
import { toast } from "@/hooks/use-toast"
import AuthHeader from "@/components/auth-header"
import api from "@/lib/axios"

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email")

  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState("")
  const [isResending, setIsResending] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Redirect if no email is provided
    if (!email) {
      router.push("/auth/login")
      return
    }

    // Focus first input on load
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }

    // Set up cooldown timer if active
    if (cooldown > 0) {
      const timer = setTimeout(() => {
        setCooldown((prev) => prev - 1)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [email, router, cooldown])

  const handleInputChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d+$/.test(value)) return

    // Update the code array
    const newCode = [...verificationCode]
    newCode[index] = value
    setVerificationCode(newCode)

    // Clear error when user types
    if (error) setError("")

    // Auto-focus next input if value is entered
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace to go to previous input
    if (e.key === "Backspace" && !verificationCode[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus()
    }

    // Handle arrow keys
    if (e.key === "ArrowLeft" && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus()
    }
    if (e.key === "ArrowRight" && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").trim()

    // Check if pasted content is a 6-digit number
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("")
      setVerificationCode(digits)

      // Focus last input after paste
      if (inputRefs.current[5]) {
        inputRefs.current[5].focus()
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setError("Email is required")
      return
    }

    const code = verificationCode.join("")
    if (code.length !== 6) {
      setError("Please enter all 6 digits of the verification code")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await api.post("/api/auth/verify-email", {
        email,
        verification_code: code,
      });

      // Show success state
      setIsVerified(true)

      toast({
        title: "Email verified!",
        description: "Your account has been successfully verified.",
      })

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push(`/auth/login?verified=true&email=${encodeURIComponent(email)}`)
      }, 2000)
    } catch (error: any) {
      console.error("Verification error:", error)
      
      // Extract error message from axios error response
      const errorMessage = error.response?.data?.detail || 
                          error.message || 
                          "Verification failed. Please check your code and try again.";
      
      setError(errorMessage)

      toast({
        variant: "destructive",
        title: "Verification failed",
        description: errorMessage,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendCode = async () => {
    if (cooldown > 0 || !email) return

    setIsResending(true)

    try {
      const response = await api.post("/api/auth/resend-verification", { email });

      toast({
        title: "Verification code sent!",
        description: "Please check your email for the new verification code.",
      })

      // Reset verification code inputs
      setVerificationCode(["", "", "", "", "", ""])
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus()
      }

      // Set cooldown to 60 seconds
      setCooldown(60)
    } catch (error: any) {
      console.error("Resend error:", error)
      
      const errorMessage = error.response?.data?.detail || 
                          error.message || 
                          "Failed to resend verification code";

      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      })
    } finally {
      setIsResending(false)
    }
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
          {isVerified ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>

              <h1 className="text-2xl font-bold text-deep-cocoa">Email Verified!</h1>

              <p className="text-rose-dust">
                Your email has been successfully verified. You will be redirected to the login page.
              </p>
            </div>
          ) : (
            <>
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-deep-cocoa">Verify your email</h1>

                <p className="text-rose-dust">
                  Enter the 6-digit verification code sent to{" "}
                  <span className="font-medium text-deep-cocoa">{email}</span>
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                <div className="flex justify-center gap-2">
                  {verificationCode.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      className="w-12 h-14 text-center text-xl font-bold border border-rose-dust/30 rounded-md focus:border-warm-coral focus:ring-1 focus:ring-warm-coral outline-none"
                    />
                  ))}
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-warm-coral hover:bg-[#ff8c61] text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2"
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 10px 25px -5px rgba(255, 132, 116, 0.4)",
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      Verify Email
                      <ArrowRight size={18} />
                    </>
                  )}
                </motion.button>

                <div className="text-center">
                  <p className="text-sm text-rose-dust mb-2">Didn't receive the code?</p>
                  <button
                    type="button"
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
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
