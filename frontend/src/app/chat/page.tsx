'use client';

import { useUser } from '@clerk/nextjs';
import ChatWindow from '../../components/ChatWindow';
import { useEffect } from 'react';
import { useUserStore } from '../../../lib/store';

export default function ChatPage() {
  const { user, isLoaded } = useUser();
  const { setUser } = useUserStore();

  useEffect(() => {
    if (isLoaded && user) {
      // Set user data in the store when loaded
      setUser({
        userId: user.id,
        name: user.fullName || user.firstName || 'User',
        email: user.primaryEmailAddress?.emailAddress || '',
        // These could be set via user profile or preferences
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
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-gray-600">Please sign in to continue.</div>
      </div>
    );
  }

  return (
    <div className="h-full max-h-[calc(100vh-4rem)]">
      <ChatWindow />
    </div>
  );
} 