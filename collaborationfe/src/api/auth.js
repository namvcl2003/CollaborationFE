import axios from './axios';

export const authAPI = {
  login: async (credentials) => {
    const response = await axios.post('/auth/login', credentials);
    return response.data;
  },

  logout: async (refreshToken) => {
    const response = await axios.post('/auth/logout', { refresh_token: refreshToken });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await axios.get('/auth/me');
    return response.data;
  },

  changePassword: async (data) => {
    const response = await axios.post('/auth/change-password', data);
    return response.data;
  },
};