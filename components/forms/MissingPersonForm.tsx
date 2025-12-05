'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Toast } from '@/components/ui';
import { compressImage, validateImageFile } from '@/lib/utils/imageCompression';
import clsx from 'clsx';

type Gender = 'MALE' | 'FEMALE' | 'OTHER';

interface FormData {
  photoFile: File | null;
  photoPreview: string | null;
  fullName: string;
  age: string;
  gender: Gender | '';
  lastSeenLocation: string;
  lastSeenDistrict: string;
  lastSeenDate: string;
  clothing: string;
  reporterName: string;
  reporterPhone: string;
  alternativeContact: string;
  consent: boolean;
}

interface MissingPersonFormProps {
  locale: string;
}

// Sri Lankan Districts
const DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Monaragala', 'Ratnapura', 'Kegalle'
];

export function MissingPersonForm({ locale }: MissingPersonFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    photoFile: null,
    photoPreview: null,
    fullName: '',
    age: '',
    gender: '',
    lastSeenLocation: '',
    lastSeenDistrict: '',
    lastSeenDate: new Date().toISOString().split('T')[0],
    clothing: '',
    reporterName: '',
    reporterPhone: '',
    alternativeContact: '',
    consent: false,
  });

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
          const newErrors = { ...prev };
        delete newErrors[field];
          return newErrors;
        });
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid file');
      return;
    }

    try {
      setUploadError(null);
      setUploadingPhoto(true);
      setPhotoUrl(null);

      const compressedFile = await compressImage(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          photoFile: compressedFile,
          photoPreview: reader.result as string,
        }));
      };
      reader.readAsDataURL(compressedFile);
      
      const uploadFormData = new FormData();
      uploadFormData.append('file', compressedFile);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({}));
        const errorMessage = errorData.error || 'Failed to upload photo';
        setUploadError(errorMessage);
        setUploadingPhoto(false);
        return;
      }

      const uploadData = await uploadResponse.json();
      if (!uploadData.success || !uploadData.url) {
        setUploadError(uploadData.error || 'Upload failed - no URL returned');
        setUploadingPhoto(false);
        return;
      }

      setPhotoUrl(uploadData.url);
      setUploadingPhoto(false);
      setUploadError(null);
    } catch (error) {
      setUploadError('Failed to process or upload image');
      setUploadingPhoto(false);
      console.error('Image processing/upload error:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.fullName || formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name is required (minimum 2 characters)';
    }
    if (!formData.age || Number(formData.age) < 0 || Number(formData.age) > 120) {
      newErrors.age = 'Valid age is required';
    }
    if (!formData.gender) {
      newErrors.gender = 'Please select gender';
    }
    if (!formData.lastSeenLocation || formData.lastSeenLocation.trim().length < 2) {
      newErrors.lastSeenLocation = 'Last known location is required';
    }
    if (!formData.lastSeenDistrict) {
      newErrors.lastSeenDistrict = 'District is required';
    }
    if (!formData.reporterName || formData.reporterName.trim().length < 2) {
      newErrors.reporterName = 'Your name is required';
    }
    if (!formData.reporterPhone || !/^0\d{9}$/.test(formData.reporterPhone)) {
      newErrors.reporterPhone = 'Valid phone number required (10 digits starting with 0)';
    }
    if (!formData.consent) {
      newErrors.consent = 'You must authorize sharing this information';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (uploadingPhoto) {
      alert('Please wait for the photo to finish uploading');
      return;
    }

    if (formData.photoFile && !photoUrl) {
      alert('Photo upload failed. Please try selecting the photo again.');
      return;
    }

    setIsSubmitting(true);

    try {
      const finalPhotoUrl = photoUrl || '';

      const { getOrCreateAnonymousUserId, setAnonymousUserIdCookieClient } = await import('@/lib/utils/anonymousUser');
      const anonymousUserId = getOrCreateAnonymousUserId();
      
      if (anonymousUserId) {
        setAnonymousUserIdCookieClient(anonymousUserId);
      }

      const response = await fetch('/api/missing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          age: Number(formData.age),
          gender: formData.gender,
          photoUrl: finalPhotoUrl,
          lastSeenLocation: formData.lastSeenLocation.trim(),
          lastSeenDistrict: formData.lastSeenDistrict,
          lastSeenDate: formData.lastSeenDate,
          clothing: formData.clothing.trim(),
          reporterName: formData.reporterName.trim(),
          reporterPhone: formData.reporterPhone.trim(),
          alternativeContact: formData.alternativeContact.trim(),
          anonymousUserId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create missing person report');
      }

      const data = await response.json();

      setShowToast(true);
      
      setTimeout(() => {
        router.push(`/${locale}/missing`);
      }, 2000);
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to create report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {showToast && (
        <Toast
          message="Missing person report created successfully!"
          type="success"
          duration={2000}
          onClose={() => setShowToast(false)}
        />
      )}

      <h2 className="text-2xl font-bold text-gray-900">Report Missing Person</h2>

      {/* Photo Upload - Optional */}
        <div>
        <label className="mb-2 block text-base font-medium text-gray-700">
          Photo <span className="text-gray-500 text-sm">(Optional)</span>
          </label>
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="sr-only"
            id="photo-upload"
          />
          <label
            htmlFor="photo-upload"
            className={clsx(
              'flex h-[200px] w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors',
              errors.photoFile ? 'border-danger bg-red-50' : 'border-gray-400 bg-gray-50 hover:border-primary'
            )}
          >
            {formData.photoPreview ? (
              <img
                src={formData.photoPreview}
                alt="Preview"
                className="h-full w-full rounded-lg object-contain"
              />
            ) : (
              <div className="text-center">
                <span className="mb-2 block text-5xl" aria-hidden="true">📷</span>
                <span className="block text-base font-medium text-primary">Click to Upload</span>
                <span className="mt-1 block text-sm text-gray-600">Maximum 5MB (Optional)</span>
              </div>
            )}
          </label>
        </div>
        {errors.photoFile && (
          <p className="mt-1 text-sm text-danger">{errors.photoFile}</p>
        )}
        {uploadError && (
          <p className="mt-1 text-sm text-danger">{uploadError}</p>
        )}
        {uploadingPhoto && (
          <p className="mt-1 text-sm text-primary">Uploading photo...</p>
        )}
        {photoUrl && !uploadingPhoto && (
          <p className="mt-1 text-sm text-green-600">✓ Photo uploaded successfully</p>
        )}
      </div>

      {/* Person Details */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">Person Details</h3>

        <Input
          label="Full Name"
          value={formData.fullName}
          onChange={(e) => updateField('fullName', e.target.value)}
          required
          error={errors.fullName}
        />

        <Input
          label="Age"
          type="number"
          value={formData.age}
          onChange={(e) => updateField('age', e.target.value)}
          required
          min={0}
          max={120}
          className="w-[120px]"
          error={errors.age}
        />

        <div>
          <label className="mb-2 block text-base font-medium text-gray-700">Gender</label>
          <div className="flex gap-6">
            {(['MALE', 'FEMALE', 'OTHER'] as const).map((g) => (
              <label key={g} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                  name="gender"
                  value={g}
                  checked={formData.gender === g}
                  onChange={(e) => updateField('gender', e.target.value as Gender)}
                  className="h-5 w-5 text-primary focus:ring-primary"
              />
                <span className="text-base">
                  {g === 'MALE' ? 'Male' : g === 'FEMALE' ? 'Female' : 'Other'}
                </span>
            </label>
            ))}
          </div>
          {errors.gender && (
            <p className="mt-1 text-sm text-danger">{errors.gender}</p>
          )}
        </div>
      </div>

      {/* Last Known Details */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">Last Known Details</h3>

        <Input
          label="Last Known Location"
          value={formData.lastSeenLocation}
          onChange={(e) => updateField('lastSeenLocation', e.target.value)}
          placeholder="e.g., Near temple, Main St"
          required
          error={errors.lastSeenLocation}
        />

        <div>
          <label className="mb-2 block text-base font-medium text-gray-700">
            District <span className="text-danger">*</span>
          </label>
          <select
            value={formData.lastSeenDistrict}
            onChange={(e) => updateField('lastSeenDistrict', e.target.value)}
            className={clsx(
              'w-full rounded-md border px-3 py-2 text-base min-h-touch focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20',
              errors.lastSeenDistrict ? 'border-danger' : 'border-gray-300'
            )}
          >
            <option value="">Select District</option>
            {DISTRICTS.map(district => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
          {errors.lastSeenDistrict && (
            <p className="mt-1 text-sm text-danger">{errors.lastSeenDistrict}</p>
          )}
        </div>

        <Input
          label="Last Seen Date"
          type="date"
          value={formData.lastSeenDate}
          onChange={(e) => updateField('lastSeenDate', e.target.value)}
        />

        <div>
          <label className="mb-2 block text-base font-medium text-gray-700">
            Description <span className="text-gray-500 text-sm">(Optional)</span>
          </label>
          <textarea
            value={formData.clothing}
            onChange={(e) => updateField('clothing', e.target.value)}
            placeholder="e.g., Blue shirt, black trousers, physical description, or other details"
            rows={4}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-base focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20"
          />
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">Your Contact Details</h3>

        <Input
          label="Your Name"
          value={formData.reporterName}
          onChange={(e) => updateField('reporterName', e.target.value)}
          required
          error={errors.reporterName}
        />

        <Input
          label="Phone Number"
          type="tel"
          value={formData.reporterPhone}
          onChange={(e) => updateField('reporterPhone', e.target.value)}
          placeholder="e.g., 0771234567"
          required
          error={errors.reporterPhone}
        />

        <Input
          label="Alternative Contact"
          type="tel"
          value={formData.alternativeContact}
          onChange={(e) => updateField('alternativeContact', e.target.value)}
          helperText="(Optional)"
        />

        <div className={clsx(
          'rounded-md border p-3',
          errors.consent ? 'border-danger bg-red-50' : 'border-gray-300 bg-gray-50'
        )}>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.consent}
              onChange={(e) => updateField('consent', e.target.checked)}
              className="mt-0.5 h-5 w-5 rounded text-primary focus:ring-primary"
            />
            <span className="text-sm">
              ☑ I authorize iSafe to share this publicly
            </span>
          </label>
          {errors.consent && (
            <p className="mt-2 text-sm text-danger">{errors.consent}</p>
          )}
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        fullWidth
        size="large"
        disabled={isSubmitting || !formData.consent}
      >
        {isSubmitting ? 'Creating Report...' : 'Create Report'}
      </Button>
    </div>
  );
}
