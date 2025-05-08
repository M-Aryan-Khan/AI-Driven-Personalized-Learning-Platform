import axios from "axios"

// Get the API URL from environment variable or use default
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem("token")

    // If token exists, add to headers
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add a response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle timeout errors specifically
    if (error.code === "ECONNABORTED" && error.message.includes("timeout")) {
      console.error("Request timed out. Please try again later.")
    }

    return Promise.reject(error)
  },
)

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error("Axios error:", error)

    // Handle token expiration
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      // Optionally redirect to login
    }

    return Promise.reject(error)
  },
)

export default api
