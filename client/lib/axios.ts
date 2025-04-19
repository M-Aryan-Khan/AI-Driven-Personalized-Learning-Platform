import axios from "axios"

// Create an Axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for cookies
})

// Add a request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    // You can add auth token here if needed
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
    // Handle specific error cases
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Response error:", error.response.status, error.response.data)

      // Extract more detailed error message if available
      if (error.response.data && error.response.data.detail) {
        error.message = error.response.data.detail
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("Request error:", error.request)
      error.message = "No response received from server. Please check your connection."
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error:", error.message)
    }
    return Promise.reject(error)
  },
)

export default api
