'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';

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
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showAccessCode, setShowAccessCode] = useState(false);

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

      <div className="relative">
        <Input
          label={`${accessCodeLabel || t('accessCode')} *`}
          type={showAccessCode ? 'text' : 'password'}
          {...register('accessCode')}
          error={errors.accessCode?.message}
          placeholder="••••••"
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setShowAccessCode(!showAccessCode)}
          className="absolute right-3 top-[52px] text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded p-1 transition-colors"
          aria-label={showAccessCode ? 'Hide access code' : 'Show access code'}
        >
          {showAccessCode ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>

      <Alert variant="info">
        {t('authHint')}
      </Alert>

      <Button type="submit" fullWidth disabled={isSubmitting}>
        {isSubmitting ? tCommon('loading') : (submitButtonText || t('login'))}
      </Button>
    </form>
  );
}
