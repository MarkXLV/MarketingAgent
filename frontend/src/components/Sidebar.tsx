import Link from 'next/link';
import { useUser, useClerk } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import { 
  LogOut, 
  LayoutDashboard,
  MessageSquare, 
  Target, 
  User,
  TrendingUp,
  Award
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const pathname = usePathname();

  const navItems = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: LayoutDashboard,
      description: 'Overview and quick actions'
    },
    { 
      name: 'Chat', 
      href: '/chat', 
      icon: MessageSquare,
      description: 'AI financial coach'
    },
    { 
      name: 'Goals', 
      href: '/goals', 
      icon: Target,
      description: 'Financial objectives',
      comingSoon: true
    },
    { 
      name: 'Progress', 
      href: '/progress', 
      icon: TrendingUp,
      description: 'Track your journey',
      comingSoon: true
    },
    { 
      name: 'Achievements', 
      href: '/achievements', 
      icon: Award,
      description: 'Badges and milestones',
      comingSoon: true
    },
    { 
      name: 'Profile', 
      href: '/profile', 
      icon: User,
      description: 'Account settings',
      comingSoon: true
    }
  ];

  return (
    <nav className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full flex flex-col shadow-sm">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          FinWise
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          AI Financial Coach
        </p>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <li key={item.name}>
                <Link
                  href={item.comingSoon ? '#' : item.href}
                  className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                      : item.comingSoon
                      ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  onClick={(e) => item.comingSoon && e.preventDefault()}
                >
                  <IconComponent className={`mr-3 h-5 w-5 ${
                    isActive 
                      ? 'text-blue-600 dark:text-blue-300' 
                      : item.comingSoon
                      ? 'text-gray-400'
                      : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span>{item.name}</span>
                      {item.comingSoon && (
                        <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                          Soon
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* User Section */}
      {user && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="mb-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Signed in as</p>
            <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">
              {user.fullName || user.emailAddresses[0]?.emailAddress}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user.emailAddresses[0]?.emailAddress}
            </p>
          </div>
          <button
            onClick={() => signOut(() => window.location.href = '/')}
            className="w-full flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      )}
    </nav>
  );
} 