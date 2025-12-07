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
  const [currentIndex, setCurrentIndex] = useState(0);
  const { isLowBandwidth } = useLowBandwidth();

  const isSlideshow = images && images.length > 1;

  // Fix hydration mismatch by only using low-bandwidth mode after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Reset index if it goes out of bounds
  useEffect(() => {
    if (images && images.length > 0 && currentIndex >= images.length) {
      setCurrentIndex(0);
    }
  }, [images, currentIndex]);

  // Auto-advance slideshow every 2 seconds when multiple images
  useEffect(() => {
    if (!isMounted || isLowBandwidth) {
      return;
    }

    if (!images || images.length <= 1) {
      return;
    }

    // Use a stable reference for images.length
    const imageCount = images.length;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % imageCount;
        return nextIndex;
      });
    }, 2000); // 2 seconds

    return () => clearInterval(interval);
  }, [isMounted, isLowBandwidth, images?.length]);

  if (!images || images.length === 0) {
    return null;
  }

  const heightClasses = {
    small: 'h-32 md:h-48',
    medium: 'h-48 md:h-64',
    large: 'h-64 md:h-96',
  };

  const heightClass = heightClasses[height];

  if (isMounted && isLowBandwidth) {
    // In low-bandwidth mode, show text placeholder instead of image
    const currentImage = images[currentIndex];
    const content = (
      <div
        className={`w-full ${heightClass} flex items-center justify-center bg-gray-100 border-b border-gray-200`}
      >
        <div className="text-center px-4">
          <p className="text-sm font-medium text-gray-600">
            {currentImage.alt || 'Banner image'}
            {isSlideshow && ` (${currentIndex + 1}/${images.length})`}
          </p>
          {currentImage.linkUrl && (
            <p className="text-xs text-gray-500 mt-1">Click to view</p>
          )}
        </div>
      </div>
    );

    if (currentImage.linkUrl) {
      return (
        <Link href={currentImage.linkUrl} className="block">
          {content}
        </Link>
      );
    }

    return content;
  }

  // Normal mode: show responsive images (desktop and mobile)
  // Slideshow if multiple images, single image otherwise
  const renderBannerImage = (image: BannerImage, index: number) => {
    const isActive = index === currentIndex;
    const baseClasses = `absolute inset-0 w-full h-full transition-opacity duration-500 ${
      isActive ? 'opacity-100' : 'opacity-0'
    }`;

    return (
      <div key={index} className={baseClasses}>
        {/* Desktop Image */}
        <div className="hidden md:block relative w-full h-full bg-gray-50">
          <Image
            src={image.imageUrlDesktop}
            alt={image.alt || `Hero banner ${index + 1}`}
            fill
            className="object-contain"
            priority={index === 0}
            sizes="100vw"
          />
        </div>
        {/* Mobile Image */}
        <div className="block md:hidden relative w-full h-full bg-gray-50">
          <Image
            src={image.imageUrlMobile}
            alt={image.alt || `Hero banner ${index + 1}`}
            fill
            className="object-contain"
            priority={index === 0}
            sizes="100vw"
          />
        </div>
      </div>
    );
  };

  const imageContent = (
    <div className={`relative w-full ${heightClass} overflow-hidden`}>
      {images.map((image, index) => renderBannerImage(image, index))}
      
      {/* Slide indicators - only show if slideshow */}
      {isSlideshow && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-8 bg-white'
                  : 'w-2 bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );

  const currentImage = images[currentIndex];
  if (currentImage.linkUrl) {
    return (
      <Link href={currentImage.linkUrl} className="block">
        {imageContent}
      </Link>
    );
  }

  return imageContent;
}

