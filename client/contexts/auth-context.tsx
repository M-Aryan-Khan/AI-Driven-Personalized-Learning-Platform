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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Mock user for development
  const mockUser: User = {
    id: "1",
    email: "student@example.com",
    role: "student",
    is_verified: true,
    first_name: "Student",
    last_name: "User",
    profile_image: "",
    bio: "I'm a student looking to learn new skills",
    time_zone: "America/New_York",
    learning_goals: ["Programming", "Design", "Marketing"],
    preferred_languages: ["English", "Spanish"],
  }

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        // For development, use mock user
        setUser(mockUser)

        // In production, uncomment this to use real API
        // const response = await axios.get("/api/auth/me")
        // setUser(response.data)

        // Store token in localStorage for development
        if (!localStorage.getItem("token")) {
          localStorage.setItem("token", "mock-token-for-development")
        }
      } catch (error) {
        console.error("Auth error:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      // For development, use mock user
      if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_USE_MOCK === "true") {
        setUser(mockUser)
        localStorage.setItem("token", "mock-token-for-development")
        return
      }

      // In production or when using real API
      const response = await axios.post(
        "/api/auth/login",
        {
          username: email,
          password: password,
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      )

      // Store token in localStorage
      if (response.data.access_token) {
        localStorage.setItem("token", response.data.access_token)
      }

      // Fetch user data
      await refreshUser()
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  const signup = async (data: any) => {
    try {
      // For development, use mock user
      if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_USE_MOCK === "true") {
        setUser(mockUser)
        localStorage.setItem("token", "mock-token-for-development")
        return
      }

      // In production, use real API
      const response = await axios.post("/api/auth/register/" + data.role, data)

      // Don't return anything to match the Promise<void> type
    } catch (error) {
      console.error("Signup error:", error)
      throw error
    }
  }

  const logout = async () => {
    try {
      // For development
      setUser(null)
      localStorage.removeItem("token")

      // In production, uncomment this to use real API
      // await axios.post("/api/auth/logout")

      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const refreshUser = async () => {
    setLoading(true)
    try {
      // For development, use mock user
      if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_USE_MOCK === "true") {
        setUser(mockUser)
        setLoading(false)
        return
      }

      // In production or when using real API
      const response = await axios.get("/api/auth/me", {
        withCredentials: true, // Important to send cookies
      })

      if (response.data) {
        setUser(response.data)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error("Error refreshing user:", error)
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
