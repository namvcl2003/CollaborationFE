import axios from './axios';

export const templatesAPI = {
  /**
   * Get all templates with optional filters
   * @param {Object} params - Query parameters
   * @param {number} params.skip - Number to skip
   * @param {number} params.limit - Limit results
   * @param {string} params.search - Search term
   * @param {string} params.category - Filter by category
   */
  getTemplates: async (params = {}) => {
    const response = await axios.get('/templates/', { params });
    return response.data;
  },

  /**
   * Get all template categories
   */
  getCategories: async () => {
    const response = await axios.get('/templates/categories');
    return response.data;
  },

  /**
   * Get single template by ID
   * @param {number} templateId - Template ID
   */
  getTemplate: async (templateId) => {
    const response = await axios.get(`/templates/${templateId}`);
    return response.data;
  },

  /**
   * Get template file as blob (for using in forms)
   * @param {number} templateId - Template ID
   * @returns {Promise<Blob>} - File blob
   */
  getTemplateBlob: async (templateId) => {
    const response = await axios.get(`/templates/${templateId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Download template file
   * @param {number} templateId - Template ID
   * @param {string} fileName - File name for download
   */
  downloadTemplate: async (templateId, fileName) => {
    const response = await axios.get(`/templates/${templateId}/download`, {
      responseType: 'blob',
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  /**
   * Create new template with file upload
   * @param {FormData} formData - Form data with file
   */
  createTemplate: async (formData) => {
    const response = await axios.post('/templates/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Update template
   * @param {number} templateId - Template ID
   * @param {FormData} formData - Form data to update
   */
  updateTemplate: async (templateId, formData) => {
    const response = await axios.put(`/templates/${templateId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Delete template (soft delete)
   * @param {number} templateId - Template ID
   */
  deleteTemplate: async (templateId) => {
    const response = await axios.delete(`/templates/${templateId}`);
    return response.data;
  },
};
