"use client"

import { useAuth } from "@/contexts/auth-context"
import { LogIn } from 'lucide-react'
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

type AuthNavButtonProps = {
  className?: string
}

export default function AuthNavButton({ className = "" }: AuthNavButtonProps) {
  const { user, loading, logout } = useAuth()
  const router = useRouter()

  const handleLogin = () => {
    router.push("/auth/login")
  }

  const handleDashboard = () => {
    if (user?.role === "student") {
      router.push("/dashboard/student")
    } else if (user?.role === "expert") {
      router.push("/dashboard/expert")
    }
  }

  if (loading) {
    return (
      <motion.button
        className={`border-2 border-[#ffc6a8] bg-[#fff2e7] font-semibold transition-all ease-in-out duration-200 text-deep-cocoa px-4 rounded-lg py-2 text-md items-center gap-2 opacity-70 ${className}`}
      >
        <div className="w-4 h-4 border-2 border-deep-cocoa border-t-transparent rounded-full animate-spin mx-auto"></div>
      </motion.button>
    )
  }

  if (user) {
    return (
      <motion.button
        className={`bg-[#ffc6a8] hover:bg-[#ffb289] font-semibold transition-all ease-in-out duration-200 hover:cursor-pointer text-deep-cocoa px-4 rounded-lg py-2 text-md items-center gap-2 ${className}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleDashboard}
      >
        Go to Dashboard
      </motion.button>
    )
  }

  return (
    <motion.button
      className={`border-2 border-[#ffc6a8] hover:bg-[#fff2e7] font-semibold transition-all ease-in-out duration-200 hover:cursor-pointer text-deep-cocoa px-4 rounded-lg py-2 text-md items-center gap-2 ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleLogin}
    >
      <div className="flex items-center gap-2">
        <LogIn size={18} />
        Log In
      </div>
    </motion.button>
  )
}
