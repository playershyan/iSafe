'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Edit, Download, Trash2, Save, X } from 'lucide-react';
import jsPDF from 'jspdf';
import { Button, Alert } from '@/components/ui';

interface Person {
  id: string;
  fullName: string;
  gender: string;
  age: number;
}

interface EditablePerson extends Person {
  isEditing?: boolean;
  editedName?: string;
  editedGender?: string;
  editedAge?: string;
}

interface SearchablePeopleTableProps {
  persons: Person[];
}

export function SearchablePeopleTable({ persons }: SearchablePeopleTableProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editablePersons, setEditablePersons] = useState<EditablePerson[]>(
    persons.map(p => ({ ...p }))
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Auto-dismiss error messages after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Auto-dismiss success messages after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Sync editablePersons when persons prop changes (but not in edit mode)
  useEffect(() => {
    if (!isEditMode) {
      setEditablePersons(persons.map(p => ({ ...p })));
    }
  }, [persons, isEditMode]);

  const personsToDisplay = isEditMode ? editablePersons : persons;

  const displayPersons = personsToDisplay.filter((person) => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    const editablePerson = person as EditablePerson;
    const name = isEditMode && editablePerson.editedName !== undefined
      ? editablePerson.editedName
      : person.fullName;
    const gender = isEditMode && editablePerson.editedGender !== undefined
      ? editablePerson.editedGender
      : person.gender;
    const age = isEditMode && editablePerson.editedAge !== undefined
      ? editablePerson.editedAge
      : person.age.toString();
    
    return (
      name.toLowerCase().includes(query) ||
      gender.toLowerCase().includes(query) ||
      age.includes(query)
    );
  });

  const handleEditClick = () => {
    setIsEditMode(true);
    setEditablePersons(persons.map(p => ({ ...p })));
    setError(null);
    setSuccess(false);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditablePersons(persons.map(p => ({ ...p })));
    setError(null);
    setSuccess(false);
  };

  const updatePerson = (id: string, field: 'editedName' | 'editedGender' | 'editedAge', value: string) => {
    setEditablePersons(prev => 
      prev.map(p => 
        p.id === id ? { ...p, [field]: value } : p
      )
    );
  };

  const deletePerson = (id: string) => {
    setEditablePersons(prev => prev.filter(p => p.id !== id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Get all changes (updates and deletes)
      const originalIds = new Set(persons.map(p => p.id));
      const currentIds = new Set(editablePersons.map(p => p.id));
      
      // Find deleted persons
      const deletedIds = Array.from(originalIds).filter(id => !currentIds.has(id));
      
      // Find updated persons
      const updates = editablePersons
        .filter(p => {
          const original = persons.find(op => op.id === p.id);
          if (!original) return false;
          return (
            (p.editedName && p.editedName.trim() !== original.fullName) ||
            (p.editedGender && p.editedGender !== original.gender) ||
            (p.editedAge && parseInt(p.editedAge) !== original.age)
          );
        })
        .map(p => ({
          id: p.id,
          fullName: p.editedName?.trim() || p.fullName,
          gender: (p.editedGender || p.gender) as 'MALE' | 'FEMALE' | 'OTHER',
          age: parseInt(p.editedAge || p.age.toString()),
        }));

      // Delete persons
      for (const id of deletedIds) {
        const response = await fetch(`/api/persons/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to delete person');
        }
      }

      // Update persons
      for (const update of updates) {
        const response = await fetch(`/api/persons/${update.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(update),
        });
        if (!response.ok) {
          throw new Error('Failed to update person');
        }
      }

      setSuccess(true);
      setIsEditMode(false);
      setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch (error) {
      console.error('Save error:', error);
      setError(error instanceof Error ? error.message : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = async () => {
    try {
      setError(null);
      
      // Dynamically import jspdf-autotable
      const autoTableModule = await import('jspdf-autotable');
      const autoTable = autoTableModule.autoTable || autoTableModule.default;
      
      if (typeof autoTable !== 'function') {
        throw new Error('autoTable function not available');
      }
      
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(18);
      doc.text('Registered People', 14, 22);
      
      // Date
      doc.setFontSize(10);
      const date = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      doc.text(`Generated on: ${date}`, 14, 30);
      
      // Prepare table data
      const tableData = displayPersons.map(person => [
        person.fullName,
        person.gender,
        person.age.toString(),
      ]);
      
      // Use autoTable as a function
      autoTable(doc, {
        head: [['Name', 'Gender', 'Age']],
        body: tableData,
        startY: 40,
        styles: {
          fontSize: 10,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251],
        },
        margin: { top: 40 },
      });
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `registered-people-${timestamp}.pdf`;
      
      // Save PDF
      doc.save(filename);
    } catch (error) {
      console.error('Download error:', error);
      setError(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      {/* Search Bar and Action Buttons */}
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, gender, or age..."
              className="w-full rounded-full border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-25"
              disabled={isEditMode}
            />
          </div>
          <div className="flex items-center gap-2">
            {!isEditMode ? (
              <>
                <button
                  type="button"
                  onClick={handleEditClick}
                  className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  title="Download as PDF"
                >
                  <Download className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="px-6 pt-4">
          <Alert variant="error" title="Error">
            {error}
          </Alert>
        </div>
      )}

      {success && (
        <div className="px-6 pt-4">
          <Alert variant="success" title="Success">
            Changes saved successfully!
          </Alert>
        </div>
      )}

      {/* Table */}
      {displayPersons.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-gray-500">
            {searchQuery ? 'No people found matching your search.' : 'No people registered in this center yet.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {isEditMode && (
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 w-12">
                    {/* Delete column */}
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Gender
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Age
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {displayPersons.map((person) => {
                const editablePerson = person as EditablePerson;
                const displayName = isEditMode && editablePerson.editedName !== undefined && editablePerson.editedName !== ''
                  ? editablePerson.editedName 
                  : person.fullName;
                const displayGender = isEditMode && editablePerson.editedGender !== undefined && editablePerson.editedGender !== ''
                  ? editablePerson.editedGender 
                  : person.gender;
                const displayAge = isEditMode && editablePerson.editedAge !== undefined && editablePerson.editedAge !== ''
                  ? editablePerson.editedAge 
                  : person.age.toString();

                return (
                  <tr key={person.id} className="hover:bg-gray-50">
                    {isEditMode && (
                      <td className="whitespace-nowrap px-4 py-3">
                        <button
                          type="button"
                          onClick={() => deletePerson(person.id)}
                          className="text-red-600 hover:text-red-800"
                          aria-label="Delete row"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    )}
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => updatePerson(person.id, 'editedName', e.target.value)}
                          className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      ) : (
                        person.fullName
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {isEditMode ? (
                        <select
                          value={displayGender}
                          onChange={(e) => updatePerson(person.id, 'editedGender', e.target.value)}
                          className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option value="MALE">MALE</option>
                          <option value="FEMALE">FEMALE</option>
                          <option value="OTHER">OTHER</option>
                        </select>
                      ) : (
                        person.gender
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {isEditMode ? (
                        <input
                          type="number"
                          value={displayAge}
                          onChange={(e) => updatePerson(person.id, 'editedAge', e.target.value)}
                          className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          min="0"
                          max="120"
                        />
                      ) : (
                        person.age
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

