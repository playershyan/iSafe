/**
 * Translation utility helpers for i18n
 *
 * Usage:
 * - For server components: use getTranslations() from 'next-intl/server'
 * - For client components: use useTranslations() from 'next-intl'
 */

// Available translation namespaces from messages/*.json
export const namespaces = [
  'common',
  'nav',
  'home',
  'search',
  'missing',
  'poster',
  'auth',
  'register',
  'health',
  'errors',
] as const;

export type Namespace = (typeof namespaces)[number];

/**
 * Helper to get the correct namespace for a component
 * This helps maintain consistency across the app
 */
export const getNamespace = (component: string): Namespace => {
  const namespaceMap: Record<string, Namespace> = {
    // Layout
    header: 'nav',
    footer: 'common',

    // Pages
    home: 'home',
    search: 'search',
    missing: 'missing',
    poster: 'poster',
    register: 'register',
    auth: 'auth',

    // Forms
    shelterauth: 'auth',
    shelterregistration: 'register',
    missingperson: 'missing',

    // Common
    default: 'common',
  };

  const key = component.toLowerCase();
  return namespaceMap[key] || 'common';
};
