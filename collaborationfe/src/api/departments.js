import axios from './axios';

export const departmentsAPI = {
  getDepartments: async (params = {}) => {
    const response = await axios.get('/departments/', { params });
    return response.data;
  },

  getDepartment: async (id) => {
    const response = await axios.get(`/departments/${id}`);
    return response.data;
  },

  getDepartmentDetail: async (id) => {
    const response = await axios.get(`/departments/${id}/detail`);
    return response.data;
  },

  createDepartment: async (data) => {
    const response = await axios.post('/departments/', data);
    return response.data;
  },

  updateDepartment: async (id, data) => {
    const response = await axios.put(`/departments/${id}`, data);
    return response.data;
  },

  deleteDepartment: async (id) => {
    const response = await axios.delete(`/departments/${id}`);
    return response.data;
  },

  getActiveUsersCount: async (id) => {
    const response = await axios.get(`/departments/${id}/active-users-count`);
    return response.data;
  },

  // Member management
  getAvailableUsers: async (departmentId = null) => {
    const params = departmentId ? { department_id: departmentId } : {};
    const response = await axios.get('/departments/users/available', { params });
    return response.data;
  },

  getDepartmentMembers: async (id) => {
    const response = await axios.get(`/departments/${id}/members`);
    return response.data;
  },

  assignUserToDepartment: async (departmentId, userId) => {
    const response = await axios.post(`/departments/${departmentId}/members/${userId}`);
    return response.data;
  },

  removeUserFromDepartment: async (departmentId, userId) => {
    const response = await axios.delete(`/departments/${departmentId}/members/${userId}`);
    return response.data;
  },
};
