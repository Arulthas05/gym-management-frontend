import api from './api';

const trainerService = {
  getAll: async (params) => {
    const response = await api.get('/trainers', { params });
    return response.data.data || response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/trainers/${id}`);
    return response.data.data || response.data;
  },

  create: async (trainerData) => {
    const response = await api.post('/trainers', trainerData);
    return response.data.data || response.data;
  },

  update: async (id, trainerData) => {
    const response = await api.put(`/trainers/${id}`, trainerData);
    return response.data.data || response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/trainers/${id}`);
    return response.data.data || response.data;
  },

  getSchedule: async (id) => {
    const response = await api.get(`/trainers/${id}/schedule`);
    return response.data.data || response.data;
  },
};

export default trainerService;