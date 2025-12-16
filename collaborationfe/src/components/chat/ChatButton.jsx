import { MessageCircle, X } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';

/**
 * Floating chat button component
 * Appears in bottom-right corner on all pages
 */
const ChatButton = () => {
  const { isOpen, toggleChat } = useChatStore();

  return (
    <button
      onClick={toggleChat}
      className={`
        fixed bottom-6 right-6 z-[9999]
        w-14 h-14 rounded-full
        bg-gradient-to-r from-blue-600 to-blue-700
        hover:from-blue-700 hover:to-blue-800
        text-white shadow-lg
        flex items-center justify-center
        transition-all duration-300 ease-in-out
        hover:scale-110 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
      `}
      aria-label={isOpen ? 'Close chat' : 'Open chat'}
      title={isOpen ? 'Close chat' : 'Open chat'}
    >
      {isOpen ? (
        <X className="w-6 h-6" />
      ) : (
        <>
          <MessageCircle className="w-6 h-6" />
          {/* Notification badge (optional - can be controlled by store) */}
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        </>
      )}
    </button>
  );
};

export default ChatButton;
