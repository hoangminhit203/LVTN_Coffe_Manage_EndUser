// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:44384/api';

// Helper to perform API calls with auth token and JSON handling
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultHeaders = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('token');
  if (token) defaultHeaders.Authorization = `Bearer ${token}`;

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  };

  const response = await fetch(url, config);
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message = (data && data.message) || `HTTP error ${response.status}`;
    throw new Error(message);
  }

  return data;
};

// General methods
const api = {
  get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),
  post: (endpoint, body) =>
    apiRequest(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body) =>
    apiRequest(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (endpoint, body) =>
    apiRequest(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' }),
};

// Product API using backend routes /Product and /Product/{id}
export const productApi = {
  getAll: () => api.get('/Product'),
  getById: (id) => api.get(`/Product/${id}`),
};

// Cart API
export const cartApi = {
  getCart: () => api.get('/Cart'),
  addItem: (productVariantId, quantity = 1) =>
    api.post('/CartItems', { productVariantId, quantity }),
  clearCart: () => api.post('/Cart/clear'),
};

// Order API
export const orderApi = {
  createOrder: (orderData) => api.post('/Order', orderData),
  getOrder: (id) => api.get(`/Order/${id}`),
};

export default api;
