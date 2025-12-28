import api from "./products"

// Shipping Address API
export const shippingAddressApi = {
  // Lấy tất cả địa chỉ giao hàng của user
  getAll: () => api.get("/shipping-address"),

  // Lấy một địa chỉ giao hàng theo ID
  getById: (id) => api.get(`/shipping-address/${id}`),

  // Tạo địa chỉ giao hàng mới
  create: (data) => api.post("/shipping-address", data),

  // Cập nhật địa chỉ giao hàng
  update: (id, data) => api.put(`/shipping-address/${id}`, data),

  // Xóa địa chỉ giao hàng
  delete: (id) => api.delete(`/shipping-address/${id}`),

  // Đặt địa chỉ làm mặc định
  setDefault: (id) => api.patch(`/shipping-address/${id}/set-default`, {}),
}

export default shippingAddressApi
