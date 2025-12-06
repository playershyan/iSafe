'use client';

import { useLowBandwidth } from '@/lib/contexts/LowBandwidthContext';

interface HeaderDisplayProps {
  sessionName: string;
  sessionCode: string;
  handleLogout: () => void;
}

export function HeaderDisplay({ sessionName, sessionCode, handleLogout }: HeaderDisplayProps) {
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
        {!isLowBandwidth && <span className="text-lg" aria-hidden="true">🏛️</span>}
        <div>
          <p className="text-sm font-medium text-gray-700">Government Staff Dashboard</p>
          <p className="text-xs text-gray-500">{sessionName} ({sessionCode})</p>
        </div>
      </div>
    </div>
  );
}

