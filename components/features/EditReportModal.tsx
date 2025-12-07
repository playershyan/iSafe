'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { MissingPersonReport } from './MissingPersonCard';

interface EditReportModalProps {
  report: MissingPersonReport;
  locale: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditReportModal({ report, locale, onClose, onSuccess }: EditReportModalProps) {
  const [formData, setFormData] = useState({
    fullName: report.fullName,
    age: report.age.toString(),
    gender: report.gender,
    lastSeenLocation: report.lastSeenLocation,
    lastSeenDistrict: report.lastSeenDistrict || '',
    lastSeenDate: new Date(report.lastSeenDate).toISOString().split('T')[0],
    clothing: report.clothing || '',
    reporterName: report.reporterName,
    reporterPhone: report.reporterPhone,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/user/reports/${report.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          age: Number(formData.age),
          gender: formData.gender,
          lastSeenLocation: formData.lastSeenLocation.trim(),
          lastSeenDistrict: formData.lastSeenDistrict || undefined,
          lastSeenDate: formData.lastSeenDate,
          clothing: formData.clothing.trim() || undefined,
          reporterName: formData.reporterName.trim(),
          reporterPhone: formData.reporterPhone.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update report');
      }

      onSuccess();
    } catch (error) {
      console.error('Update error:', error);
      setError(error instanceof Error ? error.message : 'Failed to update report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-lg m-4">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900">Edit Report</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <Alert variant="error" title="Error">
              {error}
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Full Name *"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>

            <div>
              <Input
                label="Age *"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                min="0"
                max="120"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender *
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'MALE' | 'FEMALE' | 'OTHER' })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <Input
                label="Last Seen Date *"
                type="date"
                value={formData.lastSeenDate}
                onChange={(e) => setFormData({ ...formData, lastSeenDate: e.target.value })}
                required
              />
            </div>

            <div className="md:col-span-2">
              <Input
                label="Last Seen Location *"
                value={formData.lastSeenLocation}
                onChange={(e) => setFormData({ ...formData, lastSeenLocation: e.target.value })}
                required
              />
            </div>

            <div className="md:col-span-2">
              <Input
                label="District (Optional)"
                value={formData.lastSeenDistrict}
                onChange={(e) => setFormData({ ...formData, lastSeenDistrict: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description / Clothing (Optional)
              </label>
              <textarea
                value={formData.clothing}
                onChange={(e) => setFormData({ ...formData, clothing: e.target.value })}
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                maxLength={500}
              />
            </div>

            <div>
              <Input
                label="Reporter Name *"
                value={formData.reporterName}
                onChange={(e) => setFormData({ ...formData, reporterName: e.target.value })}
                required
              />
            </div>

            <div>
              <Input
                label="Reporter Phone *"
                value={formData.reporterPhone}
                onChange={(e) => setFormData({ ...formData, reporterPhone: e.target.value })}
                pattern="^0\d{9}$"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

