"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { LogIn } from "lucide-react"
import { motion } from "framer-motion"

type AuthNavButtonProps = {
  className?: string
}

export default function AuthNavButton({ className = "" }: AuthNavButtonProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <motion.button
        disabled
        className={`border-2 border-[#ffc6a8] bg-[#fff2e7] font-semibold transition-all ease-in-out duration-200 text-deep-cocoa px-4 rounded-lg py-2 text-md items-center gap-2 opacity-70 ${className}`}
      >
        <div className="w-4 h-4 border-2 border-deep-cocoa border-t-transparent rounded-full animate-spin mx-auto"></div>
      </motion.button>
    )
  }

  if (user) {
    const dashboardLink = user.role === "student" ? "/dashboard/student" : "/dashboard/expert"

    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={className}
      >
        <Link href={dashboardLink}>
          <button className="hover:cursor-pointer bg-[#ffc6a8] hover:bg-[#ffb289] font-semibold transition-all ease-in-out duration-200 text-deep-cocoa px-4 rounded-lg py-3 text-md">
            Go to Dashboard
          </button>
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={className}
    >
      <Link href="/auth/login">
        <button className="hover:cursor-pointer border-2 border-[#ffc6a8] hover:bg-[#fff2e7] font-semibold transition-all ease-in-out duration-200 text-deep-cocoa px-4 rounded-lg py-2 text-md flex items-center gap-2">
          <LogIn size={18} />
          Log In
        </button>
      </Link>
    </motion.div>
  )
}
