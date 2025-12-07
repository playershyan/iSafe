'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { compressImage, validateImageFile } from '@/lib/utils/imageCompression';
import { useLowBandwidth } from '@/lib/contexts/LowBandwidthContext';

const registrationFormSchema = z.object({
  photoFile: z.instanceof(File).optional(),
  fullName: z.string().min(2).max(100),
  nic: z
    .string()
    .regex(/^(\d{9}[VvXx]|\d{12})$/, 'Invalid NIC format')
    .transform((val) => val.toUpperCase())
    .optional()
    .or(z.literal('')),
  age: z.coerce.number().min(0).max(120),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  contactNumber: z
    .string()
    .regex(/^0\d{9}$/, 'Phone must be 10 digits')
    .optional()
    .or(z.literal('')),
  specialNotes: z.string().max(500).optional(),
});

type RegistrationFormData = z.infer<typeof registrationFormSchema>;

interface MatchData {
  missingPersonId: string;
  posterCode: string;
  fullName: string;
  age: number;
  gender: string;
  photoUrl: string | null;
  lastSeenLocation: string;
  reporterPhone: string;
  matchScore: number;
  matchReasons: string[];
}

interface ShelterRegistrationFormProps {
  locale: string;
  shelterInfo: {
    id: string;
    name: string;
    code: string;
  };
}

export function ShelterRegistrationForm({ locale, shelterInfo }: ShelterRegistrationFormProps) {
  const { isLowBandwidth } = useLowBandwidth();
  const t = useTranslations('register');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [potentialMatches, setPotentialMatches] = useState<MatchData[]>([]);
  const [showMatches, setShowMatches] = useState(false);
  const [registeredPersonId, setRegisteredPersonId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationFormSchema),
  });

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setSubmitError(validation.error || 'Invalid file');
      return;
    }

    try {
      setSubmitError(null);
      const compressedFile = await compressImage(file);
      setValue('photoFile', compressedFile);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      setSubmitError('Failed to process image');
      console.error('Image processing error:', error);
    }
  };

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

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

      // Register person
      const registrationData = {
        fullName: data.fullName,
        age: data.age,
        gender: data.gender,
        nic: data.nic || null,
        photoUrl: photoUrl || null,
        contactNumber: data.contactNumber || null,
        specialNotes: data.specialNotes || null,
        shelterId: shelterInfo.id,
      };

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData),
      });

      if (!response.ok) {
        throw new Error('Failed to register person');
      }

      const result = await response.json();

      // Check for matches
      if (result.matches && result.matches.length > 0) {
        setPotentialMatches(result.matches);
        setRegisteredPersonId(result.personId);
        setShowMatches(true);
        setIsSubmitting(false);
      } else {
        // No matches, show success and reset form
        alert(t('registrationSuccess'));
        reset();
        setPhotoPreview(null);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setSubmitError(error instanceof Error ? error.message : 'Registration failed');
      setIsSubmitting(false);
    }
  };

  const handleConfirmMatch = async (matchId: string) => {
    if (!registeredPersonId) return;

    try {
      const response = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personId: registeredPersonId,
          missingPersonId: matchId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to confirm match');
      }

      alert(t('matchConfirmed'));
      setShowMatches(false);
      setPotentialMatches([]);
      setRegisteredPersonId(null);
      reset();
      setPhotoPreview(null);
    } catch (error) {
      console.error('Match confirmation error:', error);
      alert(t('matchError'));
    }
  };

  const handleSkipMatches = () => {
    alert(t('registrationSuccess'));
    setShowMatches(false);
    setPotentialMatches([]);
    setRegisteredPersonId(null);
    reset();
    setPhotoPreview(null);
  };

  if (showMatches) {
    return (
      <div className="space-y-6">
        <Alert variant="warning" title={t('potentialMatchesFound')}>
          {t('potentialMatchesText')}
        </Alert>

        <div className="space-y-4">
          {potentialMatches.map((match) => (
            <Card key={match.missingPersonId}>
              <div className="flex gap-4">
                {match.photoUrl && !isLowBandwidth && (
                  <img
                    src={match.photoUrl}
                    alt={match.fullName}
                    className="w-24 h-24 object-cover rounded"
                  />
                )}
                {match.photoUrl && isLowBandwidth && (
                  <div className="w-24 h-24 flex items-center justify-center bg-gray-200 text-xs text-gray-600 rounded">
                    Photo
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{match.fullName}</h3>
                  <p className="text-sm text-gray-600">
                    Age: {match.age} | {match.gender}
                  </p>
                  <p className="text-sm text-gray-600">
                    Last seen: {match.lastSeenLocation}
                  </p>
                  <p className="text-sm font-medium text-primary mt-2">
                    Match Score: {match.matchScore}%
                  </p>
                  <ul className="text-xs text-gray-500 mt-1">
                    {match.matchReasons.map((reason, idx) => (
                      <li key={idx}>• {reason}</li>
                    ))}
                  </ul>
                  <p className="text-sm text-gray-600 mt-2">
                    Contact: {match.reporterPhone}
                  </p>
                  <div className="mt-3">
                    <Button
                      onClick={() => handleConfirmMatch(match.missingPersonId)}
                      size="small"
                    >
                      {t('confirmMatch')}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Button onClick={handleSkipMatches} variant="secondary" fullWidth>
          {t('noMatch')}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Alert variant="info">
        {t('shelterInfo')}: <strong>{shelterInfo.name}</strong> ({shelterInfo.code})
      </Alert>

      {submitError && (
        <Alert variant="error" title={tCommon('error')}>
          {submitError}
        </Alert>
      )}

      {/* Photo upload */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('photo')} ({tCommon('optional')})
        </label>

        {photoPreview && !isLowBandwidth && (
          <div className="mb-3">
            <img
              src={photoPreview}
              alt="Preview"
              className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
            />
          </div>
        )}
        {photoPreview && isLowBandwidth && (
          <div className="mb-3 text-sm text-green-600">Photo uploaded</div>
        )}

        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoChange}
          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary-light file:text-primary hover:file:bg-primary-light"
        />
      </div>

      <Input
        label={`${t('fullName')} *`}
        {...register('fullName')}
        error={errors.fullName?.message}
        placeholder={t('fullNamePlaceholder')}
      />

      <Input
        label={t('nic')}
        {...register('nic')}
        error={errors.nic?.message}
        placeholder="951234567V or 199512345678"
      />

      <Input
        label={`${t('age')} *`}
        type="number"
        {...register('age')}
        error={errors.age?.message}
        placeholder="25"
      />

      <div>
        <label className="block text-sm font-medium mb-2">{t('gender')} *</label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input type="radio" value="MALE" {...register('gender')} className="mr-2" />
            {t('male')}
          </label>
          <label className="flex items-center">
            <input type="radio" value="FEMALE" {...register('gender')} className="mr-2" />
            {t('female')}
          </label>
          <label className="flex items-center">
            <input type="radio" value="OTHER" {...register('gender')} className="mr-2" />
            {t('other')}
          </label>
        </div>
        {errors.gender && <p className="mt-1 text-sm text-danger">{errors.gender.message}</p>}
      </div>

      <Input
        label={t('contactNumber')}
        type="tel"
        {...register('contactNumber')}
        error={errors.contactNumber?.message}
        placeholder="0771234567"
      />

      <div>
        <label className="block text-sm font-medium mb-2">
          {t('specialNotes')} ({tCommon('optional')})
        </label>
        <textarea
          {...register('specialNotes')}
          rows={3}
          className="w-full rounded border border-gray-300 px-3 py-2"
          placeholder={t('specialNotesPlaceholder')}
          maxLength={500}
        />
      </div>

      <Button type="submit" fullWidth disabled={isSubmitting}>
        {isSubmitting ? tCommon('submitting') : t('registerPerson')}
      </Button>
    </form>
  );
}
