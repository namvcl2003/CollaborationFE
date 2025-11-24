import axios from './axios';

export const workflowAPI = {
  submitDocument: async (id, data) => {
    const response = await axios.post(`/workflow/${id}/submit`, data);
    return response.data;
  },

  approveDocument: async (id, data) => {
    const response = await axios.post(`/workflow/${id}/approve`, data);
    return response.data;
  },

  rejectDocument: async (id, data) => {
    const response = await axios.post(`/workflow/${id}/reject`, data);
    return response.data;
  },

  requestRevision: async (id, data) => {
    const response = await axios.post(`/workflow/${id}/request-revision`, data);
    return response.data;
  },

  getWorkflowHistory: async (id) => {
    const response = await axios.get(`/workflow/${id}/history`);
    return response.data;
  },

  getMyAssignments: async () => {
    const response = await axios.get('/workflow/assignments/my');
    return response.data;
  },
};