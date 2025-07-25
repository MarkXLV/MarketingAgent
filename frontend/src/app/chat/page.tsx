'use client';

// Force dynamic rendering for pages that use Clerk
export const dynamic = 'force-dynamic';
import { useUser } from '@clerk/nextjs';
import ChatWindow from '../../components/ChatWindow';
import ChatHistory from '../../components/ChatHistory';
import { useEffect, useState } from 'react';
import { useUserStore } from '../../../lib/store';

export default function ChatPage() {
  const { user, isLoaded } = useUser();
  const { setUser } = useUserStore();
  const [showHistory, setShowHistory] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      setUser({
        userId: user.id,
        name: user.fullName || user.firstName || 'User',
        email: user.primaryEmailAddress?.emailAddress || '',
        region: 'US',
        language: 'en',
        accessibility: 'none',
        persona: 'Gen Z'
      });
    }
  }, [isLoaded, user, setUser]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Please sign in</h2>
          <p className="text-gray-600">You need to be signed in to access the chat.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-gray-100">
      {/* Chat History Sidebar - only show if showHistory is true */}
      {showHistory && (
        <div className="w-80 flex-shrink-0">
          <ChatHistory 
            userId={user.id} 
            onSelectConversation={(convoId) => {
              // Handle conversation selection if needed
              console.log('Selected conversation:', convoId);
            }}
          />
        </div>
      )}
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header with toggle button */}
        <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title={showHistory ? "Hide History" : "Show History"}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold text-gray-800">FinWise Chat</h1>
          </div>
          <div className="text-sm text-gray-500">
            Welcome, {user.fullName || user.firstName}!
          </div>
        </div>
        
        {/* Chat Window */}
        <div className="flex-1 p-4">
          <div className="h-full max-h-[calc(100vh-8rem)]">
            <ChatWindow />
          </div>
        </div>
      </div>
    </div>
  );
} 