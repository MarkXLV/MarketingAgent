'use client';
import { SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <SignedIn>
        <RedirectToChat />
      </SignedIn>
      <SignedOut>
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-center text-blue-600 mb-2">FinWise</h1>
            <p className="text-center text-gray-600 mb-8">Your AI-Powered Financial Coach</p>
            
            <div className="space-y-4">
              <Link href="/sign-in" className="block w-full">
                <button className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                  Sign In
                </button>
              </Link>
              
              <Link href="/sign-up" className="block w-full">
                <button className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold">
                  Create Account
                </button>
              </Link>
            </div>
            
            <div className="mt-8 text-center text-sm text-gray-500">
              <p>🤖 AI-powered financial guidance</p>
              <p>🌐 Multi-language support</p>
              <p>🎯 Personalized goal tracking</p>
              <p>🏆 Gamified learning experience</p>
            </div>
          </div>
        </div>
      </SignedOut>
    </div>
  );
}

function RedirectToChat() {
  const router = useRouter();
  useEffect(() => {
    router.push('/chat');
  }, [router]);
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg text-gray-600">Redirecting to chat...</p>
    </div>
  );
}
