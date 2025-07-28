'use client';

import { SignedIn, SignedOut } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { 
  MessageSquare, 
  TrendingUp, 
  Shield, 
  Globe, 
  Award, 
  Users, 
  Brain,
  ArrowRight,
  CheckCircle,
  Star
} from 'lucide-react';

function RedirectToDashboard() {
  const router = useRouter();
  useEffect(() => {
    router.push('/dashboard');
  }, [router]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <SignedIn>
        <RedirectToDashboard />
      </SignedIn>
      
      <SignedOut>
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
            <div className="text-center">
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8">
                Meet{' '}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  FinWise
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-4 max-w-3xl mx-auto">
                Your AI-Powered Financial Coach
              </p>
              <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
                Get personalized financial guidance, build better habits, and achieve your money goals with our intelligent coaching system designed for every background and accessibility need.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <Link href="/sign-up" className="group">
                  <button className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                    Get Started Free
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <Link href="/sign-in" className="group">
                  <button className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-700 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-lg font-semibold">
                    Sign In
                    <MessageSquare className="w-5 h-5" />
                  </button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>Bank-Grade Security</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>Trusted by Thousands</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-purple-500" />
                  <span>Global Accessibility</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Why Choose FinWise?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Advanced AI technology meets personalized financial coaching to help you make smarter money decisions
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Brain,
                  title: "AI-Powered Insights",
                  description: "Get personalized financial advice powered by advanced AI that learns your preferences and goals",
                  color: "text-blue-600"
                },
                {
                  icon: Users,
                  title: "Inclusive Design",
                  description: "Built for Gen Z, Millennials, Gen X, and all demographics with cultural sensitivity and accessibility",
                  color: "text-green-600"
                },
                {
                  icon: Globe,
                  title: "Multi-Language Support",
                  description: "Available in multiple languages with region-specific financial guidance and cultural adaptation",
                  color: "text-purple-600"
                },
                {
                  icon: Award,
                  title: "Gamified Learning",
                  description: "Earn badges, track progress, and build lasting financial habits through engaging challenges",
                  color: "text-orange-600"
                },
                {
                  icon: Shield,
                  title: "Privacy First",
                  description: "Your data is protected with bank-grade security. We never store sensitive financial information",
                  color: "text-red-600"
                },
                {
                  icon: TrendingUp,
                  title: "Goal Tracking",
                  description: "Set, monitor, and achieve your financial goals with intelligent progress tracking and motivation",
                  color: "text-indigo-600"
                }
              ].map((feature, index) => (
                <div key={index} className="group p-6 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                  <div className={`w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Trusted by Financial Learners Worldwide
              </h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  quote: "FinWise helped me understand budgeting in a way that actually makes sense. The AI explains everything clearly and doesn't judge my questions.",
                  author: "Sarah, 24",
                  persona: "Gen Z Student"
                },
                {
                  quote: "As someone planning for retirement, I appreciate how FinWise adapts to my age and situation. The advice feels relevant and trustworthy.",
                  author: "Michael, 58",
                  persona: "Pre-retiree"
                },
                {
                  quote: "The multilingual support and cultural sensitivity made all the difference. Finally, a financial coach that understands my background.",
                  author: "Maria, 32",
                  persona: "Working Professional"
                }
              ].map((testimonial, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">&ldquo;{testimonial.quote}&rdquo;</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.author}</p>
                    <p className="text-sm text-gray-500">{testimonial.persona}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Financial Future?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of users who are already building better financial habits with FinWise. Start your journey today - it&apos;s completely free.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sign-up">
                <button className="px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-100 transition-colors text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                  Start Your Free Journey
                </button>
              </Link>
              <Link href="/sign-in">
                <button className="px-8 py-4 bg-transparent text-white border-2 border-white rounded-xl hover:bg-white hover:text-blue-600 transition-colors text-lg font-semibold">
                  I Already Have an Account
                </button>
              </Link>
            </div>

            <div className="mt-12 grid sm:grid-cols-3 gap-8 text-center">
              {[
                { label: "Always Free", sublabel: "No hidden costs" },
                { label: "Available 24/7", sublabel: "Chat anytime" },
                { label: "Secure & Private", sublabel: "Your data protected" }
              ].map((item, index) => (
                <div key={index} className="text-white">
                  <div className="flex items-center justify-center mb-2">
                    <CheckCircle className="w-5 h-5 text-green-300 mr-2" />
                    <span className="font-semibold">{item.label}</span>
                  </div>
                  <p className="text-blue-100 text-sm">{item.sublabel}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">FinWise</h3>
              <p className="text-gray-400 mb-8">
                AI-Powered Financial Coaching for Everyone
              </p>
              <div className="flex justify-center space-x-8 text-sm text-gray-400">
                <span>© 2024 Deutsche Bank. All rights reserved.</span>
                <span>Built with ❤️ for financial inclusion</span>
              </div>
            </div>
          </div>
        </footer>
      </SignedOut>
    </div>
  );
}
