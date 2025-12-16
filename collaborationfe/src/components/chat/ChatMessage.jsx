import { Bot, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * Individual chat message component
 * Displays user or assistant messages with avatars and timestamps
 */
const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
        ${isUser ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}
      `}>
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        )}
      </div>

      {/* Message bubble */}
      <div className={`flex flex-col gap-1 max-w-[80%]`}>
        <div className={`
          p-3 rounded-lg break-words
          ${isUser
            ? 'bg-blue-600 text-white rounded-tr-none'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-none'
          }
        `}>
          <p className="text-sm whitespace-pre-wrap leading-relaxed">
            {message.content}
          </p>
        </div>

        {/* Timestamp */}
        {message.timestamp && (
          <span className={`text-xs text-gray-500 dark:text-gray-400 ${isUser ? 'text-right' : 'text-left'}`}>
            {formatDistanceToNow(new Date(message.timestamp), {
              addSuffix: true,
              locale: vi
            })}
          </span>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
