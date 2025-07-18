export function getApiBaseUrl() {
  if (typeof window !== 'undefined') {
    if (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1'
    ) {
      return process.env.NEXT_PUBLIC_LOCAL_API || '';
    }
    return process.env.NEXT_PUBLIC_REMOTE_API || '';
  }
  // Fallback for SSR
  return process.env.NEXT_PUBLIC_LOCAL_API || '';
} 