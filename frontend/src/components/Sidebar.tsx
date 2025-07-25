import Link from 'next/link';
import { useUser, useClerk } from '@clerk/nextjs';
import { LogOut } from 'lucide-react';

export default function Sidebar() {
  const { user } = useUser();
  const { signOut } = useClerk();
  
  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: <span>🏠</span> },
    { name: 'Chat', href: '/chat', icon: <span>💬</span> },
    { name: 'Goals', href: '/goals', icon: <span>🎯</span> },
  ];

  return (
    <nav className="w-64 bg-white dark:bg-gray-800 p-5 shadow-lg h-full flex flex-col">
      <h1 className="text-2xl font-bold text-blue-600 mb-10">FinWise</h1>
      
      <ul className="flex-1">
        {navItems.map((item) => (
          <li key={item.name}>
            <Link href={item.href} className="flex items-center p-3 my-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700">
              {item.icon}
              <span className="ml-4 font-semibold">{item.name}</span>
            </Link>
          </li>
        ))}
      </ul>
      
      {user && (
        <div className="border-t pt-4">
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Signed in as</p>
            <p className="font-semibold text-gray-800 dark:text-gray-200">{user.fullName || user.emailAddresses[0]?.emailAddress}</p>
          </div>
          
          <button
            onClick={() => signOut(() => window.location.href = '/')}
            className="w-full flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      )}
    </nav>
  );
} 