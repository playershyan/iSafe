'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Alert } from '@/components/ui';
import { compressImage, validateImageFile } from '@/lib/utils/imageCompression';

const missingPersonFormSchema = z.object({
  // Step 1: Person details
  photoFile: z.instanceof(File).optional(),
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  age: z.coerce.number().min(0).max(120),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),

  // Step 2: Last known details
  lastSeenLocation: z.string().min(2).max(200),
  lastSeenDistrict: z.string().min(2),
  lastSeenDate: z.string().optional(),
  clothing: z.string().max(500).optional(),

  // Step 3: Reporter contact
  reporterName: z.string().min(2).max(100),
  reporterPhone: z.string().regex(/^0\d{9}$/, 'Phone must be 10 digits starting with 0'),
  consentGiven: z.boolean().refine(val => val === true, 'You must give consent to proceed'),
});

type MissingPersonFormData = z.infer<typeof missingPersonFormSchema>;

interface MissingPersonFormProps {
  locale: string;
}

export function MissingPersonForm({ locale }: MissingPersonFormProps) {
  const t = (key: string) => key;
  const tCommon = (key: string) => key;
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm<MissingPersonFormData>({
    resolver: zodResolver(missingPersonFormSchema),
    mode: 'onChange',
  });

  const photoFile = watch('photoFile');

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid file');
      return;
    }

    try {
      setUploadError(null);

      // Compress image
      const compressedFile = await compressImage(file);
      setValue('photoFile', compressedFile);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      setUploadError('Failed to process image');
      console.error('Image processing error:', error);
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof MissingPersonFormData)[] = [];

    if (step === 1) {
      fieldsToValidate = ['fullName', 'age', 'gender'];
    } else if (step === 2) {
      fieldsToValidate = ['lastSeenLocation', 'lastSeenDistrict'];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const onSubmit = async (data: MissingPersonFormData) => {
    setIsSubmitting(true);
    setUploadError(null);

    try {
      let photoUrl = '';

      // Upload photo if provided
      if (data.photoFile) {
        const formData = new FormData();
        formData.append('file', data.photoFile);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload photo');
        }

        const uploadData = await uploadResponse.json();
        photoUrl = uploadData.url;
      }

      // Create missing person record
      const missingPersonData = {
        fullName: data.fullName,
        age: data.age,
        gender: data.gender,
        photoUrl,
        lastSeenLocation: data.lastSeenLocation,
        lastSeenDistrict: data.lastSeenDistrict,
        lastSeenDate: data.lastSeenDate,
        clothing: data.clothing,
        reporterName: data.reporterName,
        reporterPhone: data.reporterPhone,
      };

      const response = await fetch('/api/missing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(missingPersonData),
      });

      if (!response.ok) {
        throw new Error('Failed to create missing person report');
      }

      const result = await response.json();

      // Redirect to poster page with poster code
      router.push(`/${locale}/missing/poster/${result.posterCode}`);
    } catch (error) {
      console.error('Submission error:', error);
      setUploadError(error instanceof Error ? error.message : 'Submission failed');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium ${step >= 1 ? 'text-primary' : 'text-gray-400'}`}>
            {t('step1')}
          </span>
          <span className={`text-sm font-medium ${step >= 2 ? 'text-primary' : 'text-gray-400'}`}>
            {t('step2')}
          </span>
          <span className={`text-sm font-medium ${step >= 3 ? 'text-primary' : 'text-gray-400'}`}>
            {t('step3')}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {uploadError && (
        <Alert variant="error" title={tCommon('error')}>
          {uploadError}
        </Alert>
      )}

      {/* Step 1: Person Details */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">{t('personDetails')}</h2>

          {/* Photo upload */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('photo')} ({tCommon('optional')})
            </label>

            {photoPreview && (
              <div className="mb-3">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
                />
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary-light file:text-primary hover:file:bg-primary-light"
            />
            <p className="mt-1 text-xs text-gray-500">
              {t('photoHint')}
            </p>
          </div>

          <Input
            label={`${t('fullName')} *`}
            {...register('fullName')}
            error={errors.fullName?.message}
            placeholder={t('fullNamePlaceholder')}
          />

          <Input
            label={`${t('age')} *`}
            type="number"
            {...register('age')}
            error={errors.age?.message}
            placeholder="25"
          />

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('gender')} *
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="MALE"
                  {...register('gender')}
                  className="mr-2"
                />
                {t('male')}
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="FEMALE"
                  {...register('gender')}
                  className="mr-2"
                />
                {t('female')}
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="OTHER"
                  {...register('gender')}
                  className="mr-2"
                />
                {t('other')}
              </label>
            </div>
            {errors.gender && (
              <p className="mt-1 text-sm text-danger">{errors.gender.message}</p>
            )}
          </div>

          <Button type="button" onClick={nextStep} fullWidth>
            {tCommon('next')}
          </Button>
        </div>
      )}

      {/* Step 2: Last Known Details */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">{t('lastKnownDetails')}</h2>

          <Input
            label={`${t('lastSeenLocation')} *`}
            {...register('lastSeenLocation')}
            error={errors.lastSeenLocation?.message}
            placeholder={t('lastSeenLocationPlaceholder')}
          />

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('district')} *
            </label>
            <select
              {...register('lastSeenDistrict')}
              className="w-full rounded border border-gray-300 px-3 py-2 min-h-touch"
            >
              <option value="">{t('selectDistrict')}</option>
              <option value="Colombo">Colombo</option>
              <option value="Gampaha">Gampaha</option>
              <option value="Kalutara">Kalutara</option>
              <option value="Kandy">Kandy</option>
              <option value="Matale">Matale</option>
              <option value="Nuwara Eliya">Nuwara Eliya</option>
              <option value="Galle">Galle</option>
              <option value="Matara">Matara</option>
              <option value="Hambantota">Hambantota</option>
              <option value="Jaffna">Jaffna</option>
              <option value="Kilinochchi">Kilinochchi</option>
              <option value="Mannar">Mannar</option>
              <option value="Vavuniya">Vavuniya</option>
              <option value="Mullaitivu">Mullaitivu</option>
              <option value="Batticaloa">Batticaloa</option>
              <option value="Ampara">Ampara</option>
              <option value="Trincomalee">Trincomalee</option>
              <option value="Kurunegala">Kurunegala</option>
              <option value="Puttalam">Puttalam</option>
              <option value="Anuradhapura">Anuradhapura</option>
              <option value="Polonnaruwa">Polonnaruwa</option>
              <option value="Badulla">Badulla</option>
              <option value="Moneragala">Moneragala</option>
              <option value="Ratnapura">Ratnapura</option>
              <option value="Kegalle">Kegalle</option>
            </select>
            {errors.lastSeenDistrict && (
              <p className="mt-1 text-sm text-danger">{errors.lastSeenDistrict.message}</p>
            )}
          </div>

          <Input
            label={t('lastSeenDate')}
            type="date"
            {...register('lastSeenDate')}
            error={errors.lastSeenDate?.message}
          />

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('clothing')} ({tCommon('optional')})
            </label>
            <textarea
              {...register('clothing')}
              rows={3}
              className="w-full rounded border border-gray-300 px-3 py-2"
              placeholder={t('clothingPlaceholder')}
              maxLength={500}
            />
            {errors.clothing && (
              <p className="mt-1 text-sm text-danger">{errors.clothing.message}</p>
            )}
          </div>

          <div className="flex gap-3">
            <Button type="button" onClick={prevStep} variant="secondary">
              {tCommon('back')}
            </Button>
            <Button type="button" onClick={nextStep} fullWidth>
              {tCommon('next')}
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Reporter Contact */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">{t('contactInfo')}</h2>

          <Input
            label={`${t('yourName')} *`}
            {...register('reporterName')}
            error={errors.reporterName?.message}
            placeholder={t('yourNamePlaceholder')}
          />

          <Input
            label={`${t('yourPhone')} *`}
            type="tel"
            {...register('reporterPhone')}
            error={errors.reporterPhone?.message}
            placeholder="0771234567"
          />

          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="flex items-start">
              <input
                type="checkbox"
                {...register('consentGiven')}
                className="mt-1 mr-3"
              />
              <span className="text-sm">
                {t('consentText')}
              </span>
            </label>
            {errors.consentGiven && (
              <p className="mt-2 text-sm text-danger">{errors.consentGiven.message}</p>
            )}
          </div>

          <Alert variant="info">
            {t('reviewInfo')}
          </Alert>

          <div className="flex gap-3">
            <Button type="button" onClick={prevStep} variant="secondary">
              {tCommon('back')}
            </Button>
            <Button type="submit" fullWidth disabled={isSubmitting}>
              {isSubmitting ? tCommon('submitting') : t('generatePoster')}
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}
