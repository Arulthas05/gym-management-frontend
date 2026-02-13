import api from './api';

const paymentService = {
  getAll: async (params) => {
    const response = await api.get('/payments', { params });
    return response.data.data || response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/payments/${id}`);
    return response.data.data || response.data;
  },

  // Create payment intent with member ID
  createIntent: async (data) => {
    const response = await api.post('/payments/create-intent', {
      memberId: data.memberId,  // ✅ Include member ID
      amount: parseFloat(data.amount),
      paymentType: data.paymentType,
      description: data.description || '',
    });
    return response.data.data || response.data;
  },

  // Confirm payment with member ID
  confirmPayment: async (data) => {
    const response = await api.post('/payments/confirm', {
      memberId: data.memberId,  // ✅ Include member ID
      paymentIntentId: data.paymentIntentId,
      amount: parseFloat(data.amount),
      paymentType: data.paymentType,
      description: data.description || '',
    });
    return response.data.data || response.data;
  },

  refund: async (id) => {
    const response = await api.post(`/payments/${id}/refund`);
    return response.data.data || response.data;
  },

  downloadInvoice: async (id) => {
    const response = await api.get(`/payments/${id}/invoice`, { responseType: 'blob' });
    return response.data.data || response.data;
  },
};

export default paymentService;