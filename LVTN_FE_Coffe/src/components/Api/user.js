import api from "./products"

// Auth API for user login
export const userApi = {
  login: (credentials) => api.post("/Auth/login", credentials),
  register: (data) => api.post("/Auth/Register", data),
  confirmEmail: (data) => api.post("/Auth/ConfirmEmail", data),
  resendOtp: (email) => api.post("/Auth/ResendOtp", { email }),
  me: () => api.get("/Auth/Me"),
  getOrders: () => api.get("/Order"),
  getOrderById: (id) => api.get(`/Order/${id}`),
  getProfile: () => api.get("/User/profile"),
  getAddresses: () => api.get("/User/addresses"),
  updateProfile: (data) => api.put("/User/profile", data),
}

export default userApi
