import axios from "axios"

// Create a custom axios instance
const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for cookies/auth
})

// Add a request interceptor to include auth token
instance.interceptors.request.use(
  (config) => {
    // You can add logic here to get token from localStorage or cookies if needed
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add a response interceptor to handle errors
instance.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Redirect to login or refresh token
      console.log("Unauthorized, redirecting to login")
      // You can add redirect logic here
    }

    // Log the error but don't show it to the user
    console.error("API Error:", error.message)

    // Return a rejected promise but don't show error messages in the UI
    return Promise.reject(error)
  },
)

export default instance
