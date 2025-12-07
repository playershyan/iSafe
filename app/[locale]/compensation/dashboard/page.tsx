'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import { Toast } from '@/components/ui/Toast';
import type { Database } from '@/types/supabase';
import { Save, LogOut, HelpCircle } from 'lucide-react';
import clsx from 'clsx';

type CompensationApplication = Database['public']['Tables']['compensation_applications']['Row'];
type CompensationClaim = Database['public']['Tables']['compensation_claims']['Row'];

interface ApplicationWithClaims extends CompensationApplication {
  claims: CompensationClaim[];
}

export default function CompensationDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const router = useRouter();
  const t = useTranslations('compensation.dashboard');
  const tStatus = useTranslations('compensation.status');
  const tClaims = useTranslations('compensation.claims');

  const [locale, setLocale] = useState('en');
  const [applications, setApplications] = useState<ApplicationWithClaims[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [districtFilter, setDistrictFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // View modal
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithClaims | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // Toast notifications
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    params.then((p) => setLocale(p.locale));
  }, [params]);

  useEffect(() => {
    loadApplications();
    loadStats();
    
    // Cleanup error timeout on unmount or when dependencies change
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
        errorTimeoutRef.current = null;
      }
    };
  }, [statusFilter, districtFilter, searchQuery, currentPage]);

  const loadApplications = async () => {
    try {
      setIsLoading(true);
      
      // Clear existing error timeout
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
        errorTimeoutRef.current = null;
      }
      setError(null);

      const queryParams = new URLSearchParams();
      if (statusFilter) queryParams.append('status', statusFilter);
      if (districtFilter) queryParams.append('district', districtFilter);
      if (searchQuery) queryParams.append('search', searchQuery);
      queryParams.append('page', currentPage.toString());
      queryParams.append('limit', '50');

      const response = await fetch(`/api/compensation/applications?${queryParams}`);

      if (response.status === 401) {
        router.push(`/${locale}/compensation/admin`);
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load applications');
      }

      setApplications(data.applications || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setError(null); // Clear any previous errors on success
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load applications';
      setError(errorMessage);
      
      // Auto-dismiss error after 10 seconds
      errorTimeoutRef.current = setTimeout(() => {
        setError(null);
        errorTimeoutRef.current = null;
      }, 10000);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/compensation/stats');
      const data = await response.json();

      if (response.ok && data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const dismissError = () => {
    // Clear the timeout if it exists
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = null;
    }
    // Clear the error state
    setError(null);
  };

  const handleLogout = async () => {
    await fetch('/api/compensation/auth/logout', { method: 'POST' });
    router.push(`/${locale}/compensation/admin`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'UNDER_REVIEW':
        return 'bg-blue-100 text-blue-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'PAID':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewDetails = async (applicationId: string) => {
    try {
      const response = await fetch(`/api/compensation/applications/${applicationId}`);
      if (!response.ok) throw new Error('Failed to load application details');
      
      const data = await response.json();
      if (data.success && data.application) {
        setSelectedApplication(data.application);
        setAdminNotes(data.application.admin_notes || '');
        setUpdateError(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load application details');
    }
  };

  const handleUpdateStatus = async (status: 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW' | 'PENDING' | 'PAID') => {
    if (!selectedApplication) return;

    setIsUpdatingStatus(true);
    setUpdateError(null);

    try {
      const response = await fetch(`/api/compensation/applications/${selectedApplication.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          adminNotes: adminNotes.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update status');
      }

      // Show toast with appropriate type
      const statusMessages: Record<string, string> = {
        APPROVED: 'Application approved successfully',
        REJECTED: 'Application rejected',
        UNDER_REVIEW: 'Application marked as under review',
        PAID: 'Application marked as paid',
        PENDING: 'Application status reset to pending',
      };
      
      setToastMessage(statusMessages[status] || 'Status updated successfully');
      // Use error type for rejections, success for others
      setToastType(status === 'REJECTED' ? 'error' : 'success');
      setShowToast(true);

      // Reload applications and close modal
      await loadApplications();
      await loadStats(); // Reload stats too
      setSelectedApplication(null);
      setAdminNotes('');
    } catch (err: any) {
      setUpdateError(err.message || 'Failed to update status');
      setToastMessage(err.message || 'Failed to update status');
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const closeModal = () => {
    setSelectedApplication(null);
    setAdminNotes('');
    setUpdateError(null);
  };

  const handleSaveNotes = async () => {
    if (!selectedApplication) return;

    setIsSavingNotes(true);
    setUpdateError(null);

    try {
      // Update notes without changing status
      const response = await fetch(`/api/compensation/applications/${selectedApplication.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: selectedApplication.status, // Keep current status
          adminNotes: adminNotes.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save notes');
      }

      // Show success toast
      setToastMessage('Admin notes saved successfully');
      setToastType('success');
      setShowToast(true);

      // Reload application to get updated notes
      await handleViewDetails(selectedApplication.id);
    } catch (err: any) {
      setUpdateError(err.message || 'Failed to save notes');
      setToastMessage(err.message || 'Failed to save notes');
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsSavingNotes(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-xl md:text-3xl font-bold text-gray-900">{t('title')}</h1>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
          <div className="flex gap-2 items-center">
            <Button 
              variant="secondary" 
              onClick={() => router.push(`/${locale}/compensation/dashboard/staff-centers`)}
              size="small"
              className="w-full md:w-auto"
            >
              Manage Staff Centers
            </Button>
            <button
              onClick={() => router.push(`/${locale}/compensation/dashboard/help`)}
              className="flex items-center justify-center w-12 h-12 rounded border-2 border-primary bg-white text-primary hover:bg-primary hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              title="Help & Guides"
              aria-label="Help & Guides"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">{t('totalApplications')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">{t('pendingApplications')}</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.byStatus?.PENDING || 0}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">{t('approvedApplications')}</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.byStatus?.APPROVED || 0}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">{t('rejectedApplications')}</p>
              <p className="text-2xl font-bold text-red-600">
                {stats.byStatus?.REJECTED || 0}
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="text-lg font-semibold mb-4">{t('filters')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('filterByStatus')}
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="PAID">Paid</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('filterByDistrict')}
              </label>
              <select
                value={districtFilter}
                onChange={(e) => {
                  setDistrictFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Districts</option>
                {stats?.byDistrict &&
                  Object.keys(stats.byDistrict)
                    .sort()
                    .map((district) => (
                      <option key={district} value={district}>
                        {district} ({stats.byDistrict[district]})
                      </option>
                    ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={t('searchPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {error && (
            <div className="p-4">
              <div className="flex items-center justify-between">
                <Alert variant="error">{error}</Alert>
                <button
                  onClick={dismissError}
                  className="ml-4 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded p-1"
                  aria-label="Dismiss error"
                  title="Dismiss"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="p-8 text-center">
              <Loading />
            </div>
          ) : applications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">{t('noApplications')}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('applicationCode')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('applicantName')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('applicantPhone')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('location')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('claims')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('status')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('submittedDate')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-mono font-medium text-primary">
                        {app.application_code}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        <div>{app.applicant_name}</div>
                        <div className="text-xs text-gray-500">{app.applicant_nic}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {app.applicant_phone}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div>{app.district}</div>
                        <div className="text-xs text-gray-500">
                          {app.divisional_secretariat}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {app.claims.length}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={clsx(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                            getStatusBadgeColor(app.status)
                          )}
                        >
                          {tStatus(app.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(app.created_at)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() => handleViewDetails(app.id)}
                        >
                          {t('viewDetails')}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && applications.length > 0 && (
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-700">
                {t('pagination', { page: currentPage, total: totalPages })}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Application Details Modal */}
        {selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  Application Details - {selectedApplication.application_code}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Applicant Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3">Applicant Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Name:</span>
                      <p className="text-gray-900">{selectedApplication.applicant_name}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">NIC:</span>
                      <p className="text-gray-900">{selectedApplication.applicant_nic}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Phone:</span>
                      <p className="text-gray-900">{selectedApplication.applicant_phone}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Status:</span>
                      <span
                        className={clsx(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-2',
                          getStatusBadgeColor(selectedApplication.status)
                        )}
                      >
                        {tStatus(selectedApplication.status)}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium text-gray-600">Address:</span>
                      <p className="text-gray-900">{selectedApplication.applicant_address}</p>
                    </div>
                  </div>
                </div>

                {/* Location Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3">Location Information</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">District:</span>
                      <p className="text-gray-900">{selectedApplication.district}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Divisional Secretariat:</span>
                      <p className="text-gray-900">{selectedApplication.divisional_secretariat}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">GN Division:</span>
                      <p className="text-gray-900">{selectedApplication.grama_niladhari_division}</p>
                    </div>
                  </div>
                </div>

                {/* Claims */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3">
                    Selected Claims ({selectedApplication.claims.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedApplication.claims.map((claim) => (
                      <div
                        key={claim.id}
                        className="flex items-center justify-between p-2 bg-white rounded border"
                      >
                        <div className="flex-1">
                          <span className="text-sm font-medium">
                            {tClaims(`${claim.claim_type}.title`)}
                          </span>
                          <div className="text-xs text-gray-600 mt-1">
                            {tClaims(`${claim.claim_type}.amount`)}
                          </div>
                        </div>
                        <span
                          className={clsx(
                            'px-2 py-1 rounded text-xs ml-2',
                            claim.claim_status === 'APPROVED'
                              ? 'bg-green-100 text-green-800'
                              : claim.claim_status === 'REJECTED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          )}
                        >
                          {claim.claim_status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Application Metadata */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3">Application Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Submitted:</span>
                      <p className="text-gray-900">{formatDate(selectedApplication.created_at)}</p>
                    </div>
                    {selectedApplication.reviewed_at && (
                      <div>
                        <span className="font-medium text-gray-600">Reviewed:</span>
                        <p className="text-gray-900">{formatDate(selectedApplication.reviewed_at)}</p>
                      </div>
                    )}
                    {selectedApplication.reviewed_by && (
                      <div>
                        <span className="font-medium text-gray-600">Reviewed By:</span>
                        <p className="text-gray-900">{selectedApplication.reviewed_by}</p>
                      </div>
                    )}
                    <div>
                      <span className="font-medium text-gray-600">Phone Verified:</span>
                      <p className="text-gray-900">
                        {selectedApplication.phone_verified ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Admin Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Notes
                  </label>
                  <div className="relative">
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Add notes about this application..."
                    />
                    <button
                      onClick={handleSaveNotes}
                      disabled={isSavingNotes || !adminNotes.trim()}
                      className={clsx(
                        'absolute bottom-2 right-2 p-1.5 rounded',
                        'bg-primary text-white hover:bg-primary-dark',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        'transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1',
                        'flex items-center justify-center'
                      )}
                      title="Save notes"
                    >
                      {isSavingNotes ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {updateError && (
                  <Alert variant="error">{updateError}</Alert>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <Button
                    variant="primary"
                    onClick={() => handleUpdateStatus('APPROVED')}
                    disabled={isUpdatingStatus || selectedApplication.status === 'APPROVED'}
                  >
                    {isUpdatingStatus ? 'Updating...' : 'Approve'}
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleUpdateStatus('REJECTED')}
                    disabled={isUpdatingStatus || selectedApplication.status === 'REJECTED'}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleUpdateStatus('UNDER_REVIEW')}
                    disabled={isUpdatingStatus || selectedApplication.status === 'UNDER_REVIEW'}
                  >
                    Mark Under Review
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleUpdateStatus('PAID')}
                    disabled={isUpdatingStatus || selectedApplication.status === 'PAID'}
                  >
                    Mark as Paid
                  </Button>
                  <div className="ml-auto">
                    <Button variant="secondary" onClick={closeModal}>
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {showToast && (
          <Toast
            message={toastMessage}
            type={toastType}
            onClose={() => setShowToast(false)}
          />
        )}
      </div>
    </main>
  );
}
