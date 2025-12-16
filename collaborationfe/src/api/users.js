// import axios from './axios';

// export const usersAPI = {
//   getCurrentUser: async () => {
//     const response = await axios.get('/users/me');
//     return response.data;
//   },

//   getDepartmentUsers: async () => {
//     const response = await axios.get('/users/department');
//     return response.data;
//   },

//   getHigherLevelUsers: async () => {
//     const response = await axios.get('/users/higher-level');
//     return response.data;
//   },

//   getLowerLevelUsers: async () => {
//     const response = await axios.get('/users/lower-level');
//     return response.data;
//   },

//   getUsersByRole: async (roleLevel) => {
//     const response = await axios.get(`/users/by-role/${roleLevel}`);
//     return response.data;
//   },
// };


import axios from './axios';

export const usersAPI = {
  // ==========================================
  // OLD APIs (giữ lại để không breaking)
  // ==========================================
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

  // ==========================================
  // NEW APIs - User Management CRUD
  // ==========================================
  
  /**
   * Get users based on role (Manager: department users, Admin: all users)
   * @param {Object} params - Query parameters
   */
  getUsers: async (params = {}) => {
    const response = await axios.get('/users/', { params });
    return response.data;
  },

  /**
   * Get all users with pagination and search
   * @param {number} page - Page number (default: 1)
   * @param {number} pageSize - Items per page (default: 10)
   * @param {string} search - Search term (optional)
   */
  getAllUsers: async (page = 1, pageSize = 10, search = '') => {
    const params = {
      page,
      page_size: pageSize,
    };

    if (search) {
      params.search = search;
    }

    const response = await axios.get('/users/', { params });
    return response.data;
  },

  /**
   * Get single user by ID
   * @param {number} userId - User ID
   */
  getUser: async (userId) => {
    const response = await axios.get(`/users/${userId}`);
    return response.data;
  },

  /**
   * Create new user
   * @param {Object} userData - User data
   * @param {string} userData.username - Username (required)
   * @param {string} userData.password - Password (required)
   * @param {string} userData.full_name - Full name (required)
   * @param {string} userData.email - Email (optional)
   * @param {number} userData.role_id - Role ID (required)
   * @param {number} userData.department_id - Department ID (optional)
   */
  createUser: async (userData) => {
    const response = await axios.post('/users/', userData);
    return response.data;
  },

  /**
   * Update user
   * @param {number} userId - User ID
   * @param {Object} userData - User data to update
   * @param {string} userData.email - Email (optional)
   * @param {string} userData.full_name - Full name (optional)
   * @param {number} userData.role_id - Role ID (optional)
   * @param {number} userData.department_id - Department ID (optional)
   * @param {string} userData.password - New password (optional)
   * @param {boolean} userData.is_active - Active status (optional)
   */
  updateUser: async (userId, userData) => {
    const response = await axios.put(`/users/${userId}`, userData);
    return response.data;
  },

  /**
   * Delete user (soft delete - set IsActive = false)
   * @param {number} userId - User ID
   */
  deleteUser: async (userId) => {
    const response = await axios.delete(`/users/${userId}`);
    return response.data;
  },

  /**
   * Activate user (set IsActive = true)
   * @param {number} userId - User ID
   */
  activateUser: async (userId) => {
    const response = await axios.patch(`/users/${userId}/activate`);
    return response.data;
  },

  /**
   * Get list of all roles
   */
  getRoles: async () => {
    const response = await axios.get('/users/roles');
    return response.data;
  },

  /**
   * Get list of all departments
   */
  getDepartments: async () => {
    const response = await axios.get('/users/departments');
    return response.data;
  },

  /**
   * Get current user info (alternative endpoint)
   */
  getMyInfo: async () => {
    const response = await axios.get('/users/me/info');
    return response.data;
  },
};