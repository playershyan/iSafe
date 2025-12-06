'use client';

import { useLowBandwidth } from '@/lib/contexts/LowBandwidthContext';

interface HeaderDisplayProps {
  shelterName: string;
  handleLogout: () => void;
}

export function HeaderDisplay({ shelterName, handleLogout }: HeaderDisplayProps) {
  const { isLowBandwidth } = useLowBandwidth();

  return (
    <div className="mb-6">
      <form action={handleLogout}>
        <button
          type="submit"
          className="inline-flex items-center rounded text-base text-primary hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          ← Logout
        </button>
      </form>
      <div className="mt-2 flex items-start gap-2">
        {!isLowBandwidth && <span className="text-lg" aria-hidden="true">📍</span>}
        <div>
          <p className="text-sm font-medium text-gray-700">{shelterName}</p>
        </div>
      </div>
    </div>
  );
}

