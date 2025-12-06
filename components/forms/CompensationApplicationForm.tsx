'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button, Input, Toast, Alert } from '@/components/ui';
import { PhoneVerificationField } from '@/components/features/PhoneVerificationField';
import type { ClaimType } from '@/lib/utils/validation';
import clsx from 'clsx';

type Step = 1 | 2 | 3 | 4 | 5;

interface FormData {
  // Step 1: Personal Information
  applicantName: string;
  applicantNic: string;
  applicantPhone: string;
  applicantAddress: string;

  // Step 2: Location
  district: string;
  divisionalSecretariat: string;
  gramaNiladhariDivision: string;

  // Step 3: Claims
  claims: ClaimType[];

  // Step 4: Phone Verification
  phoneVerified: boolean;
}

interface CompensationApplicationFormProps {
  locale: string;
}

const CLAIM_TYPES: ClaimType[] = [
  'CLEANING_ALLOWANCE',
  'KITCHEN_UTENSILS',
  'LIVELIHOOD_ALLOWANCE',
  'RENTAL_ALLOWANCE',
  'CROP_DAMAGE_PADDY',
  'CROP_DAMAGE_VEGETABLES',
  'LIVESTOCK_FARM',
  'SMALL_ENTERPRISE',
  'FISHING_BOAT',
  'SCHOOL_SUPPLIES',
  'BUSINESS_BUILDING',
  'NEW_HOUSE_CONSTRUCTION',
  'LAND_PURCHASE',
  'HOUSE_REPAIR',
  'DEATH_DISABILITY',
];

export function CompensationApplicationForm({ locale }: CompensationApplicationFormProps) {
  const t = useTranslations('compensation');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Administrative divisions data
  const [districts, setDistricts] = useState<string[]>([]);
  const [secretariats, setSecretariats] = useState<string[]>([]);
  const [gnDivisions, setGnDivisions] = useState<string[]>([]);
  const [loadingSecretariats, setLoadingSecretariats] = useState(false);
  const [loadingGnDivisions, setLoadingGnDivisions] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    applicantName: '',
    applicantNic: '',
    applicantPhone: '',
    applicantAddress: '',
    district: '',
    divisionalSecretariat: '',
    gramaNiladhariDivision: '',
    claims: [],
    phoneVerified: false,
  });

  // Load districts on mount
  useEffect(() => {
    loadDistricts();
  }, []);

  // Load secretariats when district changes
  useEffect(() => {
    if (formData.district) {
      loadSecretariats(formData.district);
      // Reset dependent fields
      setFormData(prev => ({
        ...prev,
        divisionalSecretariat: '',
        gramaNiladhariDivision: '',
      }));
      setGnDivisions([]);
    }
  }, [formData.district]);

  // Load GN divisions when secretariat changes
  useEffect(() => {
    if (formData.district && formData.divisionalSecretariat) {
      loadGnDivisions(formData.district, formData.divisionalSecretariat);
      setFormData(prev => ({ ...prev, gramaNiladhariDivision: '' }));
    }
  }, [formData.divisionalSecretariat]);

  const loadDistricts = async () => {
    try {
      const response = await fetch('/api/compensation/divisions?type=districts');
      const data = await response.json();
      if (data.success) {
        setDistricts(data.data);
      }
    } catch (error) {
      console.error('Failed to load districts:', error);
    }
  };

  const loadSecretariats = async (district: string) => {
    try {
      setLoadingSecretariats(true);
      const response = await fetch(
        `/api/compensation/divisions?type=secretariats&district=${encodeURIComponent(district)}`
      );
      const data = await response.json();
      if (data.success) {
        setSecretariats(data.data);
      }
    } catch (error) {
      console.error('Failed to load secretariats:', error);
    } finally {
      setLoadingSecretariats(false);
    }
  };

  const loadGnDivisions = async (district: string, secretariat: string) => {
    try {
      setLoadingGnDivisions(true);
      const response = await fetch(
        `/api/compensation/divisions?type=gn_divisions&district=${encodeURIComponent(
          district
        )}&divisionalSecretariat=${encodeURIComponent(secretariat)}`
      );
      const data = await response.json();
      if (data.success) {
        setGnDivisions(data.data);
      }
    } catch (error) {
      console.error('Failed to load GN divisions:', error);
    } finally {
      setLoadingGnDivisions(false);
    }
  };

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

  const toggleClaim = (claimType: ClaimType) => {
    setFormData(prev => {
      const claims = prev.claims.includes(claimType)
        ? prev.claims.filter(c => c !== claimType)
        : [...prev.claims, claimType];
      return { ...prev, claims };
    });
    if (errors.claims) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.claims;
        return newErrors;
      });
    }
  };

  const validateStep = (currentStep: Step): boolean => {
    const newErrors: Partial<Record<string, string>> = {};

    switch (currentStep) {
      case 1:
        if (!formData.applicantName.trim()) newErrors.applicantName = 'Name is required';
        if (!formData.applicantNic.trim()) newErrors.applicantNic = 'NIC is required';
        if (!formData.applicantPhone.trim()) newErrors.applicantPhone = 'Phone is required';
        if (!formData.applicantAddress.trim()) newErrors.applicantAddress = 'Address is required';
        break;

      case 2:
        if (!formData.district) newErrors.district = 'District is required';
        if (!formData.divisionalSecretariat)
          newErrors.divisionalSecretariat = 'Divisional Secretariat is required';
        if (!formData.gramaNiladhariDivision)
          newErrors.gramaNiladhariDivision = 'Grama Niladhari Division is required';
        break;

      case 3:
        if (formData.claims.length === 0) newErrors.claims = 'Select at least one claim type';
        break;

      case 4:
        if (!formData.phoneVerified) newErrors.phoneVerified = 'Phone verification is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(5, prev + 1) as Step);
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(1, prev - 1) as Step);
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch('/api/compensation/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicantName: formData.applicantName,
          applicantNic: formData.applicantNic,
          applicantPhone: formData.applicantPhone,
          applicantAddress: formData.applicantAddress,
          district: formData.district,
          divisionalSecretariat: formData.divisionalSecretariat,
          gramaNiladhariDivision: formData.gramaNiladhariDivision,
          claims: formData.claims,
          phoneVerified: formData.phoneVerified,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      // Redirect to success page with application code
      router.push(`/${locale}/compensation/success?code=${data.applicationCode}`);
    } catch (error: any) {
      setToastType('error');
      setToastMessage(error.message || 'Failed to submit application');
      setShowToast(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                  s <= step
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-600'
                )}
              >
                {s}
              </div>
              {s < 5 && (
                <div
                  className={clsx(
                    'w-12 h-1 mx-1',
                    s < step ? 'bg-primary' : 'bg-gray-200'
                  )}
                />
              )}
            </div>
          ))}
        </div>
        <div className="text-sm text-gray-600 text-center mt-2">
          {step === 1 && t('steps.personal')}
          {step === 2 && t('steps.location')}
          {step === 3 && t('steps.claims')}
          {step === 4 && t('steps.verification')}
          {step === 5 && t('steps.review')}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Step 1: Personal Information */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">{t('personalInfo.title')}</h2>

            <div className="space-y-4">
              <Input
                label={t('personalInfo.fullName')}
                value={formData.applicantName}
                onChange={(e) => updateField('applicantName', e.target.value)}
                placeholder={t('personalInfo.fullNamePlaceholder')}
                error={errors.applicantName}
                required
              />

              <Input
                label={t('personalInfo.nic')}
                value={formData.applicantNic}
                onChange={(e) => updateField('applicantNic', e.target.value.toUpperCase())}
                placeholder={t('personalInfo.nicPlaceholder')}
                error={errors.applicantNic}
                required
              />

              <Input
                label={t('personalInfo.phone')}
                type="tel"
                value={formData.applicantPhone}
                onChange={(e) => updateField('applicantPhone', e.target.value)}
                placeholder={t('personalInfo.phonePlaceholder')}
                error={errors.applicantPhone}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('personalInfo.address')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.applicantAddress}
                  onChange={(e) => updateField('applicantAddress', e.target.value)}
                  placeholder={t('personalInfo.addressPlaceholder')}
                  rows={4}
                  className={clsx(
                    'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary',
                    errors.applicantAddress ? 'border-red-500' : 'border-gray-300'
                  )}
                />
                {errors.applicantAddress && (
                  <p className="mt-1 text-sm text-red-600">{errors.applicantAddress}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">{t('personalInfo.addressHint')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Location Information */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold mb-2">{t('locationInfo.title')}</h2>
            <p className="text-gray-600 mb-4">{t('locationInfo.description')}</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('locationInfo.district')} <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.district}
                  onChange={(e) => updateField('district', e.target.value)}
                  className={clsx(
                    'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary',
                    errors.district ? 'border-red-500' : 'border-gray-300'
                  )}
                >
                  <option value="">{t('locationInfo.selectDistrict')}</option>
                  {districts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                {errors.district && (
                  <p className="mt-1 text-sm text-red-600">{errors.district}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('locationInfo.divisionalSecretariat')} <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.divisionalSecretariat}
                  onChange={(e) => updateField('divisionalSecretariat', e.target.value)}
                  disabled={!formData.district || loadingSecretariats}
                  className={clsx(
                    'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary',
                    errors.divisionalSecretariat ? 'border-red-500' : 'border-gray-300',
                    (!formData.district || loadingSecretariats) && 'bg-gray-100'
                  )}
                >
                  <option value="">
                    {loadingSecretariats ? tCommon('loading') : t('locationInfo.selectDS')}
                  </option>
                  {secretariats.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {errors.divisionalSecretariat && (
                  <p className="mt-1 text-sm text-red-600">{errors.divisionalSecretariat}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('locationInfo.gramaNiladhari')} <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.gramaNiladhariDivision}
                  onChange={(e) => updateField('gramaNiladhariDivision', e.target.value)}
                  disabled={!formData.divisionalSecretariat || loadingGnDivisions}
                  className={clsx(
                    'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary',
                    errors.gramaNiladhariDivision ? 'border-red-500' : 'border-gray-300',
                    (!formData.divisionalSecretariat || loadingGnDivisions) && 'bg-gray-100'
                  )}
                >
                  <option value="">
                    {loadingGnDivisions ? tCommon('loading') : t('locationInfo.selectGN')}
                  </option>
                  {gnDivisions.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                {errors.gramaNiladhariDivision && (
                  <p className="mt-1 text-sm text-red-600">{errors.gramaNiladhariDivision}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Claims Selection */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold mb-2">{t('claimsSelection.title')}</h2>
            <p className="text-gray-600 mb-4">{t('claimsSelection.description')}</p>

            {errors.claims && (
              <Alert type="error" className="mb-4">
                {errors.claims}
              </Alert>
            )}

            <div className="mb-4 text-sm font-medium text-primary">
              {t('claimsSelection.selectedClaims', { count: formData.claims.length })}
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {CLAIM_TYPES.map((claimType) => (
                <label
                  key={claimType}
                  className={clsx(
                    'flex items-start p-4 border rounded-md cursor-pointer transition-all',
                    formData.claims.includes(claimType)
                      ? 'border-primary bg-blue-50'
                      : 'border-gray-300 hover:border-primary'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={formData.claims.includes(claimType)}
                    onChange={() => toggleClaim(claimType)}
                    className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <div className="ml-3 flex-1">
                    <div className="font-medium text-gray-900">
                      {t(`claims.${claimType}.title`)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {t(`claims.${claimType}.description`)}
                    </div>
                    <div className="text-sm font-medium text-primary mt-1">
                      {t(`claims.${claimType}.amount`)}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Phone Verification */}
        {step === 4 && (
          <div>
            <h2 className="text-2xl font-bold mb-2">{t('verification.title')}</h2>
            <p className="text-gray-600 mb-4">{t('verification.description')}</p>

            <PhoneVerificationField
              phoneNumber={formData.applicantPhone}
              onVerified={(phone) => {
                updateField('phoneVerified', true);
              }}
              onPhoneChange={(phone) => updateField('applicantPhone', phone)}
            />

            {errors.phoneVerified && (
              <Alert type="error" className="mt-4">
                {errors.phoneVerified}
              </Alert>
            )}
          </div>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <div>
            <h2 className="text-2xl font-bold mb-2">{t('review.title')}</h2>
            <p className="text-gray-600 mb-6">{t('review.description')}</p>

            <div className="space-y-6">
              {/* Applicant Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-lg">{t('review.applicantDetails')}</h3>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-sm text-primary hover:underline"
                  >
                    {t('review.editSection')}
                  </button>
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Name:</span> {formData.applicantName}</p>
                  <p><span className="font-medium">NIC:</span> {formData.applicantNic}</p>
                  <p><span className="font-medium">Phone:</span> {formData.applicantPhone}</p>
                  <p><span className="font-medium">Address:</span> {formData.applicantAddress}</p>
                </div>
              </div>

              {/* Location Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-lg">{t('review.locationDetails')}</h3>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-sm text-primary hover:underline"
                  >
                    {t('review.editSection')}
                  </button>
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">District:</span> {formData.district}</p>
                  <p><span className="font-medium">DS:</span> {formData.divisionalSecretariat}</p>
                  <p><span className="font-medium">GN:</span> {formData.gramaNiladhariDivision}</p>
                </div>
              </div>

              {/* Selected Claims */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-lg">
                    {t('review.selectedClaims')} ({formData.claims.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="text-sm text-primary hover:underline"
                  >
                    {t('review.editSection')}
                  </button>
                </div>
                <ul className="space-y-1 text-sm list-disc list-inside">
                  {formData.claims.map((claimType) => (
                    <li key={claimType}>{t(`claims.${claimType}.title`)}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          {step > 1 && (
            <Button variant="secondary" onClick={handleBack} disabled={isSubmitting}>
              {tCommon('back')}
            </Button>
          )}

          <div className="ml-auto">
            {step < 5 ? (
              <Button onClick={handleNext}>
                {tCommon('next')}
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? tCommon('submitting') : t('review.submitApplication')}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
