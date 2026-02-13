import api from './api';

const sessionService = {
  getAll: async (params) => {
    const response = await api.get('/sessions', { params });
    return response.data.data || response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/sessions/${id}`);
    return response.data.data || response.data;
  },

  book: async (sessionData) => {
    const response = await api.post('/sessions', sessionData);
    return response.data.data || response.data;
  },

  update: async (id, sessionData) => {
    const response = await api.put(`/sessions/${id}`, sessionData);
    return response.data.data || response.data;
  },

  cancel: async (id) => {
    const response = await api.put(`/sessions/${id}/cancel`);
    return response.data.data || response.data;
  },

  complete: async (id) => {
    const response = await api.put(`/sessions/${id}/complete`);
    return response.data.data || response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/sessions/${id}`);
    return response.data.data || response.data;
  },
};

export default sessionService;