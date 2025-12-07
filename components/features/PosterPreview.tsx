'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import Link from 'next/link';

interface PosterPreviewProps {
  posterCode: string;
  locale: string;
}

export function PosterPreview({ posterCode, locale }: PosterPreviewProps) {
  const [copySuccess, setCopySuccess] = useState(false);

  const posterUrl = `/api/poster?posterCode=${posterCode}&format=square`;
  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${locale}/missing/poster/${posterCode}`;

  const handleDownload = async () => {
    try {
      const response = await fetch(posterUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `missing-person-${posterCode}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download poster');
    }
  };

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(
      `⚠️ MISSING PERSON\n\nHelp us find this person. View details at:\n${shareUrl}\n\nPoster Code: ${posterCode}`
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

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Copy error:', error);
      alert('Failed to copy link');
    }
  };

  return (
    <div className="space-y-6">
      {/* Poster Preview */}
      <div className="mx-auto max-w-md overflow-hidden rounded-lg border-2 border-gray-200 shadow-md">
        <img
          src={posterUrl}
          alt={`Missing person poster ${posterCode}`}
          className="h-auto w-full"
        />
      </div>

      {/* Share Buttons */}
      <div className="space-y-2">
        <Button
          onClick={handleDownload}
          fullWidth
          size="large"
          className="bg-primary text-white hover:bg-primary-dark"
        >
          <span className="mr-2" aria-hidden="true">⬇</span>
          Download Poster
        </Button>

        <button
          onClick={handleWhatsAppShare}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] text-base font-bold text-white transition-colors hover:bg-[#20BA5A] focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2"
        >
          Share on WhatsApp
        </button>

        <button
          onClick={handleFacebookShare}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-[#1877F2] text-base font-bold text-white transition-colors hover:bg-[#1665D8] focus:outline-none focus:ring-2 focus:ring-[#1877F2] focus:ring-offset-2"
        >
          Share on Facebook
        </button>

        <button
          onClick={handleCopyLink}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white text-base text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <span aria-hidden="true">🔗</span>
          {copySuccess ? 'Link Copied!' : 'Copy Link'}
        </button>
      </div>

      {/* Notification Box */}
      <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
        <p className="flex items-start gap-2 text-sm text-gray-700">
          <span className="text-lg" aria-hidden="true">💡</span>
          <span>We&apos;ll notify you if someone is found</span>
        </p>
      </div>

      {/* Secondary Button */}
      <Link href={`/${locale}/missing/report`}>
        <button className="flex h-12 w-full items-center justify-center rounded-lg border border-gray-300 bg-white text-base text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
          Create Another Poster
        </button>
      </Link>
    </div>
  );
}
