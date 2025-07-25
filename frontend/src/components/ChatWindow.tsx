'use client';

import { useState, useRef, useEffect } from 'react';
import { useChatStore, useUserStore } from '../../lib/store';
import { postChatMessage } from '../../lib/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ChatWindow() {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { history, addMessage, conversationId, setConversationId, isLoading, setLoading } = useChatStore();
  const { user } = useUserStore();
  
  const userId = user?.userId || 'demo-user'; // Fallback for demo

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { 
      author: 'user' as const, 
      content: input.trim(),
      ts: Date.now()
    };
    
    addMessage(userMessage);
    setInput('');
    setLoading(true);

    try {
      // Convert history to the format expected by backend
      const historyForBackend = [];
      
      // Group consecutive user/bot messages into pairs
      for (let i = 0; i < history.length; i += 2) {
        const userMsg = history[i];
        const botMsg = history[i + 1];
        
        if (userMsg && userMsg.author === 'user') {
          const exchange: any = { user: userMsg.content };
          if (botMsg && botMsg.author === 'assistant') {
            exchange.bot = botMsg.content;
          }
          historyForBackend.push(exchange);
        }
      }

      const response = await postChatMessage(
        historyForBackend, 
        input.trim(), 
        conversationId, 
        userId
      );
      
      const botMessage = { 
        author: 'assistant' as const, 
        content: response.bot_reply,
        ts: Date.now()
      };
      
      addMessage(botMessage);
      
      if (response.convoId && response.convoId !== conversationId) {
        setConversationId(response.convoId);
      }

    } catch (error) {
      console.error('Chat error:', error);
      
      let errorContent = 'Sorry, I encountered an error. Please try again.';
      
      // Handle guardrail errors (400) - show the actual reason
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as any;
        if (axiosError.response?.status === 400) {
          errorContent = axiosError.response.data.detail || 'I cannot assist with that request.';
        }
      }
      
      const errorMessage = { 
        author: 'assistant' as const, 
        content: errorContent,
        ts: Date.now()
      };
      addMessage(errorMessage);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="p-4 border-b bg-blue-50 rounded-t-lg">
        <h2 className="text-lg font-semibold text-gray-800">Financial Coach</h2>
        <p className="text-sm text-gray-600">Ask me anything about your finances</p>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4" role="log" aria-live="polite" aria-label="Chat messages">
        {history.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p>👋 Hello! I'm your AI Financial Coach.</p>
            <p>Ask me about budgeting, saving, or financial planning!</p>
          </div>
        )}
        
        {history.map((msg, index) => (
          <div 
            key={index} 
            className={`flex ${msg.author === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[70%] p-3 rounded-lg ${
                msg.author === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
              }`}
              role="article"
              aria-label={`${msg.author === 'user' ? 'Your message' : 'Assistant message'}`}
            >
              {msg.author === 'user' ? (
                <p className="text-sm leading-relaxed">{msg.content}</p>
              ) : (
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({children}) => <h1 className="text-lg font-bold mt-2 mb-1 text-gray-800">{children}</h1>,
                    h2: ({children}) => <h2 className="text-base font-bold mt-2 mb-1 text-gray-800">{children}</h2>,
                    h3: ({children}) => <h3 className="text-sm font-bold mt-2 mb-1 text-gray-800">{children}</h3>,
                    p: ({children}) => <p className="text-sm leading-relaxed my-1">{children}</p>,
                    ul: ({children}) => <ul className="text-sm my-1 ml-4 list-disc">{children}</ul>,
                    ol: ({children}) => <ol className="text-sm my-1 ml-4 list-decimal">{children}</ol>,
                    li: ({children}) => <li className="my-0">{children}</li>,
                    strong: ({children}) => <strong className="font-semibold text-gray-900">{children}</strong>,
                    em: ({children}) => <em className="italic">{children}</em>,
                    code: ({children}) => <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                    blockquote: ({children}) => <blockquote className="border-l-4 border-blue-500 pl-4 italic">{children}</blockquote>
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg rounded-bl-none">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-gray-50 rounded-b-lg">
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your financial question..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
            aria-label="Type your message"
            maxLength={500}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  );
} 