import api from './api';

const supplementService = {
  getAll: async (params) => {
    const response = await api.get('/supplements', { params });
    return response.data.data || response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/supplements/${id}`);
    return response.data.data || response.data;
  },

  create: async (supplementData) => {
    const response = await api.post('/supplements', supplementData);
    return response.data.data || response.data;
  },

  update: async (id, supplementData) => {
    const response = await api.put(`/supplements/${id}`, supplementData);
    return response.data.data || response.data;
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