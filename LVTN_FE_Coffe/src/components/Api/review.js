import api from './products'

export const reviewApi = {
  // POST /Review  body: { variantId, rating, comment }
  create: (data) => api.post('/Review', data),

  // GET /Review/Review/{variantId}
  getByVariant: (variantId) => api.get(`/Review/Review/${variantId}`),
}

export default reviewApi
