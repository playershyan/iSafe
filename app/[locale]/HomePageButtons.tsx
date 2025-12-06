'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLowBandwidth } from '@/lib/contexts/LowBandwidthContext';

interface HomePageButtonsProps {
  locale: string;
  reportButtonText: string;
  registerButtonText: string;
}

export function HomePageButtons({ locale, reportButtonText, registerButtonText }: HomePageButtonsProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { isLowBandwidth } = useLowBandwidth();

  // Fix hydration mismatch by only using low-bandwidth mode after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Only apply low-bandwidth changes after component has mounted
  const shouldUseLowBandwidth = isMounted && isLowBandwidth;

  const reportButtonClass = shouldUseLowBandwidth
    ? "group flex h-20 w-full items-center justify-center gap-3 rounded-lg border-2 border-primary bg-white text-lg font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 md:h-[120px] md:text-xl"
    : "group flex h-20 w-full items-center justify-center gap-3 rounded-lg border-2 border-primary bg-white text-lg font-bold text-primary transition-colors hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 md:h-[120px] md:text-xl";

  const registerButtonClass = shouldUseLowBandwidth
    ? "inline-flex items-center justify-center rounded-md border-2 border-primary bg-primary px-6 py-3 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 md:px-8 md:py-3.5 md:text-lg"
    : "inline-flex items-center justify-center rounded-md border-2 border-primary bg-primary px-6 py-3 text-base font-medium text-white transition-colors hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 md:px-8 md:py-3.5 md:text-lg";

  return (
    <>
      {/* Primary Action Card */}
      <div className="mb-6 flex flex-col gap-4 md:mx-auto md:mb-12 md:max-w-md">
        <Link
          href={`/${locale}/missing/report`}
          className={reportButtonClass}
        >
          {!shouldUseLowBandwidth && <span className="text-2xl md:text-[32px]" aria-hidden="true">+</span>}
          <span>{reportButtonText}</span>
        </Link>
      </div>

      {/* Divider */}
      {!shouldUseLowBandwidth && <div className="my-8 border-t border-gray-200 md:mx-auto md:my-12 md:max-w-3xl" />}

      {/* Gov Staff Login */}
      <div className="mb-6 text-center md:mb-8">
        <Link
          href={`/${locale}/staff`}
          className={registerButtonClass}
        >
          {registerButtonText}
        </Link>
      </div>
    </>
  );
}

