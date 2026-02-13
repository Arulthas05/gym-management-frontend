import api from './api';

const attendanceService = {
  getAll: async (params) => {
    const response = await api.get('/attendance', { params });
    return response.data.data || response.data || [];
  },

  checkIn: async (memberId) => {
    const response = await api.post('/attendance/check-in', { memberId });
    return response.data.data || response.data || [];
  },

  checkOut: async (memberId) => {
    const response = await api.post('/attendance/check-out', { memberId });
    return response.data.data  || response.data || [];
  },

  scanQR: async (qrData) => {
    const response = await api.post('/attendance/scan', { qrData });
    return response.data.data || response.data || [];
  },
};

export default attendanceService;