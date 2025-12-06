'use client';

import { useLowBandwidth } from '@/lib/contexts/LowBandwidthContext';

interface StatsSectionProps {
  stats: {
    totalMissing: number;
    totalMatches: number;
    totalPersons: number;
  };
}

export function StatsSection({ stats }: StatsSectionProps) {
  const { isLowBandwidth } = useLowBandwidth();

  if (isLowBandwidth) {
    return (
      <div className="mt-12">
        <div className="mx-auto rounded-lg border border-gray-300 bg-white p-8 md:max-w-3xl md:p-12">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-900 md:text-3xl">
            Live Stats
          </h2>
          <div className="grid grid-cols-3 gap-6 text-center md:gap-8">
            <div className="rounded-lg border border-gray-200 bg-white p-6 md:p-8">
              <div className="text-3xl font-bold text-blue-600 md:text-4xl lg:text-5xl">
                {stats.totalMissing.toLocaleString()}
              </div>
              <div className="mt-3 text-sm font-medium text-gray-700 md:text-base">
                Missing
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6 md:p-8">
              <div className="text-3xl font-bold text-green-600 md:text-4xl lg:text-5xl">
                {stats.totalMatches.toLocaleString()}
              </div>
              <div className="mt-3 text-sm font-medium text-gray-700 md:text-base">
                Found
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6 md:p-8">
              <div className="text-3xl font-bold text-purple-600 md:text-4xl lg:text-5xl">
                {stats.totalPersons.toLocaleString()}
              </div>
              <div className="mt-3 text-sm font-medium text-gray-700 md:text-base">
                Sheltered
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <div className="mx-auto rounded-2xl bg-gradient-to-br from-blue-50 via-white to-blue-50 p-8 shadow-lg ring-1 ring-blue-100 md:max-w-3xl md:p-12">
        <h2 className="mb-8 flex items-center justify-center gap-2 text-center text-2xl font-bold text-gray-900 md:text-3xl">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-red-600"></span>
          </span>
          Live Stats
        </h2>
        <div className="grid grid-cols-3 gap-6 text-center md:gap-8">
          <div className="rounded-xl bg-white p-6 shadow-md transition-transform hover:scale-105 md:p-8">
            <div className="text-3xl font-bold text-blue-600 md:text-4xl lg:text-5xl">
              {stats.totalMissing.toLocaleString()}
            </div>
            <div className="mt-3 text-sm font-medium text-gray-700 md:text-base">
              Missing
            </div>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-md transition-transform hover:scale-105 md:p-8">
            <div className="text-3xl font-bold text-green-600 md:text-4xl lg:text-5xl">
              {stats.totalMatches.toLocaleString()}
            </div>
            <div className="mt-3 text-sm font-medium text-gray-700 md:text-base">
              Found
            </div>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-md transition-transform hover:scale-105 md:p-8">
            <div className="text-3xl font-bold text-purple-600 md:text-4xl lg:text-5xl">
              {stats.totalPersons.toLocaleString()}
            </div>
            <div className="mt-3 text-sm font-medium text-gray-700 md:text-base">
              Sheltered
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

