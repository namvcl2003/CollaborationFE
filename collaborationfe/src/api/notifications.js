import axios from './axios';

export const notificationsAPI = {
  getNotifications: async (params = {}) => {
    const response = await axios.get('/notifications/', { params });
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await axios.get('/notifications/unread-count');
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await axios.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await axios.put('/notifications/mark-all-read');
    return response.data;
  },
};