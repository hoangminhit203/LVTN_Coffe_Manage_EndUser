const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://localhost:44384/api"

const getGuestKey = () => {
  let key = localStorage.getItem("guestKey")
  if (!key) {
    key = "g-" + Math.random().toString(36).substring(2, 15)
    localStorage.setItem("guestKey", key)
  }
  return key
}

const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`

  const defaultHeaders = { "Content-Type": "application/json" }

  // 1. Kiểm tra Token (Hội viên)
  const token = localStorage.getItem("token")
  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`
  }

  // 2. Luôn gửi Guest Key nếu có (để backend tracking)
  const guestKey = localStorage.getItem("guestKey")
  if (guestKey) {
    defaultHeaders["X-Guest-Key"] = guestKey
  }

  const config = {
    ...options,
    credentials: "include", // Cho phép gửi cookies/credentials
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  }

  const response = await fetch(url, config)
  const contentType = response.headers.get("content-type") || ""

  // Parse response dựa trên content-type
  let data
  if (contentType.includes("application/json")) {
    data = await response.json()
  } else {
    data = await response.text()
  }

  if (!response.ok) {
    // Xử lý error message từ backend (hỗ trợ cả JSON và plain text)
    let message = `HTTP error ${response.status}`

    if (typeof data === "string" && data.trim()) {
      // Backend trả về plain text error message
      message = data.trim()
    } else if (data && data.message) {
      // Backend trả về JSON với field message
      message = data.message
    } else if (data && typeof data === "object") {
      // Backend trả về object, cố gắng stringify
      message = JSON.stringify(data)
    }

    throw new Error(message)
  }

  return data
}

const api = {
  get: (endpoint) => apiRequest(endpoint, { method: "GET" }),
  post: (endpoint, body) =>
    apiRequest(endpoint, { method: "POST", body: JSON.stringify(body) }),
  put: (endpoint, body) =>
    apiRequest(endpoint, { method: "PUT", body: JSON.stringify(body) }),
  patch: (endpoint, body) =>
    apiRequest(endpoint, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (endpoint) => apiRequest(endpoint, { method: "DELETE" }),
}

export const productApi = {
  getAll: () => api.get("/Product"),
  getById: (id) => api.get(`/Product/${id}`),
  getByCategory: (categoryId) => api.get(`/Product/by-category/${categoryId}`),
}
export const wishlistApi = {
  add: (productId) => {
    return api.post("/Wishlist", { productId: Number(productId) })
  },

  getAll: () => api.get("/Wishlist"),
  remove: (id) => api.delete(`/Wishlist/${id}`),
}

export const cartApi = {
  getCart: () => api.get("/Cart"),

  // Kiểm tra stock cho toàn bộ giỏ hàng
  // ✅ Tự động hỗ trợ cả authenticated users (Bearer token) và guest users (X-Guest-Key)
  checkStock: () => api.get("/Cart/check-stock"),

  addItem: async (productVariantId, quantity = 1) => {
    const res = await api.post("/CartItems", {
      productVariantId,
      quantity,
    })

    // 🔔 BÁO CHO NAVBAR & TOÀN APP
    window.dispatchEvent(new Event("cartUpdated"))

    return res
  },

  clearCart: async () => {
    const res = await api.post("/Cart/clear")
    window.dispatchEvent(new Event("cartUpdated"))
    return res
  },

  removeItem: async (itemId) => {
    const res = await api.delete(`/CartItems/${itemId}`)
    window.dispatchEvent(new Event("cartUpdated"))
    return res
  },

  updateQuantity: async (cartItemId, quantity) => {
    const res = await api.put("/CartItems", {
      cartItemId: Number(cartItemId),
      quantity: Number(quantity),
    })

    window.dispatchEvent(new Event("cartUpdated"))
    return res
  },
}

export const orderApi = {
  createOrder: (data) => api.post("/Order", data),
  getOrder: (id) => api.get(`/Order/${id}`),
}

export const newsApi = {
  getAll: () => api.get("/News"),
}
export const promotionApi = {
  apply: (code, orderTotal) => api.get(`/Promotion/apply?code=${encodeURIComponent(code)}&orderTotal=${orderTotal}`),
}
export const paymentApi = {
  createVnPayUrl: async (orderId) => {
    const response = await api.post(`/Payment/create-vnpay-url/${orderId}`)
    return response.paymentUrl || response.data?.paymentUrl || response
  },
  verifyCallback: (queryString) =>
    api.get(`/Payment/vnpay-callback${queryString}`),
}

export default api
