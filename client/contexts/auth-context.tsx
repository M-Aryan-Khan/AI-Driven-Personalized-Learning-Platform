"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"

// Update the User type to include profile_image
type User = {
  id: string
  email: string
  role: "student" | "expert"
  is_verified: boolean
  first_name?: string
  last_name?: string
  profile_image?: string
  bio?: string
  time_zone?: string
  learning_goals?: string[]
  preferred_languages?: string[]
}

type AuthContextType = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (data: any) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  updateUser: (data: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Get the API URL from environment variable or use default
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token")

        if (!token) {
          setUser(null)
          setLoading(false)
          return
        }

        // Fetch user data from backend using the full URL
        const response = await axios.get(`${API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.data) {
          setUser(response.data)
        } else {
          // Clear invalid token
          localStorage.removeItem("token")
          setUser(null)
        }
      } catch (error) {
        console.error("Auth error:", error)
        // Clear invalid token
        localStorage.removeItem("token")
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      console.log("Attempting login with email:", email)

      // Create URLSearchParams for x-www-form-urlencoded format
      const params = new URLSearchParams()
      params.append("username", email)
      params.append("password", password)

      console.log("Sending login request to:", `${API_URL}/api/auth/login`)

      // Use the full URL to the backend API
      const response = await axios.post(`${API_URL}/api/auth/login`, params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })

      console.log("Login response:", response.data)

      // Store token in localStorage
      if (response.data.access_token) {
        localStorage.setItem("token", response.data.access_token)

        // Fetch user data
        await refreshUser()

        // Redirect based on role and verification status
        if (user?.role === "student") {
          if (!user.is_verified) {
            router.push("/auth/verification-pending")
          } else {
            router.push("/dashboard/student")
          }
        } else if (user?.role === "expert") {
          if (!user.is_verified) {
            router.push("/auth/verification-pending")
          } else {
            router.push("/dashboard/expert")
          }
        }
      } else {
        throw new Error("No access token received")
      }
    } catch (error: any) {
      console.error("Login error:", error)
      console.error("Error response:", error.response?.data)
      throw error
    }
  }

  const signup = async (data: any) => {
    try {
      // Use the full URL to the backend API
      await axios.post(`${API_URL}/api/auth/register/${data.role}`, data)
      // Don't automatically log in after signup - require email verification
    } catch (error) {
      console.error("Signup error:", error)
      throw error
    }
  }

  const logout = async () => {
    try {
      const token = localStorage.getItem("token")

      if (token) {
        // Call logout endpoint with full URL
        await axios.post(
          `${API_URL}/api/auth/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
      }

      // Clear local storage and state regardless of API response
      localStorage.removeItem("token")
      setUser(null)
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
      // Still clear token and user state even if API call fails
      localStorage.removeItem("token")
      setUser(null)
      router.push("/")
    }
  }

  const refreshUser = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")

      if (!token) {
        setUser(null)
        setLoading(false)
        return
      }

      // Use the full URL to the backend API
      const response = await axios.get(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data) {
        setUser(response.data)
      } else {
        localStorage.removeItem("token")
        setUser(null)
      }
    } catch (error) {
      console.error("Error refreshing user:", error)
      localStorage.removeItem("token")
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const updateUser = (data: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : null))
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
