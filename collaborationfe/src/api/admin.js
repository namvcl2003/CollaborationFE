import axios from './axios';

export const adminAPI = {
  getSystemStats: async () => {
    const response = await axios.get('/admin/stats');
    return response.data;
  },

  getDepartmentsPerformance: async () => {
    const response = await axios.get('/admin/departments/performance');
    return response.data;
  },

  getTopUsers: async (limit = 10) => {
    const response = await axios.get('/admin/users/top', { params: { limit } });
    return response.data;
  },

  getOverdueDocuments: async () => {
    const response = await axios.get('/admin/documents/overdue');
    return response.data;
  },
};
