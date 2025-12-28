import api from "./products"

// Order API
export const orderApi = {
  // Lấy tất cả đơn hàng của user
  getAll: () => api.get("/Order"),

  // Lấy chi tiết đơn hàng theo ID
  getById: (id) => api.get(`/Order/${id}`),

  // Tạo đơn hàng mới
  create: (orderData) => api.post("/Order", orderData),

  // Hủy đơn hàng
  cancel: (id) => api.patch(`/Order/${id}/cancel`, {}),

  // Cập nhật trạng thái đơn hàng
  updateStatus: (id, status) => api.patch(`/Order/${id}/status`, { status }),
}

export default orderApi
