'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Toast } from '@/components/ui';
import { compressImage, validateImageFile } from '@/lib/utils/imageCompression';
import clsx from 'clsx';

type Step = 1 | 2 | 3;
type Gender = 'MALE' | 'FEMALE' | 'OTHER';

interface FormData {
  // Step 1: Person Details
  photoFile: File | null;
  photoPreview: string | null;
  fullName: string;
  age: string;
  gender: Gender | '';
  
  // Step 2: Last Known Details
  lastSeenLocation: string;
  lastSeenDistrict: string;
  lastSeenDate: string;
  clothing: string;
  
  // Step 3: Contact Info
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

export function MissingPersonFormMultiStep({ locale }: MissingPersonFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null); // Already uploaded URL
  const [showToast, setShowToast] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    photoFile: null,
    photoPreview: null,
    fullName: '',
    age: '',
    gender: '',
    lastSeenLocation: '',
    lastSeenDistrict: '',
    lastSeenDate: new Date().toISOString().split('T')[0], // Default to today
    clothing: '',
    reporterName: '',
    reporterPhone: '',
    alternativeContact: '',
    consent: false,
  });

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user updates field
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
      setPhotoUrl(null); // Reset previous upload
      
      // Compress image first
      const compressedFile = await compressImage(file);
      
      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          photoFile: compressedFile,
          photoPreview: reader.result as string,
        }));
      };
      reader.readAsDataURL(compressedFile);
      
      // Start uploading to Cloudinary in the background
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

      // Store the uploaded URL for later use
      setPhotoUrl(uploadData.url);
      setUploadingPhoto(false);
      setUploadError(null);
    } catch (error) {
      setUploadError('Failed to process or upload image');
      setUploadingPhoto(false);
      console.error('Image processing/upload error:', error);
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    
    if (!formData.photoFile) {
      newErrors.photoFile = 'Photo is required';
    }
    if (!formData.fullName || formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name is required (minimum 2 characters)';
    }
    if (!formData.age || Number(formData.age) < 0 || Number(formData.age) > 120) {
      newErrors.age = 'Valid age is required';
    }
    if (!formData.gender) {
      newErrors.gender = 'Please select gender';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    
    if (!formData.lastSeenLocation || formData.lastSeenLocation.trim().length < 2) {
      newErrors.lastSeenLocation = 'Last known location is required';
    }
    if (!formData.lastSeenDistrict) {
      newErrors.lastSeenDistrict = 'District is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    
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

  const handleContinueStep1 = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleContinueStep2 = () => {
    if (validateStep2()) {
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;

    // Check if photo is still uploading
    if (uploadingPhoto) {
      alert('Please wait for the photo to finish uploading');
      return;
    }

    // Check if photo upload failed
    if (formData.photoFile && !photoUrl) {
      alert('Photo upload failed. Please try selecting the photo again.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Use already uploaded photo URL (uploaded in background)
      const finalPhotoUrl = photoUrl || '';

      // Get or create anonymous user ID
      const { getOrCreateAnonymousUserId, setAnonymousUserIdCookieClient } = await import('@/lib/utils/anonymousUser');
      const anonymousUserId = getOrCreateAnonymousUserId();
      
      // Sync to cookie
      if (anonymousUserId) {
        setAnonymousUserIdCookieClient(anonymousUserId);
      }

      // Create missing person record
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
      
      // Show success toast
      setShowToast(true);
      
      // Redirect to missing persons list page after toast is shown
      setTimeout(() => {
        router.push(`/${locale}/missing`);
      }, 2000); // Wait 2 seconds for toast to be visible
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to create report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Progress Indicator Component
  const ProgressIndicator = () => (
    <div className="mb-8 flex items-center justify-center">
      <div className="flex items-center gap-2">
        {/* Step 1 */}
        <div className={clsx(
          'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold',
          step >= 1 ? 'bg-primary text-white' : 'border-2 border-gray-300 text-gray-400'
        )}>
          {step > 1 ? '✓' : '1'}
        </div>
        
        {/* Line */}
        <div className={clsx('h-0.5 w-8', step >= 2 ? 'bg-primary' : 'bg-gray-300')} />
        
        {/* Step 2 */}
        <div className={clsx(
          'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold',
          step >= 2 ? 'bg-primary text-white' : 'border-2 border-gray-300 text-gray-400'
        )}>
          {step > 2 ? '✓' : '2'}
        </div>
        
        {/* Line */}
        <div className={clsx('h-0.5 w-8', step >= 3 ? 'bg-primary' : 'bg-gray-300')} />
        
        {/* Step 3 */}
        <div className={clsx(
          'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold',
          step >= 3 ? 'bg-primary text-white' : 'border-2 border-gray-300 text-gray-400'
        )}>
          3
        </div>
      </div>
    </div>
  );

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
      <ProgressIndicator />

      {/* Step 1: Person Details */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Report Missing Person</h2>
          
          {/* Photo Upload */}
          <div>
            <label className="mb-2 block text-base font-medium text-gray-700">
              Photo <span className="text-danger">*</span>
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
                    <span className="mt-1 block text-sm text-gray-600">Maximum 5MB</span>
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

          {/* Full Name */}
          <Input
            label="Full Name"
            value={formData.fullName}
            onChange={(e) => updateField('fullName', e.target.value)}
            required
            error={errors.fullName}
          />

          {/* Age */}
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

          {/* Gender */}
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

          <Button onClick={handleContinueStep1} fullWidth size="large">
            Continue
          </Button>
        </div>
      )}

      {/* Step 2: Last Known Details */}
      {step === 2 && (
        <div className="space-y-4">
          <button
            onClick={() => setStep(1)}
            className="mb-4 inline-flex items-center rounded text-base text-primary hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            ← Back
          </button>

          <h2 className="text-2xl font-bold text-gray-900">Last Known Details</h2>

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
              What were they wearing?
            </label>
            <textarea
              value={formData.clothing}
              onChange={(e) => updateField('clothing', e.target.value)}
              placeholder="e.g., Blue shirt, black trousers"
              rows={4}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-base focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20"
            />
          </div>

          <Button onClick={handleContinueStep2} fullWidth size="large">
            Continue
          </Button>
        </div>
      )}

      {/* Step 3: Contact Info */}
      {step === 3 && (
        <div className="space-y-4">
          <button
            onClick={() => setStep(2)}
            className="mb-4 inline-flex items-center rounded text-base text-primary hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            ← Back
          </button>

          <h2 className="text-2xl font-bold text-gray-900">Your Contact Details</h2>

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

          <Button
            onClick={handleSubmit}
            fullWidth
            size="large"
            disabled={isSubmitting || !formData.consent}
          >
            {isSubmitting ? 'Creating Poster...' : 'Create Poster'}
          </Button>
        </div>
      )}
    </div>
  );
}

