'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, AlertCircle } from 'lucide-react';
import { Button, Alert } from '@/components/ui';

interface PersonRow {
  id: string;
  fullName: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | '';
  age: string;
  duplicateWarning?: boolean;
  duplicateError?: string;
}

interface BulkRegistrationFormProps {
  locale: string;
  centerId: string;
  existingPersons?: Array<{ fullName: string }>;
}

export function BulkRegistrationForm({ locale, centerId, existingPersons = [] }: BulkRegistrationFormProps) {
  const router = useRouter();
  const [rows, setRows] = useState<PersonRow[]>([
    { id: '1', fullName: '', gender: '', age: '' },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Create a set of existing names for quick lookup
  const existingNamesSet = new Set(
    existingPersons.map(p => p.fullName.toLowerCase().trim())
  );

  // Check for duplicates within the form itself
  const checkInternalDuplicates = useCallback((rows: PersonRow[]) => {
    const nameCounts = new Map<string, number>();
    rows.forEach(row => {
      const normalizedName = row.fullName.trim().toLowerCase();
      if (normalizedName) {
        nameCounts.set(normalizedName, (nameCounts.get(normalizedName) || 0) + 1);
      }
    });

    return rows.map(row => {
      const normalizedName = row.fullName.trim().toLowerCase();
      const count = nameCounts.get(normalizedName) || 0;
      const hasInternalDuplicate = count > 1 && normalizedName;
      
      // Preserve database duplicate error if it exists
      const hasDatabaseDuplicate = row.duplicateError === 'This person is already registered in the center';
      
      return {
        ...row,
        duplicateWarning: hasInternalDuplicate || hasDatabaseDuplicate,
        duplicateError: hasInternalDuplicate 
          ? 'This name appears multiple times in the form'
          : hasDatabaseDuplicate
          ? 'This person is already registered in the center'
          : undefined,
      };
    });
  }, []);

  // Check for duplicates in real-time
  const checkDuplicates = useCallback(async (names: string[]) => {
    const nonEmptyNames = names.filter(name => name.trim().length > 0);
    if (nonEmptyNames.length === 0) {
      return;
    }

    setCheckingDuplicates(true);
    try {
      const response = await fetch('/api/register/check-duplicates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          names: nonEmptyNames,
          centerId,
        }),
      });

      const result = await response.json();

      if (response.ok && result.hasDuplicates) {
        // Update rows with duplicate warnings, but preserve internal duplicate errors
        setRows(currentRows => {
          // First check for internal duplicates
          const withInternalChecks = checkInternalDuplicates(currentRows);
          
          // Then add database duplicate warnings
          return withInternalChecks.map(row => {
            const normalizedName = row.fullName.trim().toLowerCase();
            const isDuplicate = result.duplicates.some(
              (dup: string) => dup.toLowerCase().trim() === normalizedName
            );
            
            const hasInternalDuplicate = row.duplicateError === 'This name appears multiple times in the form';
            
            if (isDuplicate && row.fullName.trim()) {
              return {
                ...row,
                duplicateWarning: true,
                duplicateError: hasInternalDuplicate 
                  ? 'This name appears multiple times in the form'
                  : 'This person is already registered in the center',
              };
            }
            // Keep existing duplicateWarning and duplicateError if they're from internal duplicates
            return row;
          });
        });
      } else {
        // No database duplicates found - clear database duplicate warnings but keep internal duplicates
        setRows(currentRows => {
          const withInternalChecks = checkInternalDuplicates(currentRows);
          // Clear database duplicate errors but preserve internal duplicate errors
          return withInternalChecks.map(row => {
            if (row.duplicateError === 'This person is already registered in the center') {
              return {
                ...row,
                duplicateWarning: row.duplicateError === 'This name appears multiple times in the form',
                duplicateError: row.duplicateError === 'This name appears multiple times in the form' 
                  ? row.duplicateError 
                  : undefined,
              };
            }
            return row;
          });
        });
      }
    } catch (error) {
      console.error('Error checking duplicates:', error);
    } finally {
      setCheckingDuplicates(false);
    }
  }, [centerId, checkInternalDuplicates]);

  const addRow = () => {
    const newRows = [...rows, { id: Date.now().toString(), fullName: '', gender: '', age: '' }];
    const withInternalChecks = checkInternalDuplicates(newRows);
    setRows(withInternalChecks);
  };

  const deleteRow = (id: string) => {
    if (rows.length > 1) {
      const newRows = rows.filter((row) => row.id !== id);
      const withInternalChecks = checkInternalDuplicates(newRows);
      setRows(withInternalChecks);
    }
  };

  const updateRow = (id: string, field: keyof PersonRow, value: string) => {
    const updatedRows = rows.map((row) => {
      if (row.id === id) {
        // When name is changed, clear all duplicate warnings for this row
        if (field === 'fullName') {
          return { ...row, [field]: value, duplicateWarning: false, duplicateError: undefined };
        }
        return { ...row, [field]: value };
      }
      return row;
    });
    
    // Always check for internal duplicates after any update
    const withInternalChecks = checkInternalDuplicates(updatedRows);
    setRows(withInternalChecks);
  };

  // Debounced duplicate checking against database
  useEffect(() => {
    const allNames = rows.map(r => r.fullName.trim()).filter(name => name.length > 0);
    
    // If all names are cleared, clear all database duplicate warnings
    if (allNames.length === 0) {
      setRows(currentRows => {
        return currentRows.map(row => ({
          ...row,
          duplicateWarning: row.duplicateError === 'This name appears multiple times in the form',
          duplicateError: row.duplicateError === 'This name appears multiple times in the form' 
            ? row.duplicateError 
            : undefined,
        }));
      });
      return;
    }

    const timeoutId = setTimeout(() => {
      checkDuplicates(allNames);
    }, 500);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows.map(r => r.fullName).join(',')]); // Trigger when any name changes

  const hasFormData = (): boolean => {
    return rows.some(row => 
      row.fullName.trim().length > 0 || 
      row.gender.length > 0 || 
      row.age.trim().length > 0
    );
  };

  const handleCancel = () => {
    if (hasFormData()) {
      setShowCancelConfirm(true);
    } else {
      router.push(`/${locale}/staff/dashboard`);
    }
  };

  const confirmCancel = () => {
    setRows([{ id: '1', fullName: '', gender: '', age: '' }]);
    setError(null);
    setSuccess(false);
    setShowCancelConfirm(false);
    router.push(`/${locale}/staff/dashboard`);
  };

  const validateRows = (): { valid: boolean; error?: string } => {
    // Filter out empty rows (rows with no name)
    const rowsWithNames = rows.filter(row => row.fullName.trim().length > 0);

    // If no rows have names, show error
    if (rowsWithNames.length === 0) {
      return { valid: false, error: 'Please enter at least one person with a name.' };
    }

    // Only validate rows that have names
    for (const row of rowsWithNames) {
      // If name is filled, gender and age are required
      if (!row.gender || !row.age.trim()) {
        return { valid: false, error: `Please fill in gender and age for "${row.fullName.trim()}".` };
      }
      const ageNum = parseInt(row.age);
      if (isNaN(ageNum) || ageNum < 0 || ageNum > 120) {
        return { valid: false, error: `Age must be between 0 and 120 for "${row.fullName.trim()}".` };
      }
    }

    // Check for duplicates (only in rows with names)
    const hasDuplicates = rowsWithNames.some(row => row.duplicateWarning);
    if (hasDuplicates) {
      return { valid: false, error: 'Please resolve duplicate name warnings before submitting.' };
    }

    return { valid: true };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const validation = validateRows();
    if (!validation.valid) {
      setError(validation.error || 'Please fill in all fields correctly.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Only include rows that have names filled
      const personsData = rows
        .filter((row) => row.fullName.trim().length > 0)
        .map((row) => ({
          fullName: row.fullName.trim(),
          gender: row.gender as 'MALE' | 'FEMALE' | 'OTHER',
          age: parseInt(row.age),
          shelterId: centerId,
          healthStatus: 'HEALTHY' as const,
        }));

      const response = await fetch('/api/register/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ persons: personsData }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to register persons');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/${locale}/staff/dashboard`);
        router.refresh();
      }, 1500);
    } catch (error) {
      console.error('Registration error:', error);
      setError(error instanceof Error ? error.message : 'Failed to register persons');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="error" title="Error">
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" title="Success">
          Persons registered successfully! Redirecting...
        </Alert>
      )}

      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 w-12">
                  {/* Delete column */}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Gender
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Age
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3">
                    <button
                      type="button"
                      onClick={() => deleteRow(row.id)}
                      disabled={rows.length === 1}
                      className="text-red-600 hover:text-red-800 disabled:text-gray-300 disabled:cursor-not-allowed"
                      aria-label="Delete row"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="relative">
                      <input
                        type="text"
                        value={row.fullName}
                        onChange={(e) => updateRow(row.id, 'fullName', e.target.value)}
                        className={`w-full rounded-md border px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-1 ${
                          row.duplicateWarning
                            ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:border-primary focus:ring-primary'
                        }`}
                        placeholder="Enter name"
                      />
                      {row.duplicateWarning && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        </div>
                      )}
                    </div>
                    {row.duplicateError && (
                      <p className="mt-1 text-xs text-red-600">{row.duplicateError}</p>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <select
                      value={row.gender}
                      onChange={(e) => updateRow(row.id, 'gender', e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="">Select gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <input
                      type="number"
                      value={row.age}
                      onChange={(e) => updateRow(row.id, 'age', e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Age"
                      min="0"
                      max="120"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <Plus className="h-4 w-4" />
            Add Row
          </button>
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Cancel Registration?</h3>
            <p className="mb-6 text-sm text-gray-600">
              You have unsaved changes. Are you sure you want to cancel? All entered data will be lost.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowCancelConfirm(false)}
              >
                Keep Editing
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={confirmCancel}
              >
                Cancel Registration
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button 
          type="button" 
          variant="secondary"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} size="large">
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
}


