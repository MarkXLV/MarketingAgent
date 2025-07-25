'use client';
import { useEffect } from 'react';
import { useAppStore } from '../../lib/store';
import { getHistory, getConversationMessages } from '../../lib/api';
import { Clock, MessageCircle } from 'lucide-react';

interface ChatHistoryProps {
  userId: string;
  onSelectConversation?: (convoId: string) => void;
}

// interface Conversation {
//   convoId: string;
//   startedAt: number;
//   title: string;
//   firstMessage?: string;
// }

export default function ChatHistory({ userId, onSelectConversation }: ChatHistoryProps) {
  const { 
    conversations, 
    isLoadingHistory, 
    setConversations, 
    setLoadingHistory,
    loadHistoryMessages,
    setConversationId,
    conversationId
  } = useAppStore();

  // Load conversation list when component mounts
  useEffect(() => {
    loadConversations();
  }, [userId]);

  const loadConversations = async () => {
    if (!userId) return;
    
    setLoadingHistory(true);
    try {
      const conversations = await getHistory(userId);
      setConversations(conversations);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const selectConversation = async (convoId: string) => {
    try {
      const messages = await getConversationMessages(convoId, userId);
      
      // Transform messages to match our ChatMessage interface
      const transformedMessages = messages.map((msg: { author: string; content: string; ts: number }) => ({
        id: `${msg.ts}`, // Use timestamp as ID
        author: msg.author,
        content: msg.content,
        ts: msg.ts
      }));
      
      loadHistoryMessages(transformedMessages);
      setConversationId(convoId);
      
      if (onSelectConversation) {
        onSelectConversation(convoId);
      }
    } catch (error) {
      console.error('Failed to load conversation messages:', error);
    }
  };

  // const generateTitle = (convoId: string) => {
  //   // This function is no longer needed since backend provides titles
  //   return `Conversation ${convoId.slice(-8)}`;
  // };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 border-r">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold text-gray-800">Chat History</h2>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <button
          onClick={() => {
            loadHistoryMessages([]);
            setConversationId(null);
            if (onSelectConversation) {
              onSelectConversation('');
            }
          }}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + New Chat
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {isLoadingHistory ? (
          <div className="p-4 text-center text-gray-500">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm">Loading history...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No conversations yet</p>
            <p className="text-xs text-gray-400 mt-1">Start chatting to see your history here</p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {conversations.map((conversation) => (
              <button
                key={conversation.convoId}
                onClick={() => selectConversation(conversation.convoId)}
                className={`w-full p-3 text-left rounded-lg transition-colors ${
                  conversationId === conversation.convoId
                    ? 'bg-blue-100 border border-blue-200'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-800 truncate">
                      {conversation.title || 'Financial Chat'}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {formatDate(conversation.startedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 