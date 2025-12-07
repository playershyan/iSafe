'use client';

import { Card } from '@/components/ui';
import { format } from 'date-fns';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { User, MapPin, Phone, Share2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLowBandwidth } from '@/lib/contexts/LowBandwidthContext';

export interface MissingPersonReport {
  id: string;
  fullName: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  photoUrl?: string | null;
  lastSeenLocation: string;
  lastSeenDistrict?: string | null;
  lastSeenDate: string | Date;
  clothing?: string | null;
  reporterName: string;
  reporterPhone: string;
  altContact?: string | null;
  status: 'MISSING' | 'FOUND' | 'CLOSED';
  posterCode: string;
  createdAt: string | Date;
}

interface MissingPersonCardProps {
  report: MissingPersonReport;
  locale: string;
}

const statusColors = {
  MISSING: 'bg-red-100 text-red-800 border-red-200',
  FOUND: 'bg-green-100 text-green-800 border-green-200',
  CLOSED: 'bg-gray-100 text-gray-800 border-gray-200',
};

export function MissingPersonCard({ report, locale }: MissingPersonCardProps) {
  const t = useTranslations('missing');
  const { isLowBandwidth } = useLowBandwidth();
  const lastSeenDate = new Date(report.lastSeenDate);
  const createdAt = new Date(report.createdAt);
  const [shareSuccess, setShareSuccess] = useState(false);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'MISSING':
        return t('statusMissing');
      case 'FOUND':
        return t('statusFound');
      case 'CLOSED':
        return t('statusClosed');
      default:
        return status;
    }
  };

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case 'MALE':
        return t('male');
      case 'FEMALE':
        return t('female');
      case 'OTHER':
        return t('other');
      default:
        return gender;
    }
  };

  const handleShare = async () => {
    const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${locale}/missing`;
    const shareText = `${t('title')}: ${report.fullName}\n${t('ageLabel')}: ${report.age} | ${getGenderLabel(report.gender)}\n${t('lastSeen')}: ${report.lastSeenLocation}${report.lastSeenDistrict ? `, ${report.lastSeenDistrict}` : ''}\n${t('contact')}: ${report.reporterPhone}\n\nView more details: ${shareUrl}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${t('title')}: ${report.fullName}`,
          text: shareText,
          url: shareUrl,
        });
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(shareText);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      }
    } catch (error) {
      // User cancelled or error occurred
      if (error instanceof Error && error.name !== 'AbortError') {
        // Try clipboard as fallback
        try {
          await navigator.clipboard.writeText(shareText);
          setShareSuccess(true);
          setTimeout(() => setShareSuccess(false), 2000);
        } catch (clipboardError) {
          console.error('Failed to share:', clipboardError);
        }
      }
    }
  };

  return (
    <Card className={isLowBandwidth ? 'relative' : 'hover:border-primary transition-colors relative'}>
      {/* Top Right: Reported Date and Status Badge - Desktop */}
      <div className="hidden md:flex absolute top-4 right-4 items-center gap-3">
        <p className="text-xs text-gray-500">
          {t('reported')}: {format(createdAt, 'MMM dd, yyyy HH:mm')}
        </p>
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColors[report.status]}`}
        >
          {getStatusLabel(report.status)}
        </span>
      </div>

      {/* Status Badge - Mobile Only */}
      <span
        className={`md:hidden absolute top-4 right-4 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColors[report.status]}`}
      >
        {getStatusLabel(report.status)}
      </span>

      {/* Photo Section - Top Center */}
      <div className="flex justify-center mb-4">
        {report.photoUrl ? (
          <div className="h-32 w-32">
            <OptimizedImage
              src={report.photoUrl}
              alt={`Photo of ${report.fullName}`}
              width={128}
              height={128}
              quality="listing"
              watermark={false}
              className="h-full w-full rounded object-cover"
              onError={() => {
                console.error('Failed to load image:', report.photoUrl);
              }}
            />
          </div>
        ) : (
          <div className="flex h-32 w-32 items-center justify-center rounded bg-gray-200 text-sm text-gray-600">
            {isLowBandwidth ? 'No photo' : <User className="h-16 w-16 text-gray-400" />}
          </div>
        )}
      </div>

      {/* Main Content Section */}
      <div className="space-y-4">
        {/* Name - Large and Prominent */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">{report.fullName}</h3>
          <p className="text-sm text-gray-600 text-center">
            {t('ageLabel')}: {report.age} | {getGenderLabel(report.gender)}
          </p>
        </div>

        {/* Mobile: Reported Date - Below Name */}
        <div className="md:hidden text-center">
          <p className="text-xs text-gray-500">
            {t('reported')}: {format(createdAt, 'MMM dd, yyyy HH:mm')}
          </p>
        </div>

        {/* Last Seen Section */}
        <div className="flex items-start gap-2">
          {!isLowBandwidth && <MapPin className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />}
          <div className="text-sm">
            <p className="font-medium text-gray-900">{isLowBandwidth ? `${t('lastSeen')}: ` : ''}{report.lastSeenLocation}</p>
            {report.lastSeenDistrict && (
              <p className="text-gray-600">{report.lastSeenDistrict}</p>
            )}
            <p className="text-gray-500">
              {format(lastSeenDate, 'MMM dd, yyyy')}
            </p>
          </div>
        </div>

        {/* Contact Number */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          {!isLowBandwidth && <Phone className="h-4 w-4 flex-shrink-0" />}
          <div className="flex-1">
            <span>{isLowBandwidth ? `${t('phone')}: ` : ''}{report.reporterPhone}</span>
            {report.altContact && (
              <span className="ml-2 text-gray-500">
                {isLowBandwidth ? ` / ${report.altContact}` : ` / ${report.altContact}`}
              </span>
            )}
          </div>
        </div>

        {/* Description Section */}
        {report.clothing && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">{t('description')}:</span>
            <p className="mt-1">{report.clothing}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleShare}
            className="flex flex-1 items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            {!isLowBandwidth && <Share2 className="h-5 w-5" />}
            {shareSuccess ? t('copied') : t('share')}
          </button>
          <a
            href={`tel:${report.reporterPhone}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            {!isLowBandwidth && <Phone className="h-5 w-5" />}
            {t('contact')}
          </a>
        </div>
      </div>
    </Card>
  );
}

