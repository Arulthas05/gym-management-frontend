import api from './api';

const membershipService = {
  getAll: async (params) => {
    const response = await api.get('/memberships', { params });
    return response.data.data || response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/memberships/${id}`);
    return response.data.data || response.data;
  },

  getPlans: async () => {
    const response = await api.get('/memberships/plans');
    return response.data.data || response.data;
  },

  create: async (membershipData) => {
    const response = await api.post('/memberships', membershipData);
    return response.data.data || response.data;
  },

  update: async (id, membershipData) => {
    const response = await api.put(`/memberships/${id}`, membershipData);
    return response.data.data || response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/memberships/${id}`);
    return response.data.data || response.data;
  },

  purchase: async (purchaseData) => {
    const response = await api.post('/memberships/purchase', purchaseData);
    return response.data.data || response.data;
  },
};

export default membershipService;