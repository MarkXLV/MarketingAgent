'use client';
import { useState } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { LogOut } from 'lucide-react';
import ChatWidget from '../../components/ChatWidget';
import { HistoryPanel } from '../../components/HistoryPanel';
import { ChatHistoryView } from '../../components/ChatHistoryView';

export default function ChatPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const userId = user?.id;
  const [viewingConvo, setViewingConvo] = useState<string | null>(null);
  const [historyKey, setHistoryKey] = useState(0); // for SWR refresh
  const [showSaved, setShowSaved] = useState(false);

  const handleSaveChat = () => {
    setHistoryKey(k => k + 1);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  if (!isLoaded || !userId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen relative">
      {/* Custom Logout button in top right */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => signOut(() => window.location.href = '/')}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md shadow hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
      <HistoryPanel key={historyKey} userId={userId} onSelect={setViewingConvo} selectedConvo={viewingConvo} />
      <div className="flex-1 flex flex-col">
        {viewingConvo ? (
          <>
            <button
              onClick={() => setViewingConvo(null)}
              className="p-2 text-sm text-blue-600"
            >
              ← Back to live chat
            </button>
            <ChatHistoryView convoId={viewingConvo} userId={userId} />
          </>
        ) : (
          <>
            {showSaved && (
              <div className="self-end m-4 px-4 py-2 bg-green-100 text-green-800 rounded shadow animate-fade-in">
                Chat saved!
              </div>
            )}
            <ChatWidget userId={userId} onSaveChat={handleSaveChat} />
          </>
        )}
      </div>
    </div>
  );
} 