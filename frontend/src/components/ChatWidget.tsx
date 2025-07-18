'use client';

import React, { useRef, useState, useEffect } from 'react';

// Message data structure
export type Message = {
  id: string;
  author: 'user' | 'assistant';
  content: string;
};

// ChatWindow component
function ChatWindow({ messages }: { messages: Message[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
      {messages.map(msg => (
        <div
          key={msg.id}
          className={`flex ${msg.author === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[70%] px-4 py-2 rounded-2xl shadow
              ${msg.author === 'assistant'
                ? 'bg-green-200 text-black'
                : 'bg-blue-600 text-white'}
            `}
          >
            {msg.content}
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

// InputBar component
function InputBar({ onSend }: { onSend: (msg: string) => void }) {
  const [text, setText] = useState('');
  const send = () => {
    if (!text.trim()) return;
    onSend(text);
    setText('');
  };
  return (
    <div className="flex p-4 border-t bg-white">
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && send()}
        className="flex-1 rounded-full border px-4 py-2 mr-2 focus:outline-none"
        placeholder="Type a message…"
      />
      <button
        onClick={send}
        className="bg-green-500 text-white rounded-full px-4 py-2 disabled:opacity-50"
        disabled={!text.trim()}
      >
        Send
      </button>
    </div>
  );
}

// Main ChatWidget
const ChatWidget: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (content: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      author: 'user',
      content,
    };
    setMessages(ms => [...ms, userMsg]);
    setLoading(true);
    try {
      // Build history as an array of { user, bot } turns
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
      history.push({ user: content }); // add the new user message
      const res = await fetch('http://localhost:8000/api/marketing-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_text: content, history }),
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
      };
      setMessages(ms => [...ms, botMsg]);
    } catch (e: any) {
      setMessages(ms => [...ms, {
        id: Date.now().toString() + '-err',
        author: 'assistant',
        content: `⚠️ ${e.message}`,
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <ChatWindow messages={messages} />
      <InputBar onSend={handleSend} />
      {loading && <div className="text-center p-2 text-gray-500">Agent is typing…</div>}
    </div>
  );
};

export default ChatWidget; 