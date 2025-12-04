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
}

export function ShelterAuthForm({ locale }: ShelterAuthFormProps) {
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
      const response = await fetch('/api/auth/shelter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Authentication failed');
      }

      // Redirect to registration page
      router.push(`/${locale}/register`);
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
        label={`${t('shelterCode')} *`}
        {...register('shelterCode')}
        error={errors.shelterCode?.message}
        placeholder="CMB-CC-001"
        autoCapitalize="characters"
      />

      <Input
        label={`${t('accessCode')} *`}
        type="password"
        {...register('accessCode')}
        error={errors.accessCode?.message}
        placeholder="••••••"
      />

      <Alert variant="info">
        {t('authHint')}
      </Alert>

      <Button type="submit" fullWidth disabled={isSubmitting}>
        {isSubmitting ? tCommon('loading') : t('login')}
      </Button>
    </form>
  );
}
