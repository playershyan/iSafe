'use client';

import { useTranslations } from 'next-intl';
import { useLowBandwidth } from '@/lib/contexts/LowBandwidthContext';

interface StatsSectionProps {
  stats: {
    totalMissing: number;
    totalMatches: number;
    totalPersons: number;
  };
}

export function StatsSection({ stats }: StatsSectionProps) {
  const t = useTranslations('home');
  const { isLowBandwidth } = useLowBandwidth();

  if (isLowBandwidth) {
    return (
      <div className="mt-12">
        <div className="mx-auto rounded-lg border border-gray-300 bg-white p-8 md:max-w-3xl md:p-12">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-900 md:text-3xl">
            {t('liveStats')}
          </h2>
          <div className="grid grid-cols-3 gap-4 text-center md:gap-8">
            <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-4 md:p-8 min-h-[120px] overflow-hidden">
              <div className="text-2xl font-bold text-blue-600 md:text-4xl lg:text-5xl">
                {stats.totalMissing.toLocaleString()}
              </div>
              <div className="mt-2 text-[10px] font-medium text-gray-700 md:text-base px-1 break-words hyphens-auto text-center w-full">
                {t('missing')}
              </div>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-4 md:p-8 min-h-[120px] overflow-hidden">
              <div className="text-2xl font-bold text-green-600 md:text-4xl lg:text-5xl">
                {stats.totalMatches.toLocaleString()}
              </div>
              <div className="mt-2 text-[10px] font-medium text-gray-700 md:text-base px-1 break-words hyphens-auto text-center w-full">
                {t('found')}
              </div>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-4 md:p-8 min-h-[120px] overflow-hidden">
              <div className="text-2xl font-bold text-purple-600 md:text-4xl lg:text-5xl">
                {stats.totalPersons.toLocaleString()}
              </div>
              <div className="mt-2 text-[10px] font-medium text-gray-700 md:text-base px-1 break-words hyphens-auto text-center w-full">
                {t('sheltered')}
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
          {t('liveStats')}
        </h2>
        <div className="grid grid-cols-3 gap-4 text-center md:gap-8">
          <div className="flex flex-col items-center justify-center rounded-xl bg-white p-4 shadow-md transition-transform hover:scale-105 md:p-8 min-h-[120px] overflow-hidden">
            <div className="text-2xl font-bold text-blue-600 md:text-4xl lg:text-5xl">
              {stats.totalMissing.toLocaleString()}
            </div>
            <div className="mt-2 text-[10px] font-medium text-gray-700 md:text-base px-1 break-words hyphens-auto text-center w-full">
              {t('missing')}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center rounded-xl bg-white p-4 shadow-md transition-transform hover:scale-105 md:p-8 min-h-[120px] overflow-hidden">
            <div className="text-2xl font-bold text-green-600 md:text-4xl lg:text-5xl">
              {stats.totalMatches.toLocaleString()}
            </div>
            <div className="mt-2 text-[10px] font-medium text-gray-700 md:text-base px-1 break-words hyphens-auto text-center w-full">
              {t('found')}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center rounded-xl bg-white p-4 shadow-md transition-transform hover:scale-105 md:p-8 min-h-[120px] overflow-hidden">
            <div className="text-2xl font-bold text-purple-600 md:text-4xl lg:text-5xl">
              {stats.totalPersons.toLocaleString()}
            </div>
            <div className="mt-2 text-[10px] font-medium text-gray-700 md:text-base px-1 break-words hyphens-auto text-center w-full">
              {t('sheltered')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

