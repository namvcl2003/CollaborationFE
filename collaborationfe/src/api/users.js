import axios from './axios';

export const usersAPI = {
  getCurrentUser: async () => {
    const response = await axios.get('/users/me');
    return response.data;
  },

  getDepartmentUsers: async () => {
    const response = await axios.get('/users/department');
    return response.data;
  },

  getHigherLevelUsers: async () => {
    const response = await axios.get('/users/higher-level');
    return response.data;
  },

  getLowerLevelUsers: async () => {
    const response = await axios.get('/users/lower-level');
    return response.data;
  },

  getUsersByRole: async (roleLevel) => {
    const response = await axios.get(`/users/by-role/${roleLevel}`);
    return response.data;
  },
};