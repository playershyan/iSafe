'use client';

import Link from 'next/link';
import { useLowBandwidth } from '@/lib/contexts/LowBandwidthContext';

interface HeaderDisplayProps {
  locale: string;
  shelterName: string;
  shelterCode: string;
}

export function HeaderDisplay({ locale, shelterName, shelterCode }: HeaderDisplayProps) {
  const { isLowBandwidth } = useLowBandwidth();

  return (
    <div className="mb-6">
      <Link
        href={`/${locale}/staff/dashboard`}
        className="inline-flex items-center rounded text-base text-primary hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        ← Back to Dashboard
      </Link>
      <div className="mt-2 flex items-start gap-2">
        {!isLowBandwidth && <span className="text-lg" aria-hidden="true">🏛️</span>}
        <div>
          <p className="text-sm font-medium text-gray-700">Registration</p>
          <p className="text-xs text-gray-500">{shelterName} ({shelterCode})</p>
        </div>
      </div>
    </div>
  );
}

