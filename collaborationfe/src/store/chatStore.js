import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Chat Store using Zustand
 * Manages chat state with localStorage persistence
 */
export const useChatStore = create(
  persist(
    (set, get) => ({
      // State
      messages: [],
      isOpen: false,
      isMinimized: false,

      // Actions
      /**
       * Add a new message to the chat
       * @param {Object} message - Message object with role and content
       */
      addMessage: (message) => {
        set((state) => ({
          messages: [...state.messages, {
            id: Date.now() + Math.random(), // Unique ID
            timestamp: new Date().toISOString(),
            ...message
          }]
        }));
      },

      /**
       * Update the last message (for streaming)
       * @param {string} content - Content to append to last message
       */
      updateLastMessage: (content) => {
        set((state) => {
          const messages = [...state.messages];
          const lastMessage = messages[messages.length - 1];

          if (lastMessage && lastMessage.role === 'assistant') {
            lastMessage.content += content;
          }

          return { messages };
        });
      },

      /**
       * Clear all messages
       */
      clearMessages: () => {
        set({ messages: [] });
      },

      /**
       * Toggle chat window
       */
      toggleChat: () => {
        set((state) => ({
          isOpen: !state.isOpen,
          isMinimized: false // Always maximize when toggling
        }));
      },

      /**
       * Open chat window
       */
      openChat: () => {
        set({ isOpen: true, isMinimized: false });
      },

      /**
       * Close chat window
       */
      closeChat: () => {
        set({ isOpen: false });
      },

      /**
       * Minimize chat window
       */
      minimizeChat: () => {
        set({ isMinimized: true });
      },

      /**
       * Maximize chat window
       */
      maximizeChat: () => {
        set({ isMinimized: false });
      },

      /**
       * Get conversation history for API (last 10 messages)
       * @returns {Array} Array of {role, content} objects
       */
      getConversationHistory: () => {
        const messages = get().messages;
        return messages.slice(-10).map(msg => ({
          role: msg.role,
          content: msg.content
        }));
      },

      /**
       * Delete a specific message by ID
       * @param {number} messageId - ID of message to delete
       */
      deleteMessage: (messageId) => {
        set((state) => ({
          messages: state.messages.filter(msg => msg.id !== messageId)
        }));
      },

      /**
       * Edit a specific message
       * @param {number} messageId - ID of message to edit
       * @param {string} newContent - New content for the message
       */
      editMessage: (messageId, newContent) => {
        set((state) => ({
          messages: state.messages.map(msg =>
            msg.id === messageId ? { ...msg, content: newContent } : msg
          )
        }));
      }
    }),
    {
      name: 'chat-storage', // localStorage key
      partialPersist: (state) => ({
        // Only persist messages, not UI state
        messages: state.messages.slice(-50) // Keep last 50 messages only
      })
    }
  )
);

export default useChatStore;
