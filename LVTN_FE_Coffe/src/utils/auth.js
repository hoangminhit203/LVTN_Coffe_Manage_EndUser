// Utility functions for authentication and token management
import { jwtDecode } from "jwt-decode"

/**
 * Decode JWT token to get payload
 * @param {string} token - JWT token
 * @returns {object|null} - Decoded payload or null if invalid
 */
export const decodeToken = (token) => {
  if (!token) return null

  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null

    const payload = parts[1]
    const decoded = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    )
    return decoded
  } catch (error) {
    console.error("Error decoding token:", error)
    return null
  }
}

/**
 * Get user ID from token stored in localStorage
 * @returns {string|null} - User ID or null if not found
 */
export const getUserIdFromToken = () => {
  const token = localStorage.getItem("token")
  if (!token) return null

  const decoded = decodeToken(token)
  if (!decoded) return null

  // Try common JWT claim names for user ID
  return decoded.userId || decoded.sub || decoded.id || decoded.user_id || null
}

/**
 * Get user information from token
 * @returns {object|null} - User info or null if not found
 */
export const getUserFromToken = () => {
  const token = localStorage.getItem("token")
  if (!token) return null

  const decoded = decodeToken(token)
  return decoded
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem("token")
  if (!token) return false

  const decoded = decodeToken(token)
  if (!decoded) return false

  // Check if token is expired (if exp claim exists)
  if (decoded.exp) {
    const currentTime = Math.floor(Date.now() / 1000)
    if (decoded.exp < currentTime) {
      // Token expired, remove it
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      return false
    }
  }

  return true
}

/**
 * Get token from localStorage
 * @returns {string|null}
 */
export const getToken = () => {
  return localStorage.getItem("token")
}

/**
 * Save token to localStorage
 * @param {string} token - JWT token
 */
export const saveToken = (token) => {
  if (token) {
    localStorage.setItem("token", token)
  }
}

/**
 * Remove token and user data from localStorage
 */
export const logout = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("user")
  localStorage.removeItem("accessToken")
}

/**
 * Get user role from token
 * @param {string} token - JWT token (optional, will use stored token if not provided)
 * @returns {string|null} - User role or null if not found
 */
export const getUserRole = (token = null) => {
  const accessToken =
    token ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken")
  if (!accessToken) return null

  try {
    const decodedToken = jwtDecode(accessToken)

    // Try different possible role claim names
    const userRole =
      decodedToken[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      ] ||
      decodedToken.role ||
      decodedToken.Role ||
      null

    return userRole
  } catch (error) {
    console.error("Error decoding token for role:", error)
    return null
  }
}

/**
 * Check if user has admin role
 * @returns {boolean}
 */
export const isAdmin = () => {
  const role = getUserRole()
  return role === "Admin" || role === "admin" || role === "ADMIN"
}
