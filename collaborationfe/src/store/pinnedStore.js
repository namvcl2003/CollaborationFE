import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Zustand store for managing pinned documents
 * Provides optimistic UI updates with localStorage persistence
 */
export const usePinnedStore = create(
  persist(
    (set, get) => ({
      // Set of pinned document IDs
      pinnedIds: new Set(),

      /**
       * Add document to pinned set (optimistic update)
       */
      addPinnedId: (documentId) => {
        set((state) => {
          const newPinnedIds = new Set(state.pinnedIds);
          newPinnedIds.add(documentId);
          return { pinnedIds: newPinnedIds };
        });
      },

      /**
       * Remove document from pinned set (optimistic update)
       */
      removePinnedId: (documentId) => {
        set((state) => {
          const newPinnedIds = new Set(state.pinnedIds);
          newPinnedIds.delete(documentId);
          return { pinnedIds: newPinnedIds };
        });
      },

      /**
       * Check if document is pinned
       */
      isPinned: (documentId) => {
        return get().pinnedIds.has(documentId);
      },

      /**
       * Load pinned IDs from documents array
       * Called when fetching documents from API
       */
      loadPinnedIds: (documents) => {
        const pinnedIds = new Set(
          documents.filter(doc => doc.is_pinned).map(doc => doc.DocumentId)
        );
        set({ pinnedIds });
      },

      /**
       * Clear all pinned IDs (e.g., on logout)
       */
      clearPinnedIds: () => {
        set({ pinnedIds: new Set() });
      },
    }),
    {
      name: 'pinned-documents-storage',
      // Custom serialization for Set
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const { state } = JSON.parse(str);
          return {
            state: {
              ...state,
              pinnedIds: new Set(state.pinnedIds || []),
            },
          };
        },
        setItem: (name, newValue) => {
          const str = JSON.stringify({
            state: {
              ...newValue.state,
              pinnedIds: Array.from(newValue.state.pinnedIds),
            },
          });
          localStorage.setItem(name, str);
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);
