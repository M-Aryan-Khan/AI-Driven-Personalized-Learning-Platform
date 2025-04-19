// API utility functions for making requests to the backend

// API URL from environment variable or default
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// Helper function to get the auth token from localStorage
const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token")
  }
  return null
}

// Generic fetch function with authentication
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getToken()

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
    credentials: "include", // Important for cookies
  })

  // Handle 401 Unauthorized - token expired or invalid
  if (response.status === 401) {
    // Try to refresh the token
    try {
      const refreshResponse = await fetch(`${API_URL}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
      })

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json()

        // Update token in localStorage
        localStorage.setItem("access_token", refreshData.access_token)

        // Retry the original request with the new token
        const retryHeaders = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${refreshData.access_token}`,
          ...options.headers,
        }

        return fetch(`${API_URL}${url}`, {
          ...options,
          headers: retryHeaders,
          credentials: "include",
        })
      } else {
        // If refresh fails, clear auth and redirect to login
        localStorage.removeItem("access_token")
        localStorage.removeItem("token_type")
        localStorage.removeItem("user")
      }
    } catch (error) {
      console.error("Token refresh failed:", error)
      // Clear auth and redirect to login on refresh failure
      localStorage.removeItem("access_token")
      localStorage.removeItem("token_type")
      localStorage.removeItem("user")
    }
  }

  // If not 401 or refresh fails, just return the response
  return response
}
