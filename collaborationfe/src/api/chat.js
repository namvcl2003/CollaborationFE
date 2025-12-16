/**
 * Chat API client for Groq AI chatbot
 * Uses fetch API for SSE streaming (axios doesn't support SSE)
 */

const API_BASE_URL = 'http://localhost:8000/api/v1';

export const chatAPI = {
  /**
   * Stream chat response using Server-Sent Events
   * Returns a ReadableStream for streaming
   *
   * @param {string} message - User's message
   * @param {Array} conversationHistory - Previous messages
   * @returns {Promise<ReadableStream>}
   */
  streamChat: async (message, conversationHistory = []) => {
    const token = localStorage.getItem('access_token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        message,
        conversation_history: conversationHistory
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return response.body;
  },

  /**
   * Health check for chat service
   * @returns {Promise<Object>}
   */
  checkHealth: async () => {
    const token = localStorage.getItem('access_token');

    const response = await fetch(`${API_BASE_URL}/chat/health`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Test endpoint to verify authentication
   * @returns {Promise<Object>}
   */
  test: async () => {
    const token = localStorage.getItem('access_token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/chat/test`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Summarize a document using AI with streaming
   * @param {number} documentId - ID of document to summarize
   * @param {string} summaryType - Type of summary (default, short, detailed, bullet_points)
   * @returns {Promise<ReadableStream>}
   */
  summarizeDocument: async (documentId, summaryType = 'default') => {
    const token = localStorage.getItem('access_token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(
      `${API_BASE_URL}/chat/summarize/${documentId}?summary_type=${summaryType}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return response.body;
  }
};

export default chatAPI;
