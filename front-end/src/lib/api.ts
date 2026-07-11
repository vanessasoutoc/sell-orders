const serverApiUrl = process.env.API_URL ?? 'http://api:3000';
const clientApiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export function getApiBaseUrl() {
  return typeof window === 'undefined' ? serverApiUrl : clientApiUrl;
}