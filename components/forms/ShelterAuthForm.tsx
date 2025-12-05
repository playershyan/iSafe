'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Alert } from '@/components/ui';

const shelterAuthFormSchema = z.object({
  shelterCode: z.string().min(1, 'Shelter code is required'),
  accessCode: z.string().min(1, 'Access code is required'),
});

type ShelterAuthFormData = z.infer<typeof shelterAuthFormSchema>;

interface ShelterAuthFormProps {
  locale: string;
  shelterCodeLabel?: string;
  accessCodeLabel?: string;
  submitButtonText?: string;
  redirectTo?: string;
}

export function ShelterAuthForm({ locale, shelterCodeLabel, accessCodeLabel, submitButtonText, redirectTo }: ShelterAuthFormProps) {
  const t = (key: string) => key;
  const tCommon = (key: string) => key;
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShelterAuthFormData>({
    resolver: zodResolver(shelterAuthFormSchema),
  });

  const onSubmit = async (data: ShelterAuthFormData) => {
    setIsSubmitting(true);
    setAuthError(null);

    try {
      // Determine which API endpoint to use based on redirectTo
      const apiEndpoint = redirectTo?.includes('/staff') 
        ? '/api/auth/staff' 
        : '/api/auth/shelter';
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Authentication failed');
      }

      // Redirect to specified page or default to registration page
      const redirectPath = redirectTo || `/${locale}/register`;
      router.push(redirectPath);
    } catch (error) {
      console.error('Authentication error:', error);
      setAuthError(error instanceof Error ? error.message : 'Authentication failed');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {authError && (
        <Alert variant="error" title={tCommon('error')}>
          {authError}
        </Alert>
      )}

      <Input
        label={`${shelterCodeLabel || t('shelterCode')} *`}
        {...register('shelterCode')}
        error={errors.shelterCode?.message}
        placeholder="CMB-CC-001"
        autoCapitalize="characters"
      />

      <Input
        label={`${accessCodeLabel || t('accessCode')} *`}
        type="password"
        {...register('accessCode')}
        error={errors.accessCode?.message}
        placeholder="••••••"
      />

      <Alert variant="info">
        {t('authHint')}
      </Alert>

      <Button type="submit" fullWidth disabled={isSubmitting}>
        {isSubmitting ? tCommon('loading') : (submitButtonText || t('login'))}
      </Button>
    </form>
  );
}
