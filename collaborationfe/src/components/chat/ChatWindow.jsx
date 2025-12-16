import { useEffect, useRef } from 'react';
import { useChatStore } from '../../store/chatStore';
import { useStreamingChat } from '../../hooks/useStreamingChat';
import ChatHeader from './ChatHeader';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { Loader2, Bot, AlertCircle, FileText, Sparkles } from 'lucide-react';

/**
 * Main chat window component
 * Integrates header, messages list, and input
 */
const ChatWindow = () => {
  const {
    messages,
    isOpen,
    isMinimized,
    addMessage,
    updateLastMessage,
    getConversationHistory
  } = useChatStore();

  const { streamMessage, isStreaming, error, clearError } = useStreamingChat();
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (content) => {
    // Clear any previous errors
    clearError();

    // Add user message
    addMessage({
      role: 'user',
      content
    });

    // Add empty assistant message (will be filled during streaming)
    addMessage({
      role: 'assistant',
      content: ''
    });

    // Start streaming
    await streamMessage(
      content,
      getConversationHistory(),
      (chunk) => {
        // Update last message with new chunk
        updateLastMessage(chunk);
      },
      () => {
        // Streaming complete
        console.log('Streaming complete');
      }
    );
  };

  // Don't render if chat is closed
  if (!isOpen) return null;

  // Minimized state - only show header
  if (isMinimized) {
    return (
      <div className="fixed bottom-24 right-6 w-80 bg-white dark:bg-gray-800 rounded-t-lg shadow-xl z-[9998]">
        <ChatHeader />
      </div>
    );
  }

  return (
    <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-2xl z-[9998] flex flex-col">
      <ChatHeader />

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        {messages.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400 px-4">
            <Bot className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Xin chào! Tôi là AI Assistant</p>
            <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">
              Hỏi tôi về tài liệu, quy trình phê duyệt, hoặc công việc được phân công
            </p>
            <div className="mt-4 space-y-2 text-left w-full">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Câu hỏi mẫu:</p>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <li
                  className="p-2 bg-white dark:bg-gray-800 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition"
                  onClick={() => handleSendMessage("Tôi có bao nhiêu tài liệu đang chờ phê duyệt?")}
                >
                  • "Tôi có bao nhiêu tài liệu đang chờ phê duyệt?"
                </li>
                <li
                  className="p-2 bg-white dark:bg-gray-800 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition"
                  onClick={() => handleSendMessage("Cho tôi biết về công việc được giao cho tôi")}
                >
                  • "Cho tôi biết về công việc được giao cho tôi"
                </li>
                <li
                  className="p-2 bg-white dark:bg-gray-800 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition"
                  onClick={() => handleSendMessage("Lịch sử phê duyệt của tôi như thế nào?")}
                >
                  • "Lịch sử phê duyệt của tôi như thế nào?"
                </li>
              </ul>

              {/* Document Summarization - Natural Language */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Tóm tắt & Đọc tài liệu (AI):</p>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => handleSendMessage("Tóm tắt tài liệu mới nhất của tôi")}
                    className="w-full p-2.5 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg hover:from-purple-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <FileText className="w-4 h-4" />
                    Tóm tắt tài liệu mới nhất
                  </button>

                  <div className="grid grid-cols-1 gap-1.5 text-xs">
                    <button
                      onClick={() => handleSendMessage("Nội dung tài liệu mới nhất là gì?")}
                      className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-900/40 transition text-left"
                    >
                      💬 "Nội dung tài liệu mới nhất là gì?"
                    </button>
                    <button
                      onClick={() => handleSendMessage("Phân tích chi tiết tài liệu vừa tạo")}
                      className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-900/40 transition text-left"
                    >
                      🔍 "Phân tích chi tiết tài liệu vừa tạo"
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
                  💡 Tip: Gõ "tóm tắt [tên tài liệu]" hoặc "nội dung văn bản ABC" để AI tự động đọc và tóm tắt!
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}

            {/* Loading indicator */}
            {isStreaming && (
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 px-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">AI đang suy nghĩ...</span>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">Lỗi</p>
                  <p className="text-xs mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input area */}
      <ChatInput
        onSend={handleSendMessage}
        isStreaming={isStreaming}
        disabled={false}
      />
    </div>
  );
};

export default ChatWindow;
