'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { getApiBaseUrl } from '../api/base';

export type Message = {
  id: string;
  author: 'user' | 'assistant';
  content: string;
  ts?: number;
};

function MessageBubble({ msg, isUser, user }: { msg: Message; isUser: boolean; user: { firstName?: string; imageUrl?: string } | null }) {
  return (
    <div className={`flex items-end ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-green-300 flex items-center justify-center mr-2">
          🤖
        </div>
      )}
      <div
        className={`max-w-[70%] px-4 py-2 rounded-2xl shadow transition-all
          ${isUser ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'}
        `}
      >
        {msg.content}
        <div className="text-xs text-gray-500 mt-1">
          {isUser ? user?.firstName || 'You' : 'Agent'} • {msg.ts ? new Date(msg.ts).toLocaleTimeString() : ''}
        </div>
      </div>
      {isUser && user?.imageUrl && (
        <div className="w-8 h-8 rounded-full ml-2 bg-gray-300 flex items-center justify-center text-xs">
          {user.firstName?.[0] || 'U'}
        </div>
      )}
    </div>
  );
}

function ChatWindow({ messages, user }: { messages: Message[]; user: { firstName?: string; imageUrl?: string } | null }) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  return (
    <div className="flex-1 bg-white overflow-y-auto p-4 space-y-3">
      {messages.length === 0 && (
        <p className="text-gray-500 text-center">No messages yet. Start a new conversation!</p>
      )}
      {messages.map(msg => (
        <MessageBubble key={msg.id} msg={msg} isUser={msg.author === 'user'} user={user} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

function InputBar({ onSend, onSaveChat, messages }: { onSend: (msg: string) => void; onSaveChat: () => void; messages: Message[] }) {
  const [text, setText] = useState('');
  const send = () => {
    if (!text.trim()) return;
    onSend(text);
    setText('');
  };
  return (
    <footer className="flex items-center border-t border-gray-200 p-4 bg-white">
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && send()}
        className="flex-1 bg-gray-50 border border-gray-300 rounded-full px-4 py-2 mr-3 placeholder-gray-400 text-gray-900 focus:outline-none"
        placeholder="Type a message…"
      />
      <button
        className="bg-green-500 text-white rounded-full px-4 py-2 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-green-500"
        onClick={send}
        disabled={!text.trim()}
        aria-label="Send message"
      >
        Send
      </button>
      <button
        className="bg-blue-500 text-white rounded-full px-4 py-2 ml-2 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={onSaveChat}
        disabled={messages.length === 0}
        aria-label="Save chat"
        type="button"
      >
        Save Chat
      </button>
    </footer>
  );
}

const ChatWidget: React.FC<{ userId: string; onSaveChat: () => void }> = ({ userId, onSaveChat }) => {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (content: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      author: 'user',
      content,
      ts: Date.now(),
    };
    setMessages(ms => [...ms, userMsg]);
    setLoading(true);
    try {
      const history: { user: string; bot?: string }[] = [];
      for (let i = 0; i < messages.length; i++) {
        if (messages[i].author === 'user') {
          if (messages[i + 1] && messages[i + 1].author === 'assistant') {
            history.push({ user: messages[i].content, bot: messages[i + 1].content });
            i++;
          } else {
            history.push({ user: messages[i].content });
          }
        }
      }
      history.push({ user: content });
      const API_BASE = getApiBaseUrl();
      const res = await fetch(API_BASE + '/api/marketing-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_text: content, history, userId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Unknown error');
      }
      const data = await res.json();
      const botMsg: Message = {
        id: Date.now().toString() + '-bot',
        author: 'assistant',
        content: data.bot_reply,
        ts: Date.now(),
      };
      setMessages(ms => [...ms, botMsg]);
    } catch (e: unknown) {
      setMessages(ms => [...ms, {
        id: Date.now().toString() + '-err',
        author: 'assistant',
        content: `⚠️ ${e instanceof Error ? e.message : 'Unknown error'}`,
        ts: Date.now(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <ChatWindow messages={messages} user={user ? { firstName: user.firstName || undefined, imageUrl: user.imageUrl } : null} />
      <InputBar onSend={handleSend} onSaveChat={onSaveChat} messages={messages} />
      {loading && <div className="text-center p-2 text-gray-500">Agent is typing…</div>}
    </div>
  );
};

export default ChatWidget; 