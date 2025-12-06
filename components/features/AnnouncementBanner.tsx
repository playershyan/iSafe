'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { useLowBandwidth } from '@/lib/contexts/LowBandwidthContext';

interface AnnouncementBannerProps {
  text: string;
  href?: string;
  variant?: 'info' | 'warning' | 'success' | 'error';
  dismissible?: boolean;
  locale?: string;
}

export function AnnouncementBanner({
  text,
  href,
  variant = 'info',
  dismissible = false,
  locale = 'en',
}: AnnouncementBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { isLowBandwidth } = useLowBandwidth();

  // Fix hydration mismatch by only using low-bandwidth mode after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (isDismissed || !text) {
    return null;
  }

  const variantStyles = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-900',
      hover: isLowBandwidth ? '' : 'hover:bg-blue-100',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-900',
      hover: isLowBandwidth ? '' : 'hover:bg-yellow-100',
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-900',
      hover: isLowBandwidth ? '' : 'hover:bg-green-100',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-900',
      hover: isLowBandwidth ? '' : 'hover:bg-red-100',
    },
  };

  const styles = variantStyles[variant];

  const content = (
    <div
      className={`flex items-center justify-between gap-3 border-b px-4 py-3 ${styles.bg} ${styles.border} ${styles.text} ${styles.hover} ${href ? 'cursor-pointer' : ''}`}
    >
      <p className="flex-1 text-sm font-medium md:text-base">{text}</p>
      {dismissible && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsDismissed(true);
          }}
          className={`flex-shrink-0 ${styles.text} ${isMounted && isLowBandwidth ? '' : 'hover:opacity-70'} focus:outline-none focus:ring-2 focus:ring-offset-2`}
          aria-label="Dismiss announcement"
        >
          {(!isMounted || !isLowBandwidth) && <X className="h-5 w-5" />}
          {isMounted && isLowBandwidth && 'Close'}
        </button>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

