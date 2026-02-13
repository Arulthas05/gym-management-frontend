import api from './api';

const memberService = {
  getAll: async (params) => {
    const response = await api.get('/members', { params });
    return response.data.data || response.data || [];
  },

  getById: async (id) => {
    const response = await api.get(`/members/${id}`);
    return response.data.data || response.data || null;
  },

  create: async (memberData) => {
    const response = await api.post('/members', memberData);
    return response.data.data || response.data;
  },

  update: async (id, memberData) => {
    const response = await api.put(`/members/${id}`, memberData);
    return response.data.data || response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/members/${id}`);
    return response.data.data || response.data;
  },

  calculateBMI: async (id, height, weight) => {
    const response = await api.post(`/members/${id}/calculate-bmi`, { height, weight });
    return response.data.data || response.data;
  },
};

export default memberService;