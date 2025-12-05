'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User } from 'lucide-react';
import { getAnonymousUserId } from '@/lib/utils/anonymousUser';
import Link from 'next/link';

interface UserIconButtonProps {
  locale: string;
}

export function UserIconButton({ locale }: UserIconButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [hasReports, setHasReports] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get anonymous user ID from localStorage
    const anonymousUserId = getAnonymousUserId();
    setUserId(anonymousUserId);

    if (!anonymousUserId) {
      setIsLoading(false);
      return;
    }

    // Check if user has any reports
    // Note: The API will read from cookies, but we need to ensure cookie is set
    // For now, we'll make the request and let the server handle cookie reading
    fetch('/api/user/reports', {
      credentials: 'include', // Include cookies
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.reports && data.reports.length > 0) {
          setHasReports(true);
        }
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [pathname]); // Re-check when pathname changes

  // Don't show if loading, no user ID, or no reports
  if (isLoading || !userId || !hasReports) {
    return null;
  }

  return (
    <Link
      href={`/${locale}/user/${userId}`}
      className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      aria-label="My Reports"
    >
      <User className="h-5 w-5" />
    </Link>
  );
}

