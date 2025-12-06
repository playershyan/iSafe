'use client';

import { useLowBandwidth } from '@/lib/contexts/LowBandwidthContext';

interface StatsDisplayProps {
  centerPersonsCount: number;
  totalPersonsCount: number;
}

export function StatsDisplay({ centerPersonsCount, totalPersonsCount }: StatsDisplayProps) {
  const { isLowBandwidth } = useLowBandwidth();

  if (isLowBandwidth) {
    return (
      <div className="mb-6 flex flex-wrap items-center gap-6 md:gap-8">
        <div className="flex items-center gap-2">
          <div>
            <p className="text-2xl font-bold text-gray-900">{centerPersonsCount.toLocaleString()}</p>
            <p className="text-sm text-gray-600">People admitted in this center</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div>
            <p className="text-2xl font-bold text-gray-900">{totalPersonsCount.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Total people in all centers</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 flex flex-wrap items-center gap-6 md:gap-8">
      <div className="flex items-center gap-2">
        <span className="text-2xl" aria-hidden="true">📊</span>
        <div>
          <p className="text-2xl font-bold text-gray-900">{centerPersonsCount.toLocaleString()}</p>
          <p className="text-sm text-gray-600">People admitted in this center</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-2xl" aria-hidden="true">🌐</span>
        <div>
          <p className="text-2xl font-bold text-gray-900">{totalPersonsCount.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Total people in all centers</p>
        </div>
      </div>
    </div>
  );
}

