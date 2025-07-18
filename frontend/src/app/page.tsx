'use client';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <SignedIn>
        <RedirectToChat />
      </SignedIn>
      <SignedOut>
        <h2 className="mb-4 text-xl font-semibold">Sign in to continue</h2>
        <SignInButton mode="modal" />
      </SignedOut>
    </div>
  );
}

function RedirectToChat() {
  const router = useRouter();
  useEffect(() => {
    router.push('/chat');
  }, [router]);
  return null;
}
