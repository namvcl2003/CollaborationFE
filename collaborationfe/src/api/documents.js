import axios from './axios';

export const documentsAPI = {
  getDocuments: async (params = {}) => {
    const response = await axios.get('/documents/', { params });
    return response.data;
  },

  getDocument: async (id) => {
    const response = await axios.get(`/documents/${id}`);
    return response.data;
  },

  createDocument: async (formData) => {
    const response = await axios.post('/documents/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateDocument: async (id, data) => {
    const response = await axios.put(`/documents/${id}`, data);
    return response.data;
  },

  getVersions: async (id) => {
    const response = await axios.get(`/documents/${id}/versions`);
    return response.data;
  },

  createVersion: async (id, formData) => {
    const response = await axios.post(`/documents/${id}/versions`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  downloadDocument: async (id) => {
    const response = await axios.get(`/documents/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  getCategories: async () => {
    const response = await axios.get('/documents/categories/list');
    return response.data;
  },

  getStatuses: async () => {
    const response = await axios.get('/documents/statuses/list');
    return response.data;
  },

  getComments: async (id) => {
    const response = await axios.get(`/documents/${id}/comments`);
    return response.data;
  },

  addComment: async (id, data) => {
    const response = await axios.post(`/documents/${id}/comments`, data);
    return response.data;
  },
};