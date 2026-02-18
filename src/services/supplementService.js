import api from './api';

const normalize = (supplement) => {
  if (!supplement) return supplement;

  // derive API origin (strip trailing /api if present)
  const apiBase = (api.defaults && api.defaults.baseURL)
    ? api.defaults.baseURL.replace(/\/api\/?$/, '')
    : '';

  const toFullUrl = (p) => {
    if (!p) return null;
    if (/^https?:\/\//i.test(p)) return p;
    if (p.startsWith('/')) return `${apiBase}${p}`;
    return `${apiBase}/${p}`;
  };

  const rawImage = supplement.image_url || null;
  const fullImage = toFullUrl(rawImage);

  return {
    ...supplement,
    // prefer camelCase in frontend (absolute URL)
    imageUrl: fullImage,
    stock: supplement.stock !== undefined ? supplement.stock : (supplement.stock_quantity ?? supplement.stockQuantity ?? 0),
    // keep original fields for safety (also provide absolute URL)
    image_url: fullImage || (supplement.image_url || null),
    stock_quantity: supplement.stock_quantity ?? supplement.stock ?? supplement.stockQuantity ?? 0,
  };
};

const supplementService = {
  getAll: async (params) => {
    const response = await api.get('/supplements', { params });
    const payload = response.data.data || response.data;
    if (payload && Array.isArray(payload.supplements)) {
      payload.supplements = payload.supplements.map(normalize);
    }
    return payload;
  },

  getById: async (id) => {
    const response = await api.get(`/supplements/${id}`);
    const payload = response.data.data || response.data;
    return normalize(payload);
  },

  create: async (supplementData) => {
    const response = await api.post('/supplements', supplementData);
    const payload = response.data.data || response.data;
    return normalize(payload);
  },

  update: async (id, supplementData) => {
    const response = await api.put(`/supplements/${id}`, supplementData);
    const payload = response.data.data || response.data;
    return normalize(payload);
  },

  delete: async (id) => {
    const response = await api.delete(`/supplements/${id}`);
    return response.data.data || response.data;
  },

  purchase: async (purchaseData) => {
    const response = await api.post('/supplements/purchase', purchaseData);
    return response.data.data || response.data;
  },
};

export default supplementService;