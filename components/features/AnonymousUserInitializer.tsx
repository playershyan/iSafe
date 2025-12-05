'use client';

import { useEffect } from 'react';
import { getOrCreateAnonymousUserId, setAnonymousUserIdCookieClient } from '@/lib/utils/anonymousUser';

/**
 * Component that initializes anonymous user ID on first visit
 * This ensures every user has an ID even if they haven't created a report yet
 */
export function AnonymousUserInitializer() {
  useEffect(() => {
    // Get or create anonymous user ID
    const userId = getOrCreateAnonymousUserId();
    
    // Sync to cookie so server can access it
    if (userId) {
      setAnonymousUserIdCookieClient(userId);
    }
  }, []);

  return null; // This component doesn't render anything
}

