import { useState, useCallback, useRef } from 'react';
import { chatAPI } from '../api/chat';

/**
 * Custom hook for streaming chat with SSE
 *
 * @returns {Object} - Streaming methods and state
 */
export const useStreamingChat = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  /**
   * Stream a message and receive chunks in real-time
   *
   * @param {string} message - User's message
   * @param {Array} conversationHistory - Previous messages
   * @param {Function} onChunk - Callback for each chunk received
   * @param {Function} onComplete - Callback when streaming completes
   */
  const streamMessage = useCallback(async (
    message,
    conversationHistory,
    onChunk,
    onComplete
  ) => {
    setIsStreaming(true);
    setError(null);

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      const stream = await chatAPI.streamChat(message, conversationHistory);
      const reader = stream.getReader();
      const decoder = new TextDecoder();

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        // Decode chunk
        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE messages (separated by \n\n)
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || ''; // Keep incomplete message in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6)); // Remove 'data: ' prefix

              if (data.error) {
                setError(data.error);
                break;
              }

              if (data.done) {
                if (onComplete) {
                  onComplete();
                }
                break;
              }

              if (data.content && onChunk) {
                onChunk(data.content);
              }
            } catch (parseError) {
              console.error('Error parsing SSE data:', parseError);
            }
          }
        }
      }

    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Streaming error:', err);
        setError(err.message || 'An error occurred during streaming');
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, []);

  /**
   * Cancel ongoing stream
   */
  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    streamMessage,
    cancelStream,
    clearError,
    isStreaming,
    error
  };
};

export default useStreamingChat;
