'use client';

import { Card } from '@/components/ui';
import { format } from 'date-fns';
import { User, MapPin, Phone, Calendar, FileText, Share2 } from 'lucide-react';
import { MissingPersonReport } from './MissingPersonCard';
import { useState } from 'react';
import { useLowBandwidth } from '@/lib/contexts/LowBandwidthContext';

interface MissingPersonCardNoPhotoProps {
  report: MissingPersonReport;
  locale: string;
}

const statusColors = {
  MISSING: 'bg-red-100 text-red-800 border-red-200',
  FOUND: 'bg-green-100 text-green-800 border-green-200',
  CLOSED: 'bg-gray-100 text-gray-800 border-gray-200',
};

export function MissingPersonCardNoPhoto({ report, locale }: MissingPersonCardNoPhotoProps) {
  const { isLowBandwidth } = useLowBandwidth();
  const lastSeenDate = new Date(report.lastSeenDate);
  const createdAt = new Date(report.createdAt);
  const [shareSuccess, setShareSuccess] = useState(false);

  const handleShare = async () => {
    const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${locale}/missing`;
    const shareText = `Missing Person: ${report.fullName}\nAge: ${report.age} | ${report.gender}\nLast seen: ${report.lastSeenLocation}${report.lastSeenDistrict ? `, ${report.lastSeenDistrict}` : ''}\nContact: ${report.reporterPhone}\n\nView more details: ${shareUrl}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Missing Person: ${report.fullName}`,
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
          Reported: {format(createdAt, 'MMM dd, yyyy HH:mm')}
        </p>
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColors[report.status]}`}
        >
          {report.status}
        </span>
      </div>

      {/* Status Badge - Mobile Only */}
      <span
        className={`md:hidden absolute top-4 right-4 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColors[report.status]}`}
      >
        {report.status}
      </span>

      {/* Icon Header - Prominent */}
      {!isLowBandwidth && (
        <div className="flex justify-center mb-6 pt-4">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 border-4 border-primary/20">
            <User className="h-12 w-12 text-primary" />
          </div>
        </div>
      )}

      {/* Main Content Section */}
      <div className="space-y-4">
        {/* Name - Large and Prominent */}
        <div className="text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-2">{report.fullName}</h3>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              {!isLowBandwidth && <User className="h-4 w-4" />}
              Age: {report.age} | {report.gender}
            </span>
          </div>
        </div>

        {/* Mobile: Reported Date - Below Name */}
        <div className="md:hidden text-center">
          <p className="text-xs text-gray-500">
            Reported: {format(createdAt, 'MMM dd, yyyy HH:mm')}
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-4"></div>

        {/* Last Seen Section - Prominent */}
        <div className={isLowBandwidth ? "border border-gray-200 rounded-lg p-4" : "bg-gray-50 rounded-lg p-4"}>
          <div className="flex items-start gap-3">
            {!isLowBandwidth && <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />}
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-700 mb-1">{isLowBandwidth ? 'Last Seen Location: ' : 'Last Seen Location'}</p>
              <p className="text-base font-medium text-gray-900 mb-1">{report.lastSeenLocation}</p>
              {report.lastSeenDistrict && (
                <p className="text-sm text-gray-600 mb-2">{report.lastSeenDistrict}</p>
              )}
              <div className="flex items-center gap-1 text-sm text-gray-500">
                {!isLowBandwidth && <Calendar className="h-3 w-3" />}
                <span>{format(lastSeenDate, 'MMM dd, yyyy')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description Section - More Prominent */}
        {report.clothing && (
          <div className={isLowBandwidth ? "border border-gray-200 rounded-lg p-4" : "bg-blue-50 rounded-lg p-4"}>
            <div className="flex items-start gap-3">
              {!isLowBandwidth && <FileText className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />}
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-900 mb-1">Physical Description</p>
                <p className="text-sm text-blue-800">{report.clothing}</p>
              </div>
            </div>
          </div>
        )}

        {/* Contact Section - Prominent */}
        <div className={isLowBandwidth ? "border border-gray-200 rounded-lg p-4" : "bg-green-50 rounded-lg p-4"}>
          <div className="flex items-center gap-3">
            {!isLowBandwidth && <Phone className="h-5 w-5 text-green-600 flex-shrink-0" />}
            <div>
              <p className="text-sm font-semibold text-green-900 mb-1">{isLowBandwidth ? 'Contact Information: ' : 'Contact Information'}</p>
              <p className="text-base font-medium text-green-800">{report.reporterPhone}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleShare}
            className="flex flex-1 items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            {!isLowBandwidth && <Share2 className="h-5 w-5" />}
            {shareSuccess ? 'Copied!' : 'Share'}
          </button>
          <a
            href={`tel:${report.reporterPhone}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            {!isLowBandwidth && <Phone className="h-5 w-5" />}
            Contact
          </a>
        </div>
      </div>
    </Card>
  );
}

