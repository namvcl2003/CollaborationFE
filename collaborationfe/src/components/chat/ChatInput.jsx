import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';

/**
 * Chat input component
 * Textarea with send button, supports Enter to send and Shift+Enter for new line
 */
const ChatInput = ({ onSend, isStreaming, disabled }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedInput = input.trim();

    if (trimmedInput && !isStreaming && !disabled) {
      onSend(trimmedInput);
      setInput('');

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-lg">
      <div className="flex gap-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Hỏi về tài liệu, công việc, quy trình..."
          disabled={disabled || isStreaming}
          className="
            flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-600
            px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500
            disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:cursor-not-allowed
            max-h-32 min-h-[42px]
            text-sm
            bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
            placeholder:text-gray-500 dark:placeholder:text-gray-400
          "
          rows={1}
        />

        <button
          type="submit"
          disabled={!input.trim() || isStreaming || disabled}
          className="
            px-4 py-2 bg-blue-600 text-white rounded-lg
            hover:bg-blue-700 transition-colors
            disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed
            flex items-center justify-center
            min-w-[48px]
          "
          title={isStreaming ? 'Đang gửi...' : 'Gửi tin nhắn'}
        >
          {isStreaming ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        <kbd className="px-1 py-0.5 text-xs font-semibold text-gray-800 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded">
          Enter
        </kbd>{' '}
        để gửi,{' '}
        <kbd className="px-1 py-0.5 text-xs font-semibold text-gray-800 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded">
          Shift + Enter
        </kbd>{' '}
        để xuống dòng
      </p>
    </form>
  );
};

export default ChatInput;
