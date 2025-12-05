'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui';
import { format } from 'date-fns';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { User, MapPin, Phone, Edit, Trash2, CheckCircle } from 'lucide-react';
import { MissingPersonReport } from './MissingPersonCard';
import { Button, Alert } from '@/components/ui';
import { EditReportModal } from './EditReportModal';

interface UserReportCardProps {
  report: MissingPersonReport;
  locale: string;
}

const statusColors = {
  MISSING: 'bg-red-100 text-red-800 border-red-200',
  FOUND: 'bg-green-100 text-green-800 border-green-200',
  CLOSED: 'bg-gray-100 text-gray-800 border-gray-200',
};

export function UserReportCard({ report, locale }: UserReportCardProps) {
  const router = useRouter();
  const lastSeenDate = new Date(report.lastSeenDate);
  const createdAt = new Date(report.createdAt);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMarkingFound, setIsMarkingFound] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/user/reports/${report.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete report');
      }

      setSuccess(true);
      setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch (error) {
      console.error('Delete error:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete report');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMarkAsFound = async () => {
    setIsMarkingFound(true);
    setError(null);

    try {
      const response = await fetch(`/api/user/reports/${report.id}/found`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to mark report as found');
      }

      setSuccess(true);
      setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch (error) {
      console.error('Mark as found error:', error);
      setError(error instanceof Error ? error.message : 'Failed to update report');
    } finally {
      setIsMarkingFound(false);
    }
  };

  const handleEditSuccess = () => {
    setIsEditing(false);
    router.refresh();
  };

  return (
    <>
      <Card className="hover:border-primary transition-colors relative">
        {/* Status Badge - Top Right */}
        <span
          className={`absolute top-4 right-4 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColors[report.status]}`}
        >
          {report.status}
        </span>

        {/* Action Buttons - Top Left */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label="Edit report"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center justify-center rounded-md border border-red-300 bg-white p-2 text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red focus:ring-offset-2 disabled:opacity-50"
            aria-label="Delete report"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Top Right: Reported Date - Desktop Only */}
        <div className="hidden md:block absolute top-4 right-4">
          <p className="text-xs text-gray-500 mb-2 text-right">
            Reported: {format(createdAt, 'MMM dd, yyyy HH:mm')}
          </p>
        </div>

        {/* Photo Section - Top Center */}
        <div className="flex justify-center mb-4 pt-12">
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
              />
            </div>
          ) : (
            <div className="flex h-32 w-32 items-center justify-center rounded bg-gray-200">
              <User className="h-16 w-16 text-gray-400" />
            </div>
          )}
        </div>

        {/* Main Content Section */}
        <div className="space-y-4">
          {/* Name - Large and Prominent */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">{report.fullName}</h3>
            <p className="text-sm text-gray-600 text-center">
              Age: {report.age} | {report.gender}
            </p>
          </div>

          {/* Mobile: Reported Date - Below Name */}
          <div className="md:hidden text-center">
            <p className="text-xs text-gray-500">
              Reported: {format(createdAt, 'MMM dd, yyyy HH:mm')}
            </p>
          </div>

          {/* Last Seen Section */}
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-gray-900">Last seen: {report.lastSeenLocation}</p>
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
            <Phone className="h-4 w-4 flex-shrink-0" />
            <span>{report.reporterPhone}</span>
          </div>

          {/* Description Section */}
          {report.clothing && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Description:</span>
              <p className="mt-1">{report.clothing}</p>
            </div>
          )}

          {/* Mark as Found Button */}
          {report.status === 'MISSING' && (
            <button
              onClick={handleMarkAsFound}
              disabled={isMarkingFound}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-3 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
            >
              <CheckCircle className="h-5 w-5" />
              {isMarkingFound ? 'Marking as Found...' : 'Mark as Found'}
            </button>
          )}

          {/* Success/Error Messages */}
          {error && (
            <Alert variant="error" title="Error">
              {error}
            </Alert>
          )}

          {success && (
            <Alert variant="success" title="Success">
              {report.status === 'FOUND' ? 'Report marked as found!' : 'Report deleted successfully!'}
            </Alert>
          )}
        </div>
      </Card>

      {/* Edit Modal */}
      {isEditing && (
        <EditReportModal
          report={report}
          locale={locale}
          onClose={() => setIsEditing(false)}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
}

