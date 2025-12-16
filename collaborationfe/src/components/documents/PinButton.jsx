import { Pin } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { documentsAPI } from '../../api/documents';
import { usePinnedStore } from '../../store/pinnedStore';

/**
 * Pin Button Component
 * Allows users to pin/unpin documents for quick access
 * Supports optimistic UI updates with automatic rollback on error
 */
const PinButton = ({ documentId, className = '', onPinChange }) => {
  const { isPinned, addPinnedId, removePinnedId } = usePinnedStore();
  const [loading, setLoading] = useState(false);

  const pinned = isPinned(documentId);

  const handleTogglePin = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    setLoading(true);

    try {
      if (pinned) {
        // Optimistic update - remove from UI immediately
        removePinnedId(documentId);
        await documentsAPI.unpinDocument(documentId);
        toast.success('Đã bỏ ghim văn bản');
      } else {
        // Optimistic update - add to UI immediately
        addPinnedId(documentId);
        await documentsAPI.pinDocument(documentId);
        toast.success('Đã ghim văn bản');
      }

      // Call callback to refresh pinned documents list
      if (onPinChange) {
        onPinChange();
      }
    } catch (error) {
      // Rollback on error
      if (pinned) {
        addPinnedId(documentId);
      } else {
        removePinnedId(documentId);
      }
      console.error('Error toggling pin:', error);
      toast.error(error.response?.data?.detail || 'Không thể thực hiện thao tác');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleTogglePin}
      disabled={loading}
      className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      title={pinned ? 'Bỏ ghim văn bản' : 'Ghim văn bản'}
    >
      <Pin
        className={`h-5 w-5 transition-all ${
          pinned
            ? 'fill-yellow-500 text-yellow-600 dark:fill-yellow-400 dark:text-yellow-500'
            : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400'
        }`}
      />
    </button>
  );
};

export default PinButton;
