import api from './api';

const reportService = {
  getDashboardStats: async () => {
    const response = await api.get('/reports/dashboard');
    return response.data.data || response.data;
  },

  getMembershipReport: async (params) => {
    const response = await api.get('/reports/membership', { params });
    return response.data.data || response.data;
  },

  getRevenueReport: async (params) => {
    const response = await api.get('/reports/revenue', { params });
    return response.data.data || response.data;
  },

  getAttendanceReport: async (params) => {
    const response = await api.get('/reports/attendance', { params });
    return response.data.data || response.data;
  },

  exportPDF: async (reportType, params) => {
    const response = await api.get(`/reports/${reportType}/pdf`, {
      params,
      responseType: 'blob',
    });
    return response.data.data || response.data;
  },
};

export default reportService;