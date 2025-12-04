'use client';

import { useState } from 'react';
import { Button, Alert, Card } from '@/components/ui';
import { useTranslations } from 'next-intl';

interface PosterPreviewProps {
  posterCode: string;
  locale: string;
}

export function PosterPreview({ posterCode, locale }: PosterPreviewProps) {
  const t = useTranslations('poster');
  const tCommon = useTranslations('common');

  const [format, setFormat] = useState<'square' | 'story'>('square');
  const [shareSuccess, setShareSuccess] = useState(false);

  const posterUrl = `/api/poster?posterCode=${posterCode}&format=${format}`;
  const shareUrl = `${window.location.origin}/${locale}/missing/poster/${posterCode}`;

  const handleDownload = async () => {
    try {
      const response = await fetch(posterUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `missing-person-${posterCode}-${format}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert(t('downloadError'));
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('shareTitle'),
          text: t('shareText'),
          url: shareUrl,
        });
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 3000);
      } catch (error) {
        // User cancelled or error occurred
        console.error('Share error:', error);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 3000);
      } catch (error) {
        console.error('Copy error:', error);
        alert(t('copyError'));
      }
    }
  };

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(
      `${t('shareText')}\n\n${shareUrl}\n\n${t('posterCode')}: ${posterCode}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const handleFacebookShare = () => {
    const url = encodeURIComponent(shareUrl);
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      '_blank'
    );
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(t('shareText'));
    const url = encodeURIComponent(shareUrl);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      '_blank'
    );
  };

  return (
    <div className="space-y-6">
      {shareSuccess && (
        <Alert variant="success" title={t('shareSuccess')}>
          {t('shareSuccessText')}
        </Alert>
      )}

      <Card>
        <h2 className="mb-4 text-xl font-bold">{t('posterGenerated')}</h2>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">{t('posterCode')}:</p>
          <p className="text-2xl font-bold text-primary">{posterCode}</p>
          <p className="text-sm text-gray-500 mt-1">{t('posterCodeHint')}</p>
        </div>

        {/* Format selector */}
        <div className="mb-4">
          <p className="text-sm font-medium mb-2">{t('format')}:</p>
          <div className="flex gap-2">
            <Button
              variant={format === 'square' ? 'primary' : 'secondary'}
              onClick={() => setFormat('square')}
              size="small"
            >
              {t('square')} (1080x1080)
            </Button>
            <Button
              variant={format === 'story' ? 'primary' : 'secondary'}
              onClick={() => setFormat('story')}
              size="small"
            >
              {t('story')} (1080x1920)
            </Button>
          </div>
        </div>

        {/* Poster preview */}
        <div className="mb-4 border-2 border-gray-200 rounded-lg overflow-hidden">
          <img
            src={posterUrl}
            alt={`Missing person poster ${posterCode}`}
            className="w-full h-auto"
          />
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <Button onClick={handleDownload} fullWidth>
            ⬇️ {t('download')}
          </Button>

          <Button onClick={handleShare} variant="secondary" fullWidth>
            📤 {t('share')}
          </Button>

          <div className="pt-2 border-t">
            <p className="text-sm font-medium mb-2">{t('shareOn')}:</p>
            <div className="grid grid-cols-3 gap-2">
              <Button onClick={handleWhatsAppShare} variant="secondary" size="small">
                WhatsApp
              </Button>
              <Button onClick={handleFacebookShare} variant="secondary" size="small">
                Facebook
              </Button>
              <Button onClick={handleTwitterShare} variant="secondary" size="small">
                Twitter
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Alert variant="info">
        <p className="font-medium mb-2">{t('whatNext')}</p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>{t('tip1')}</li>
          <li>{t('tip2')}</li>
          <li>{t('tip3')}</li>
        </ul>
      </Alert>
    </div>
  );
}
