import { getApiBaseUrl } from './base';

export async function fetcher(path: string, options?: RequestInit) {
  const BASE = getApiBaseUrl();
  const res = await fetch(`${BASE}${path}`, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error ${res.status}: ${text}`);
  }
  return res.json();
} 