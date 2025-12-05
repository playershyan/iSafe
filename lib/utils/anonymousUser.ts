/**
 * Anonymous User Management
 * 
 * Generates and manages anonymous user IDs using localStorage and cookies
 * for tracking users without requiring account creation.
 */

const ANONYMOUS_USER_KEY = 'isafe_anonymous_user_id';
const COOKIE_NAME = 'isafe_anonymous_user_id';

/**
 * Generate a unique anonymous user ID (UUID v4)
 */
function generateAnonymousUserId(): string {
  // Generate UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get or create anonymous user ID from localStorage
 * This runs on the client side
 */
export function getOrCreateAnonymousUserId(): string {
  if (typeof window === 'undefined') {
    // Server-side: return empty string, will be handled by cookie
    return '';
  }

  // Try to get from localStorage first
  let userId = localStorage.getItem(ANONYMOUS_USER_KEY);

  if (!userId) {
    // Generate new ID
    userId = generateAnonymousUserId();
    localStorage.setItem(ANONYMOUS_USER_KEY, userId);
  }

  // Also set in cookie as backup (handled by API)
  return userId;
}

/**
 * Get anonymous user ID from localStorage (client-side only)
 */
export function getAnonymousUserId(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem(ANONYMOUS_USER_KEY);
}

/**
 * Get anonymous user ID from request cookies (server-side)
 */
export function getAnonymousUserIdFromCookies(cookies: any): string | null {
  const cookieValue = cookies.get(COOKIE_NAME)?.value;
  return cookieValue || null;
}

/**
 * Set anonymous user ID in cookies (server-side)
 */
export function setAnonymousUserIdCookie(cookies: any, userId: string): void {
  cookies.set(COOKIE_NAME, userId, {
    httpOnly: false, // Allow client-side access
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
  });
}

/**
 * Set anonymous user ID in cookies (client-side)
 */
export function setAnonymousUserIdCookieClient(userId: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  // Set cookie with 1 year expiration
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  
  document.cookie = `${COOKIE_NAME}=${userId}; expires=${expires.toUTCString()}; path=/; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
}

