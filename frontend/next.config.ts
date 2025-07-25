import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // Provide fallback values for build time
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_fallback',
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY || 'sk_test_fallback',
  },
};

export default nextConfig;
