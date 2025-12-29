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
  } else {
    // 2. Nếu không có Token, tự động đính kèm Guest Key (Khách vãng lai)
    defaultHeaders["X-Guest-Key"] = getGuestKey()
  }

  const config = {
    ...options,
    credentials: "include",
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  }

  const response = await fetch(url, config)
  const contentType = response.headers.get("content-type") || ""
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    const message = (data && data.message) || `HTTP error ${response.status}`
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
  delete: (endpoint) => apiRequest(endpoint, { method: "DELETE" }),
}

// --- Lấy danh sách danh mục (Get All) ---
export const getCategories = async (params) => {
  try {
    const queryParams = new URLSearchParams()
    if (params?.pageNumber) queryParams.append("PageNumber", params.pageNumber)
    if (params?.pageSize) queryParams.append("PageSize", params.pageSize)
    if (params?.searchTerm) queryParams.append("Name", params.searchTerm)

    const endpoint = `/Category${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`
    const res = await api.get(endpoint)

    return res
  } catch (error) {
    console.error("Lỗi khi lấy danh sách Category:", error)
    throw error
  }
}

// --- Lấy chi tiết theo ID (Get by ID) ---
export const getCategoryById = async (id) => {
  try {
    const res = await api.get(`/Category/${id}`)
    return res.data
  } catch (error) {
    console.error(`Lỗi khi lấy chi tiết Category ID ${id}:`, error)
    throw error
  }
}

// --- Tạo mới (Create) ---
export const createdCategory = async (data) => {
  try {
    const res = await api.post("/Category", data)
    return res
  } catch (error) {
    console.error("Lỗi khi tạo mới Category:", error)
    throw error
  }
}

// --- Cập nhật (Update) ---
export const updateCategory = async (id, data) => {
  try {
    const res = await api.put(`/Category/${id}`, data)
    return res
  } catch (error) {
    console.error(`Lỗi khi cập nhật Category ID ${id}:`, error)
    throw error
  }
}

// --- Xóa (Delete) ---
export const deleteCategory = async (id) => {
  try {
    const res = await api.delete(`/Category/${id}`)
    return res
  } catch (error) {
    console.error(`Lỗi khi xóa Category ID ${id}:`, error)
    throw error
  }
}

// --- Lấy sản phẩm theo Category (Get Products by Category) ---
export const getProductsByCategory = async (categoryId, params) => {
  try {
    const queryParams = new URLSearchParams()
    if (params?.pageNumber) queryParams.append("pageNumber", params.pageNumber)
    if (params?.pageSize) queryParams.append("pageSize", params.pageSize)

    const endpoint = `/Category/${categoryId}/products${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`
    const res = await api.get(endpoint)

    return res
  } catch (error) {
    console.error(`Lỗi khi lấy sản phẩm theo Category ID ${categoryId}:`, error)
    throw error
  }
}
