import { Bot, Trash2, X } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';

/**
 * Chat window header component
 * Contains title, minimize, clear, and close buttons
 */
const ChatHeader = () => {
  const { minimizeChat, closeChat, clearMessages, messages } = useChatStore();

  const handleClearChat = () => {
    if (messages.length === 0) {
      return;
    }

    if (window.confirm('Bạn có chắc muốn xóa toàn bộ lịch sử chat?')) {
      clearMessages();
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-semibold text-base">AI Assistant</h3>
          <p className="text-xs text-blue-100">Luôn sẵn sàng hỗ trợ bạn</p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* Clear chat button */}
        <button
          onClick={handleClearChat}
          className="p-2 hover:bg-white/10 rounded transition-colors"
          title="Xóa lịch sử chat"
          disabled={messages.length === 0}
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Minimize button */}
        {/* <button
          onClick={minimizeChat}
          className="p-2 hover:bg-white/10 rounded transition-colors"
          title="Thu nhỏ"
        >
          <Minimize2 className="w-4 h-4" />
        </button> */}

        {/* Close button */}
        <button
          onClick={closeChat}
          className="p-2 hover:bg-white/10 rounded transition-colors"
          title="Đóng"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
