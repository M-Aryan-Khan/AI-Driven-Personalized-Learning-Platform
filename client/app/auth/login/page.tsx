"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Facebook, Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import AuthHeader from "@/components/auth-header"
import { toast } from "@/hooks/use-toast"
import api from "@/lib/axios"
import image1 from "@/app/assets/mockImages/image1.png"
import image2 from "@/app/assets/mockImages/image2.png"
import image3 from "@/app/assets/mockImages/image3.png"
import image4 from "@/app/assets/mockImages/image4.png"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirectTo") || "/"
  const role = searchParams.get("role") || "student"
  const verified = searchParams.get("verified") === "true"
  const reset = searchParams.get("reset") === "success"
  const email = searchParams.get("email") || ""

  const [formData, setFormData] = useState({
    email: email,
    password: "",
    rememberMe: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    // Show toast if user just verified their email
    // if (verified) {
    //   toast({
    //     title: "Email verified!",
    //     description: "Your account has been successfully verified. You can now log in.",
    //   })
    // }

    // Show toast if user just reset their password
    if (reset) {
      toast({
        title: "Password reset successful!",
        description: "Your password has been reset. You can now log in with your new password.",
      })
    }
  }, [verified, reset])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      setIsSubmitting(true)

      try {
        const response = await api.post(
          "/api/auth/login",
          new URLSearchParams({
            username: formData.email,
            password: formData.password,
          }),
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          },
        )

        const data = response.data

        // Check if user is verified
        if (!data.is_verified) {
          // Redirect to verification pending page
          router.push(`/auth/verification-pending?email=${encodeURIComponent(formData.email)}`)
          return
        }

        toast({
          title: "Login successful!",
          description: "Welcome back to Synapse.",
        })

        // Redirect to dashboard based on role
        router.push(data.role === "expert" ? "/teach/dashboard" : "/student/dashboard")
      } catch (error: any) {
        console.error("Login error:", error)

        // Handle specific error cases
        if (error.response?.status === 404) {
          setErrors({
            form: "User not found. Please check your email or sign up.",
          })
        } else if (error.response?.status === 401) {
          setErrors({
            form: "Invalid email or password. Please try again.",
          })
        } else {
          setErrors({
            form: "Login failed. Please try again.",
          })
        }

        toast({
          variant: "destructive",
          title: "Login failed",
          description: "Please check your credentials and try again.",
        })
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleSocialLogin = async (provider: string) => {
    setIsSubmitting(true)

    try {
      // Social login API call would go here
      /*
      const response = await axios.get(`/api/auth/${provider}`, {
        params: { redirectTo }
      })
      
      // Handle redirect to OAuth provider
      window.location.href = response.data.authUrl
      */

      // Simulate API call for now
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Social login",
        description: `${provider} login will be available soon.`,
      })
    } catch (error) {
      console.error(`${provider} login error:`, error)
      setErrors({
        form: `An error occurred during ${provider} login. Please try again.`,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-vanilla-cream flex flex-col">
      <AuthHeader />

      <div className="flex-1 flex flex-col md:flex-row ">
        {/* Left column - Form */}
        <div className="w-full md:w-1/2 p-4 md:p-7 lg:px-12 flex items-center justify-end ">
          <motion.div
            className="w-full max-w-md space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold text-deep-cocoa">Welcome back to Synapse</h1>
              <p className="text-rose-dust">Log in to continue your learning journey</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/auth/forgot-password" className="text-warm-coral hover:underline text-xs">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-rose-dust hover:text-deep-cocoa"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) => setFormData({ ...formData, rememberMe: checked as boolean })}
                />
                <Label htmlFor="rememberMe" className="text-sm font-normal">
                  Remember me for 30 days
                </Label>
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-warm-coral hover:bg-[#ff8c61] text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 cursor-pointer"
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
                    Log In
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

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-rose-dust/20"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-vanilla-cream px-2 text-rose-dust">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <motion.button
                type="button"
                onClick={() => handleSocialLogin("google")}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-deep-cocoa font-semibold py-3 px-4 rounded-lg border border-rose-dust/20"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </motion.button>

              <motion.button
                type="button"
                onClick={() => handleSocialLogin("facebook")}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 bg-[#1877F2] hover:bg-[#166FE5] text-white font-semibold py-3 px-4 rounded-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Facebook size={20} />
                Continue with Facebook
              </motion.button>

              <motion.button
                type="button"
                onClick={() => handleSocialLogin("apple")}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 bg-black hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="white">
                  <path d="M17.05 20.28c-.98.95-2.05.86-3.08.38-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.38C2.79 15.2 3.51 7.7 8.87 7.45c1.33.03 2.23.6 3.05.58.92-.03 1.75-.6 3.02-.64 1.93-.08 3.37.87 4.35 2.24-3.84 2.15-3.22 7.34.76 8.65ZM12.03 7.4C11.75 5.05 13.6 3.1 15.9 3c.38 2.55-2.25 4.46-3.87 4.4Z" />
                </svg>
                Continue with Apple
              </motion.button>
            </div>

            <div className="text-center text-sm text-rose-dust">
              Don't have an account yet?{" "}
              <Link
                href={role === "teach" ? "/auth/signup/teach" : "/auth/signup/student"}
                className="text-warm-coral hover:underline font-semibold"
              >
                Sign up
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Right column - Image */}
        <div className="hidden md:block md:w-1/2 bg-soft-peach/30">
          <div className="h-full w-full relative">
            <div className="absolute inset-0 bg-gradient-to-r from-soft-peach/80 to-transparent flex items-center">
              <div className="max-w-md p-8 lg:p-12">
                <h2 className="text-3xl font-bold text-deep-cocoa mb-4">Learn from the best tech experts worldwide</h2>
                <p className="text-deep-cocoa mb-6">
                  Synapse connects you with expert mentors who can help you master any tech skill through personalized
                  1-on-1 lessons.
                </p>
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex -space-x-4">
                    {[image1.src, image2.src, image3.src, image4.src].map((i) => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
                        <Image
                          src={`${i}`}
                          alt={`User ${i}`}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="text-deep-cocoa">
                    <p className="font-semibold">Join 10,000+ learners</p>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="#FF9A76"
                          className="w-4 h-4"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ))}
                      <span className="ml-1 text-sm">4.9/5</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-rose-dust/10">
                  <p className="text-deep-cocoa italic text-sm">
                    "The personalized learning experience on Synapse has been incredible. My mentor understood exactly
                    what I needed and helped me land my dream job in tech."
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <Image
                        src={image2.src || "/placeholder.svg"}
                        alt="Testimonial"
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-deep-cocoa text-sm">Sarah Johnson</p>
                      <p className="text-rose-dust text-xs">Software Engineer</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
