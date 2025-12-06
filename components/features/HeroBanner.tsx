'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLowBandwidth } from '@/lib/contexts/LowBandwidthContext';

interface BannerImage {
  imageUrlDesktop: string;  // Desktop image URL
  imageUrlMobile: string;   // Mobile image URL
  linkUrl?: string;
  alt?: string;
}

interface HeroBannerProps {
  images: BannerImage[];
  height?: 'small' | 'medium' | 'large';
  locale?: string;
}

export function HeroBanner({ images, height = 'large', locale = 'en' }: HeroBannerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { isLowBandwidth } = useLowBandwidth();

  // Fix hydration mismatch by only using low-bandwidth mode after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!images || images.length === 0) {
    return null;
  }

  const heightClasses = {
    small: 'h-32 md:h-48',
    medium: 'h-48 md:h-64',
    large: 'h-64 md:h-96',
  };

  const heightClass = heightClasses[height];

  // For now, show the first image. Can be extended to support carousel later
  const bannerImage = images[0];

  if (isMounted && isLowBandwidth) {
    // In low-bandwidth mode, show text placeholder instead of image
    const content = (
      <div
        className={`w-full ${heightClass} flex items-center justify-center bg-gray-100 border-b border-gray-200`}
      >
        <div className="text-center px-4">
          <p className="text-sm font-medium text-gray-600">
            {bannerImage.alt || 'Banner image'}
          </p>
          {bannerImage.linkUrl && (
            <p className="text-xs text-gray-500 mt-1">Click to view</p>
          )}
        </div>
      </div>
    );

    if (bannerImage.linkUrl) {
      return (
        <Link href={bannerImage.linkUrl} className="block">
          {content}
        </Link>
      );
    }

    return content;
  }

  // Normal mode: show responsive images (desktop and mobile)
  const imageContent = (
    <div className={`relative w-full ${heightClass} overflow-hidden`}>
      {/* Desktop Image */}
      <div className="hidden md:block relative w-full h-full">
        <Image
          src={bannerImage.imageUrlDesktop}
          alt={bannerImage.alt || 'Hero banner'}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </div>
      {/* Mobile Image */}
      <div className="block md:hidden relative w-full h-full">
        <Image
          src={bannerImage.imageUrlMobile}
          alt={bannerImage.alt || 'Hero banner'}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </div>
    </div>
  );

  if (bannerImage.linkUrl) {
    return (
      <Link href={bannerImage.linkUrl} className="block">
        {imageContent}
      </Link>
    );
  }

  return imageContent;
}

