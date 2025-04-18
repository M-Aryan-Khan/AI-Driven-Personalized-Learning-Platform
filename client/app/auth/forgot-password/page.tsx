"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowRight, CheckCircle } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import AuthHeader from "@/components/auth-header"
import { toast } from "@/hooks/use-toast"
import api from "@/lib/axios"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)

    // Clear error when user starts typing
    if (errors.email) {
      setErrors({
        ...errors,
        email: "",
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Email validation
    if (!email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      setIsSubmitting(true)

      try {
        const response = await api.post("/api/auth/forgot-password", { email });

        setIsSubmitted(true)
        
        toast({
          title: "Reset code sent!",
          description: "Please check your email for the password reset code.",
        })
        
        // Redirect to reset password page after a short delay
        setTimeout(() => {
          router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
        }, 2000);
      } catch (error: any) {
        console.error("Forgot password error:", error)
        
        // Even if there's an error, we don't want to reveal if the email exists or not
        // So we still show success message for security reasons
        setIsSubmitted(true)
        
        toast({
          title: "Reset code sent!",
          description: "If your email is registered, you will receive a password reset code.",
        })
        
        // Redirect to reset password page after a short delay
        setTimeout(() => {
          router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
        }, 2000);
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-vanilla-cream flex flex-col">
      <AuthHeader />

      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          className="w-full max-w-md space-y-6 bg-white p-6 md:p-8 rounded-xl shadow-sm border border-rose-dust/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {!isSubmitted ? (
            <>
              <div className="text-center space-y-2">
                <h1 className="text-2xl md:text-3xl font-bold text-deep-cocoa">Forgot your password?</h1>
                <p className="text-rose-dust">
                  Enter your email address and we'll send you a code to reset your password
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={handleChange}
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-warm-coral hover:bg-[#ff8c61] text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      Send Reset Code
                      <ArrowRight size={18} />
                    </>
                  )}
                </motion.button>

                {errors.form && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {errors.form}
                  </div>
                )}
              </form>

              <div className="text-center text-sm text-rose-dust">
                Remember your password?{" "}
                <Link href="/auth/login" className="text-warm-coral hover:underline font-semibold">
                  Back to login
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="text-green-600" size={32} />
              </div>

              <h2 className="text-xl font-bold text-deep-cocoa">Check your email</h2>

              <p className="text-rose-dust">
                We've sent a password reset code to <span className="font-semibold text-deep-cocoa">{email}</span>
              </p>

              <p className="text-sm text-rose-dust">If you don't see it, please check your spam folder</p>

              <div className="pt-4">
                <Link href={`/auth/reset-password?email=${encodeURIComponent(email)}`} className="text-warm-coral hover:underline font-semibold">
                  Enter reset code
                </Link>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
