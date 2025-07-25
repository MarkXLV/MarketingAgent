'use client';

// Force dynamic rendering for pages that use Clerk
export const dynamic = 'force-dynamic';
import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useUserStore } from '../../../lib/store';
import Link from 'next/link';
import { 
  MessageSquare, 
  Target, 
  User, 
  TrendingUp, 
  Award, 
  Clock,
  BarChart3,
  BookOpen,
  Shield,
  ArrowRight,
  Plus
} from 'lucide-react';

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const { setUser } = useUserStore();
  const [currentTime, setCurrentTime] = useState(new Date());

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

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
          <p className="text-gray-600">You need to be signed in to access the dashboard.</p>
        </div>
      </div>
    );
  }

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const dashboardCards = [
    {
      title: 'Financial Chat',
      description: 'Chat with your AI financial coach',
      icon: MessageSquare,
      href: '/chat',
      color: 'from-blue-500 to-blue-600',
      stats: 'Available 24/7',
      featured: true
    },
    {
      title: 'Financial Goals',
      description: 'Set and track your financial objectives',
      icon: Target,
      href: '/goals',
      color: 'from-green-500 to-green-600',
      stats: 'Coming Soon',
      featured: false
    },
    {
      title: 'Progress Tracking',
      description: 'Monitor your financial journey',
      icon: TrendingUp,
      href: '/progress',
      color: 'from-purple-500 to-purple-600',
      stats: 'Coming Soon',
      featured: false
    },
    {
      title: 'Achievements',
      description: 'View your earned badges and milestones',
      icon: Award,
      href: '/achievements',
      color: 'from-orange-500 to-orange-600',
      stats: 'Coming Soon',
      featured: false
    },
    {
      title: 'Learning Hub',
      description: 'Educational content and tutorials',
      icon: BookOpen,
      href: '/learninghub',
      color: 'from-indigo-500 to-indigo-600',
      featured: false
    },
    {
      title: 'Profile Settings',
      description: 'Manage your account and preferences',
      icon: User,
      href: '/profile',
      color: 'from-gray-500 to-gray-600',
      stats: 'Customize',
      featured: false
    }
  ];

  const quickStats = [
    { label: 'Chat Sessions', value: '12', change: '+3 this week', color: 'text-blue-600' },
    { label: 'Goals Set', value: '0', change: 'Start your first goal', color: 'text-green-600' },
    { label: 'Badges Earned', value: '0', change: 'Complete activities to earn', color: 'text-orange-600' },
    { label: 'Streak', value: '0 days', change: 'Chat daily to build streak', color: 'text-purple-600' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {getGreeting()}, {user.fullName || user.firstName}! 👋
              </h1>
              <p className="text-gray-600 mt-2">
                Welcome to your financial coaching dashboard
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center text-sm text-gray-500 mb-1">
                <Clock className="w-4 h-4 mr-1" />
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <p className="text-sm text-gray-500">
                {currentTime.toLocaleDateString([], { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">{stat.change}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">Ready to improve your finances?</h2>
              <p className="text-blue-100 mb-4">Start a conversation with your AI coach or set your first financial goal.</p>
              <div className="flex gap-3">
                <Link href="/chat">
                  <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Start Chat
                  </button>
                </Link>
                <button className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-400 transition-colors flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Set Goal
                </button>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Financial Tools</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardCards.map((card, index) => {
              const IconComponent = card.icon;
              
              return (
                <Link key={index} href={card.href}>
                  <div className={`group relative overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${
                    card.featured 
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white' 
                      : 'bg-white border border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          card.featured 
                            ? 'bg-white/20' 
                            : `bg-gradient-to-br ${card.color} bg-white`
                        }`}>
                          <IconComponent className={`w-6 h-6 ${
                            card.featured ? 'text-white' : 'text-white'
                          }`} />
                        </div>
                        <ArrowRight className={`w-5 h-5 group-hover:translate-x-1 transition-transform ${
                          card.featured ? 'text-white/70' : 'text-gray-400'
                        }`} />
                      </div>
                      
                      <h3 className={`text-xl font-semibold mb-2 ${
                        card.featured ? 'text-white' : 'text-gray-900'
                      }`}>
                        {card.title}
                      </h3>
                      
                      <p className={`text-sm mb-4 ${
                        card.featured ? 'text-white/80' : 'text-gray-600'
                      }`}>
                        {card.description}
                      </p>
                      
                      <div className={`inline-flex items-center text-xs px-2 py-1 rounded-full ${
                        card.featured 
                          ? 'bg-white/20 text-white' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {card.stats}
                      </div>
                    </div>
                    
                    {card.featured && (
                      <div className="absolute top-4 right-4">
                        <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                          ACTIVE
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-green-900 mb-2">Your Data is Secure</h3>
              <p className="text-sm text-green-700 mb-3">
                FinWise uses bank-grade encryption to protect your information. We never store sensitive financial data like account numbers or passwords.
              </p>
              <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                Learn more about our privacy policy →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 