'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import { compressImage, validateImageFile } from '@/lib/utils/imageCompression';
import { PhoneVerificationField } from '@/components/features/PhoneVerificationField';
import { useLowBandwidth } from '@/lib/contexts/LowBandwidthContext';
import clsx from 'clsx';

type Gender = 'MALE' | 'FEMALE' | 'OTHER';

interface FormData {
  photoFile: File | null;
  photoPreview: string | null;
  fullName: string;
  age: string;
  gender: Gender | '';
  nic: string;
  lastSeenLocation: string;
  lastSeenDistrict: string;
  lastSeenDate: string;
  clothing: string;
  reporterName: string;
  reporterPhone: string;
  alternativeContact: string;
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
  const t = useTranslations('missing');
  const tCommon = useTranslations('common');
  const { isLowBandwidth } = useLowBandwidth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState<string>('');
  const [anonymousUserId, setAnonymousUserId] = useState<string>('');
  
  const [formData, setFormData] = useState<FormData>({
    photoFile: null,
    photoPreview: null,
    fullName: '',
    age: '',
    gender: '',
    nic: '',
    lastSeenLocation: '',
    lastSeenDistrict: '',
    lastSeenDate: new Date().toISOString().split('T')[0],
    clothing: '',
    reporterName: '',
    reporterPhone: '',
    alternativeContact: '',
  });

  // Initialize anonymous user ID on mount
  useEffect(() => {
    const initAnonymousUser = async () => {
      const { getOrCreateAnonymousUserId } = await import('@/lib/utils/anonymousUser');
      const userId = getOrCreateAnonymousUserId();
      setAnonymousUserId(userId);
    };
    initAnonymousUser();
  }, []);

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
    if (!phoneVerified || verifiedPhone !== formData.reporterPhone) {
      newErrors.reporterPhone = 'Phone number must be verified before submitting';
    }
    if (formData.clothing && formData.clothing.trim().length > 500) {
      newErrors.clothing = 'Description must be at most 500 characters';
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
      
      // Ensure phone is verified before submitting
      if (!phoneVerified || verifiedPhone !== formData.reporterPhone) {
        alert('Please verify your phone number before submitting');
        setIsSubmitting(false);
        return;
      }

      const response = await fetch('/api/missing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
          fullName: formData.fullName.trim(),
          age: Number(formData.age),
          gender: formData.gender,
          nic: formData.nic.trim() || undefined,
          photoUrl: finalPhotoUrl,
          lastSeenLocation: formData.lastSeenLocation.trim(),
          lastSeenDistrict: formData.lastSeenDistrict,
          lastSeenDate: formData.lastSeenDate,
          clothing: formData.clothing.trim() || undefined,
          reporterName: formData.reporterName.trim(),
          reporterPhone: formData.reporterPhone.trim(),
          alternativeContact: formData.alternativeContact.trim() || undefined,
          anonymousUserId,
          locale,
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

      <h2 className="text-2xl font-bold text-gray-900">{t('title')}</h2>

      {/* Photo Upload - Optional */}
        <div>
        <label className="mb-2 block text-base font-medium text-gray-700">
          {t('photo')} <span className="text-gray-500 text-sm">({tCommon('optional')})</span>
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
            {formData.photoPreview && !isLowBandwidth ? (
              <img
                src={formData.photoPreview}
                alt="Preview"
                className="h-full w-full rounded-lg object-contain"
              />
            ) : (
              <div className="text-center">
                {!isLowBandwidth && <span className="mb-2 block text-5xl" aria-hidden="true">📷</span>}
                <span className="block text-base font-medium text-primary">{t('uploadPhoto')}</span>
                <span className="mt-1 block text-sm text-gray-600">{t('photoHint')}</span>
                {isLowBandwidth && photoUrl && (
                  <span className="mt-2 block text-sm text-green-600">Photo uploaded</span>
                )}
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
          <p className="mt-1 text-sm text-green-600">{isLowBandwidth ? 'Photo uploaded successfully' : '✓ Photo uploaded successfully'}</p>
        )}
      </div>

      {/* Person Details */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">{t('personDetails')}</h3>

        <Input
          label={t('fullName')}
          value={formData.fullName}
          onChange={(e) => updateField('fullName', e.target.value)}
          placeholder={t('fullNamePlaceholder')}
          required
          error={errors.fullName}
        />

        <Input
          label={t('age')}
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
          <label className="mb-2 block text-base font-medium text-gray-700">
            {t('gender')} <span className="text-danger">*</span>
          </label>
          <select
            value={formData.gender}
            onChange={(e) => updateField('gender', e.target.value as Gender)}
            className={clsx(
              'w-full rounded-md border px-3 py-2 text-base min-h-touch focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20',
              errors.gender ? 'border-danger' : 'border-gray-300'
            )}
            required
          >
            <option value="">{t('selectGender')}</option>
            <option value="MALE">{t('male')}</option>
            <option value="FEMALE">{t('female')}</option>
            <option value="OTHER">{t('other')}</option>
          </select>
          {errors.gender && (
            <p className="mt-1 text-sm text-danger">{errors.gender}</p>
          )}
        </div>

        <Input
          label={
            <>
              NIC Number <span className="text-gray-500 text-sm font-normal">({tCommon('optional')})</span>
            </>
          }
          value={formData.nic}
          onChange={(e) => updateField('nic', e.target.value)}
          placeholder="e.g., 951234567V or 199512345678"
        />
      </div>

      {/* Last Known Details */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">{t('lastKnownDetails')}</h3>

        <Input
          label={t('lastSeenLocation')}
          value={formData.lastSeenLocation}
          onChange={(e) => updateField('lastSeenLocation', e.target.value)}
          placeholder={t('lastSeenLocationPlaceholder')}
          required
          error={errors.lastSeenLocation}
        />

        <div>
          <label className="mb-2 block text-base font-medium text-gray-700">
            {t('district')} <span className="text-danger">*</span>
          </label>
          <select
            value={formData.lastSeenDistrict}
            onChange={(e) => updateField('lastSeenDistrict', e.target.value)}
            className={clsx(
              'w-full rounded-md border px-3 py-2 text-base min-h-touch focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20',
              errors.lastSeenDistrict ? 'border-danger' : 'border-gray-300'
            )}
          >
            <option value="">{t('selectDistrict')}</option>
            {DISTRICTS.map(district => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
          {errors.lastSeenDistrict && (
            <p className="mt-1 text-sm text-danger">{errors.lastSeenDistrict}</p>
          )}
        </div>

        <Input
          label={t('lastSeenDate')}
          type="date"
          value={formData.lastSeenDate}
          onChange={(e) => updateField('lastSeenDate', e.target.value)}
        />

        <div>
          <label className="mb-2 block text-base font-medium text-gray-700">
            {t('clothing')} <span className="text-gray-500 text-sm">({tCommon('optional')})</span>
          </label>
          <textarea
            value={formData.clothing}
            onChange={(e) => updateField('clothing', e.target.value)}
            placeholder={t('clothingPlaceholder')}
            rows={4}
            maxLength={500}
            className={clsx(
              'w-full rounded-md border px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:ring-opacity-20',
              errors.clothing ? 'border-danger focus:border-danger' : 'border-gray-300 focus:border-primary'
            )}
          />
          <div className="mt-1 flex items-center justify-between">
            {errors.clothing && (
              <p className="text-sm text-danger">{errors.clothing}</p>
            )}
            <p className={clsx(
              'text-xs ml-auto',
              formData.clothing.length > 500 ? 'text-danger' : formData.clothing.length > 450 ? 'text-yellow-600' : 'text-gray-500'
            )}>
              {formData.clothing.length}/500
            </p>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">{t('contactInfo')}</h3>

        <Input
          label={t('yourName')}
          value={formData.reporterName}
          onChange={(e) => updateField('reporterName', e.target.value)}
          placeholder={t('yourNamePlaceholder')}
          required
          error={errors.reporterName}
        />

        <PhoneVerificationField
          phone={formData.reporterPhone}
          onPhoneChange={(phone) => updateField('reporterPhone', phone)}
          onVerified={(phone) => {
            setPhoneVerified(true);
            setVerifiedPhone(phone);
            setFormData(prev => ({ ...prev, reporterPhone: phone }));
          }}
          error={errors.reporterPhone}
          required
          label={t('yourPhone')}
          placeholder="e.g., 0771234567"
          anonymous={true}
          anonymousUserId={anonymousUserId}
          purpose="missing_report"
        />

        <Input
          label={
            <>
              {t('altContact')} <span className="text-gray-500 text-sm font-normal">({tCommon('optional')})</span>
            </>
          }
          type="tel"
          value={formData.alternativeContact}
          onChange={(e) => updateField('alternativeContact', e.target.value)}
        />

      </div>

      <Button
        onClick={handleSubmit}
        fullWidth
        size="large"
        disabled={isSubmitting || !phoneVerified || verifiedPhone !== formData.reporterPhone}
      >
        {isSubmitting ? tCommon('submitting') : t('createPoster')}
      </Button>
    </div>
  );
}
