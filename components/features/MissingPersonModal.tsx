'use client';

import { UnifiedSearchResult } from '@/types';
import { Button, Card } from '@/components/ui';
import { format } from 'date-fns';
import { formatPhoneNumber } from '@/lib/utils/helpers';
import OptimizedImage from '@/components/ui/OptimizedImage';

interface MissingPersonModalProps {
  open: boolean;
  onClose: () => void;
  result: UnifiedSearchResult;
}

export function MissingPersonModal({ open, onClose, result }: MissingPersonModalProps) {
  const missing = result.missingReport;
  if (!open || !missing) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-4 pt-10 sm:items-center"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby="missing-person-title"
    >
      <div className="w-full max-w-md animate-slide-up sm:animate-fade-in">
        <Card padding="large" className="max-h-[80vh] overflow-y-auto rounded-2xl shadow-xl">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2
                id="missing-person-title"
                className="text-lg font-bold text-gray-900 sm:text-xl"
              >
                Missing person details
              </h2>
              <p className="text-sm text-gray-600">
                From public missing person report
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Header: photo and basic info */}
          <div className="mb-4 flex gap-3">
            <div className="flex-shrink-0">
              {missing.photoUrl ? (
                <OptimizedImage
                  src={missing.photoUrl}
                  alt={`Photo of ${missing.fullName}`}
                  width={96}
                  height={96}
                  quality="listing"
                  watermark={false}
                  className="h-20 w-20 rounded-lg object-cover sm:h-24 sm:w-24"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-gray-200 sm:h-24 sm:w-24">
                  <span className="text-4xl text-gray-400" aria-hidden="true">
                    👤
                  </span>
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-base font-semibold text-gray-900 sm:text-lg">
                {missing.fullName}
              </h3>
              <p className="text-sm text-gray-700">
                Age {missing.age}, {missing.gender}
              </p>
              {missing.nic && (
                <p className="text-sm text-gray-600">NIC: {missing.nic}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Reported:{' '}
                {format(new Date(missing.createdAt), 'dd MMM yyyy, p')}
              </p>
            </div>
          </div>

          {/* Last seen details */}
          <div className="mb-4 space-y-1 text-sm text-gray-800">
            <h4 className="text-sm font-semibold text-gray-900">
              Last seen details
            </h4>
            <p>
              <span className="font-medium">Location:</span>{' '}
              {missing.lastSeenLocation}, {missing.lastSeenDistrict}
            </p>
            {missing.lastSeenDate && (
              <p>
                <span className="font-medium">Date:</span>{' '}
                {format(new Date(missing.lastSeenDate), 'dd MMM yyyy')}
              </p>
            )}
            {missing.clothing && (
              <p>
                <span className="font-medium">Clothing:</span> {missing.clothing}
              </p>
            )}
          </div>

          {/* Reporter details */}
          <div className="mb-4 space-y-1 text-sm text-gray-800">
            <h4 className="text-sm font-semibold text-gray-900">
              Reporter contact
            </h4>
            <p>
              <span className="font-medium">Name:</span> {missing.reporterName}
            </p>
            <p>
              <span className="font-medium">Phone:</span>{' '}
              <a
                href={`tel:${missing.reporterPhone}`}
                className="text-primary underline underline-offset-2"
              >
                {formatPhoneNumber(missing.reporterPhone)}
              </a>
            </p>
            {missing.altContact && (
              <p>
                <span className="font-medium">Alt. contact:</span>{' '}
                {formatPhoneNumber(missing.altContact)}
              </p>
            )}
          </div>

          {/* Footer actions */}
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              fullWidth
              onClick={onClose}
              variant="secondary"
            >
              Close
            </Button>
            {missing.reporterPhone && (
              <a
                href={`tel:${missing.reporterPhone}`}
                className="inline-flex w-full items-center justify-center rounded bg-primary px-4 py-2 text-base font-bold text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                📞 Call reporter
              </a>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}


