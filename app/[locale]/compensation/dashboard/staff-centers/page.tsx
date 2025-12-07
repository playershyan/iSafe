'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button, Alert, Loading, Toast, Input } from '@/components/ui';
import { Plus, Edit2, Trash2, Save, X, LogOut } from 'lucide-react';
import clsx from 'clsx';

interface StaffCenter {
  id: string;
  name: string;
  code: string;
  district: string;
  address?: string;
  contact_person?: string;
  contact_number?: string;
  is_active: boolean;
  hasAccessCode: boolean;
  lastAccessAt?: string;
  accessCount: number;
}

export default function StaffCentersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const router = useRouter();
  const t = useTranslations('compensation.dashboard');

  const [locale, setLocale] = useState('en');
  const [centers, setCenters] = useState<StaffCenter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingCenter, setEditingCenter] = useState<StaffCenter | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    district: '',
    address: '',
    contactPerson: '',
    contactNumber: '',
    accessCode: '',
  });

  // Toast notifications
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    params.then((p) => setLocale(p.locale));
  }, [params]);

  useEffect(() => {
    loadCenters();
  }, []);

  const loadCenters = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/compensation/staff-centers');

      if (response.status === 401) {
        router.push(`/${locale}/compensation/admin`);
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load centers');
      }

      setCenters(data.centers || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load centers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingCenter(null);
    setFormData({
      name: '',
      code: '',
      district: '',
      address: '',
      contactPerson: '',
      contactNumber: '',
      accessCode: '',
    });
    setShowModal(true);
  };

  const handleEdit = (center: StaffCenter) => {
    setEditingCenter(center);
    setFormData({
      name: center.name,
      code: center.code,
      district: center.district,
      address: center.address || '',
      contactPerson: center.contact_person || '',
      contactNumber: center.contact_number || '',
      accessCode: '', // Don't show existing access code
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      setError(null);

      if (!formData.name.trim() || !formData.code.trim() || !formData.district.trim()) {
        setError('Name, code, and district are required');
        return;
      }

      if (!editingCenter && !formData.accessCode.trim()) {
        setError('Access code is required for new centers');
        return;
      }

      const url = editingCenter
        ? `/api/compensation/staff-centers/${editingCenter.id}`
        : '/api/compensation/staff-centers';

      const method = editingCenter ? 'PATCH' : 'POST';

      const body: any = {
        name: formData.name.trim(),
        code: formData.code.trim(),
        district: formData.district.trim(),
        address: formData.address.trim() || undefined,
        contactPerson: formData.contactPerson.trim() || undefined,
        contactNumber: formData.contactNumber.trim() || undefined,
      };

      if (editingCenter && formData.accessCode.trim()) {
        body.accessCode = formData.accessCode.trim();
      } else if (!editingCenter) {
        body.accessCode = formData.accessCode.trim();
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save center');
      }

      setToastMessage(editingCenter ? 'Center updated successfully' : 'Center created successfully');
      setToastType('success');
      setShowToast(true);
      setShowModal(false);
      await loadCenters();
    } catch (err: any) {
      setError(err.message || 'Failed to save center');
      setToastMessage(err.message || 'Failed to save center');
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/compensation/staff-centers/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete center');
      }

      setToastMessage('Center deleted successfully');
      setToastType('success');
      setShowToast(true);
      await loadCenters();
    } catch (err: any) {
      setToastMessage(err.message || 'Failed to delete center');
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/compensation/auth/logout', { method: 'POST' });
    router.push(`/${locale}/compensation/admin`);
  };

  return (
    <main className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-gray-900">Staff Centers Management</h1>
              <p className="text-sm md:text-base text-gray-600 mt-1">Manage displacement camps and access credentials</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
          <div>
            <Button 
              variant="secondary" 
              onClick={() => router.push(`/${locale}/compensation/dashboard`)}
              size="small"
              className="w-full md:w-auto"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6">
            <Alert variant="error">{error}</Alert>
          </div>
        )}

        {/* Actions */}
        <div className="mb-6 flex justify-end">
          <Button variant="primary" onClick={handleCreateNew}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Center
          </Button>
        </div>

        {/* Centers Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <Loading />
            </div>
          ) : centers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No centers found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Center Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Center Code
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      District
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Access Code
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {centers.map((center) => (
                    <tr key={center.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{center.name}</td>
                      <td className="px-4 py-3 text-sm font-mono font-medium text-primary">
                        {center.code}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{center.district}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {center.hasAccessCode ? (
                          <span className="text-green-600 font-medium">✓ Set</span>
                        ) : (
                          <span className="text-red-600">Not set</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={clsx(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                            center.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          )}
                        >
                          {center.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(center)}
                            className="text-primary hover:text-primary-dark"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(center.id, center.name)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingCenter ? 'Edit Center' : 'Create New Center'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Center Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g., Colombo Central Camp"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Center Code *
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                      placeholder="e.g., CMB-CC-001"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    District *
                  </label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., Colombo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Full address of the center"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Name of contact person"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Number
                    </label>
                    <input
                      type="text"
                      value={formData.contactNumber}
                      onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g., 0771234567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {editingCenter ? 'New Access Code (leave blank to keep current)' : 'Access Code *'}
                  </label>
                  <input
                    type="password"
                    value={formData.accessCode}
                    onChange={(e) => setFormData({ ...formData, accessCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter access code"
                  />
                  {editingCenter && (
                    <p className="text-xs text-gray-500 mt-1">
                      Only enter a new access code if you want to change it
                    </p>
                  )}
                </div>

                {error && (
                  <Alert variant="error">{error}</Alert>
                )}

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <Button variant="primary" onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    {editingCenter ? 'Update' : 'Create'}
                  </Button>
                  <Button variant="secondary" onClick={() => setShowModal(false)}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
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

