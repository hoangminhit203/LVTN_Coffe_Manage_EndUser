import api from './products';

// Auth API for user login
export const userApi = {
  login: (credentials) => api.post('/Auth/login', credentials),
  register: (data) => api.post('/Auth/register', data),
  getOrders: () => api.get('/Order'),
  getOrderById: (id) => api.get(`/Order/${id}`),
  getProfile: () => api.get('/User/profile'),
  getAddresses: () => api.get('/User/addresses'),
  updateProfile: (data) => api.put('/User/profile', data),

};

export default userApi;


