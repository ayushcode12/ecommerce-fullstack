import axios from "axios"

const BASE_URL = "http://localhost:8080"

const api = axios.create({
  baseURL: BASE_URL
})

const authApi = axios.create({
  baseURL: BASE_URL
})

const isAuthEndpoint = (url = "") =>
  url.includes("/auth/login") ||
  url.includes("/auth/register") ||
  url.includes("/auth/refresh") ||
  url.includes("/auth/forgot-password") ||
  url.includes("/auth/reset-password")

const clearSessionAndRedirect = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("refreshToken")
  localStorage.removeItem("role")
  window.dispatchEvent(new Event("auth-changed"))

  if (window.location.pathname !== "/login") {
    window.location.href = "/login"
  }
}

const isTokenExpired = (token, bufferMs = 5000) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    if (!payload?.exp) return false
    return payload.exp * 1000 <= Date.now() + bufferMs
  } catch {
    return true
  }
}

let refreshPromise = null

const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken")
  if (!refreshToken) {
    throw new Error("No refresh token available")
  }

  const response = await authApi.post("/auth/refresh", { refreshToken })
  const nextToken = response.data?.token
  const nextRefreshToken = response.data?.refreshToken
  const nextRole = response.data?.role

  if (!nextToken || !nextRefreshToken) {
    throw new Error("Invalid refresh response")
  }

  localStorage.setItem("token", nextToken)
  localStorage.setItem("refreshToken", nextRefreshToken)
  if (nextRole) {
    localStorage.setItem("role", nextRole)
  }
  window.dispatchEvent(new Event("auth-changed"))

  return nextToken
}

const getValidAccessToken = async () => {
  const token = localStorage.getItem("token")

  if (token && !isTokenExpired(token)) {
    return token
  }

  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null
    })
  }

  return refreshPromise
}

api.interceptors.request.use(
  async (config) => {
    if (isAuthEndpoint(config.url)) {
      return config
    }

    const hasSessionToken =
      localStorage.getItem("token") || localStorage.getItem("refreshToken")

    if (!hasSessionToken) {
      return config
    }

    try {
      const validAccessToken = await getValidAccessToken()
      config.headers.Authorization = `Bearer ${validAccessToken}`
      return config
    } catch (error) {
      clearSessionAndRedirect()
      return Promise.reject(error)
    }
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status
    const originalRequest = error.config || {}
    const requestUrl = originalRequest.url || ""

    if (status === 401 && !isAuthEndpoint(requestUrl) && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const validAccessToken = await getValidAccessToken()
        originalRequest.headers = originalRequest.headers || {}
        originalRequest.headers.Authorization = `Bearer ${validAccessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        clearSessionAndRedirect()
        return Promise.reject(refreshError)
      }
    }

    if (status === 401 && !isAuthEndpoint(requestUrl)) {
      clearSessionAndRedirect()
    }

    return Promise.reject(error)
  }
)

export default api
