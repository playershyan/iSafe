'use client';

import { Card } from '@/components/ui';
import { UnifiedSearchResult } from '@/types';
import { format } from 'date-fns';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MissingPersonModal } from './MissingPersonModal';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { useLowBandwidth } from '@/lib/contexts/LowBandwidthContext';

interface StatusPersonCardProps {
  result: UnifiedSearchResult;
  locale?: string;
}

const statusStyles: Record<
  UnifiedSearchResult['status'],
  { badge: string; label: string; card: string; accent: string }
> = {
  SHELTERED: {
    badge: 'bg-blue-100 text-blue-900',
    label: 'Sheltered',
    card: 'border-blue-300 bg-blue-50',
    accent: 'text-blue-700',
  },
  FOUND_AND_SHELTERED: {
    badge: 'bg-green-100 text-green-900',
    label: 'Found & sheltered',
    card: 'border-green-300 bg-green-50',
    accent: 'text-green-700',
  },
  FOUND: {
    badge: 'bg-emerald-100 text-emerald-900',
    label: 'Found',
    card: 'border-emerald-300 bg-emerald-50',
    accent: 'text-emerald-700',
  },
  MISSING: {
    badge: 'bg-red-100 text-red-900',
    label: 'Missing',
    card: 'border-red-300 bg-red-50',
    accent: 'text-red-700',
  },
};

export function StatusPersonCard({ result, locale = 'en' }: StatusPersonCardProps) {
  const { isLowBandwidth } = useLowBandwidth();
  const { person, missingReport, status } = result;
  const styles = statusStyles[status];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const primary = person || missingReport;
  if (!primary) return null;

  const showShelterInfo =
    (status === 'SHELTERED' || status === 'FOUND_AND_SHELTERED') &&
    person?.shelter;

  const handleClick = () => {
    // Only missing status opens the detailed modal as per spec
    if (status === 'MISSING' && missingReport) {
      setIsModalOpen(true);
    }
  };

  const handleViewOnMissingPage = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Navigate to missing page - the report will be visible there
    router.push(`/${locale}/missing`);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="w-full text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-xl"
      >
        <Card
          padding="small"
          className={`relative flex items-center gap-3 rounded-2xl border-2 ${isLowBandwidth ? 'bg-white border-gray-300' : styles.card} ${isLowBandwidth ? '' : 'shadow-sm'}`}
        >
          {/* Top Right: Reported Date and Time - Only for MISSING status */}
          {status === 'MISSING' && missingReport && (
            <div className="absolute top-2 right-2 text-right">
              <p className="text-[10px] text-gray-500 sm:text-xs">
                Reported: {format(new Date(missingReport.createdAt), 'MMM dd, yyyy HH:mm')}
              </p>
            </div>
          )}

          {/* Thumbnail */}
          <div className="flex-shrink-0">
            {primary.photoUrl ? (
              <OptimizedImage
                src={primary.photoUrl}
                alt={`Photo of ${primary.fullName}`}
                width={80}
                height={80}
                quality="thumbnail"
                watermark={false}
                className="h-16 w-16 rounded-full object-cover sm:h-20 sm:w-20"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-sm text-gray-600 sm:h-20 sm:w-20">
                {isLowBandwidth ? 'No photo' : <span className="text-3xl text-gray-400" aria-hidden="true">👤</span>}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-base font-semibold text-gray-900 sm:text-lg">
                {primary.fullName}
              </h3>
              <span
                className={`inline-flex flex-shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-semibold ${styles.badge}`}
              >
                {styles.label}
              </span>
            </div>

            <p className="text-xs text-gray-700 sm:text-sm">
              Age {primary.age}, {primary.gender}
              {primary.nic && (
                <span className="ml-2 truncate text-gray-600">NIC: {primary.nic}</span>
              )}
            </p>

            {showShelterInfo && person?.shelter && (
              <p className="text-xs text-gray-700 sm:text-sm">
                {!isLowBandwidth && <span className="mr-1" aria-hidden="true">📍</span>}
                <span className="font-medium">{isLowBandwidth ? 'Location: ' : ''}{person.shelter.name}</span>
                <span className="text-gray-600"> — {person.shelter.district}</span>
              </p>
            )}

            {/* Missing report info - only show for MISSING and FOUND statuses, not for SHELTERED or FOUND_AND_SHELTERED */}
            {missingReport && status !== 'SHELTERED' && status !== 'FOUND_AND_SHELTERED' && (
              <>
                <p className="text-[11px] text-gray-600 sm:text-xs">
                  Last seen: {missingReport.lastSeenLocation}
                  {missingReport.lastSeenDistrict && `, ${missingReport.lastSeenDistrict}`}
                </p>
                {missingReport.lastSeenDate && (
                  <p className="text-[11px] text-gray-500 sm:text-xs">
                    Date: {format(new Date(missingReport.lastSeenDate), 'dd MMM yyyy')}
                  </p>
                )}
                {missingReport.clothing && (
                  <p className="text-[11px] text-gray-600 sm:text-xs truncate">
                    Description: {missingReport.clothing}
                  </p>
                )}
                <p className="text-[11px] text-gray-500 sm:text-xs">
                  Contact: {missingReport.reporterPhone}
                </p>
              </>
            )}

            {person?.createdAt && (
              <p className="text-[11px] text-gray-500 sm:text-xs">
                Registered:{' '}
                {format(new Date(person.createdAt), 'dd MMM yyyy, p')}
              </p>
            )}

            {/* View Report Button - Bottom for MISSING status */}
            {status === 'MISSING' && missingReport && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <button
                  onClick={handleViewOnMissingPage}
                  className="w-full inline-flex items-center justify-center rounded bg-primary px-3 py-2 text-xs font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  View Report
                </button>
              </div>
            )}
          </div>

          {/* Call link for sheltered results (desktop; on mobile, tap opens details if missing) */}
          {showShelterInfo && person?.shelter?.contactNumber && (
            <div className="hidden flex-shrink-0 sm:block">
              <a
                href={`tel:${person.shelter.contactNumber}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center justify-center rounded bg-primary px-3 py-1.5 text-sm font-bold text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                {!isLowBandwidth && '📞 '}Call shelter
              </a>
            </div>
          )}
        </Card>
      </button>

      {missingReport && (
        <MissingPersonModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          result={result}
        />
      )}
    </>
  );
}


