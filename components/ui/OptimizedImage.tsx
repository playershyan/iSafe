'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { getOptimizedUrl, getThumbnailUrl, ImageQuality } from '@/lib/utils/responsive-images';
import { useLowBandwidth } from '@/lib/contexts/LowBandwidthContext';
import clsx from 'clsx';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  quality?: ImageQuality;
  watermark?: boolean;
  placeholder?: 'blur' | 'empty';
  priority?: boolean;
  sizes?: string;
  className?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  onError?: () => void;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  quality = 'listing',
  watermark = false,
  placeholder = 'empty',
  priority = false,
  sizes,
  className,
  objectFit = 'cover',
  onError,
}: OptimizedImageProps) {
  const { isLowBandwidth } = useLowBandwidth();
  const [imageSrc, setImageSrc] = useState<string>('');
  const [blurDataUrl, setBlurDataUrl] = useState<string | undefined>();
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!src) return;

    // Check if it's a Cloudinary URL
    const isCloudinary = src.includes('cloudinary.com');

    if (isCloudinary) {
      // Check if we have the cloud name configured (needed for optimization)
      const hasCloudName = typeof window !== 'undefined' 
        ? !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
        : !!process.env.CLOUDINARY_CLOUD_NAME;

      if (!hasCloudName) {
        // If cloud name not configured, use original URL directly
        console.warn('Cloudinary cloud name not configured, using original URL');
        setImageSrc(src);
        return;
      }

      try {
        // Generate optimized URL
        const optimizedSrc = getOptimizedUrl(src, {
          width: width || 800,
          height: height || 600,
          quality,
          watermark,
          format: 'auto',
        });
        
        // If optimization failed (empty string or same as original), use original URL
        if (optimizedSrc && optimizedSrc !== '' && optimizedSrc !== src) {
          setImageSrc(optimizedSrc);
        } else {
          // Use original URL if optimization didn't work
          setImageSrc(src);
        }

        // Generate blur placeholder if needed
        if (placeholder === 'blur') {
          const blurUrl = getThumbnailUrl(src, 20, false);
          if (blurUrl && blurUrl !== '' && blurUrl !== src) {
            setBlurDataUrl(blurUrl);
          }
        }
      } catch (error) {
        console.error('Error optimizing image URL:', error, 'Using original URL:', src);
        // Fallback to original URL if optimization fails
        setImageSrc(src);
      }
    } else {
      // Use original URL for non-Cloudinary images
      setImageSrc(src);
    }
  }, [src, width, height, quality, watermark, placeholder]);

  const handleError = () => {
    setHasError(true);
    if (onError) onError();
  };

  // Low-bandwidth mode: show text placeholder instead of image
  if (isLowBandwidth) {
    return (
      <div
        className={clsx(
          'flex items-center justify-center bg-gray-200 text-gray-600 text-sm',
          className
        )}
        style={fill ? undefined : { width, height }}
      >
        Photo available
      </div>
    );
  }

  if (hasError || !imageSrc) {
    return (
      <div
        className={clsx(
          'flex items-center justify-center bg-gray-200 text-gray-400',
          className
        )}
        style={fill ? undefined : { width, height }}
      >
        <span className="text-4xl">👤</span>
      </div>
    );
  }

  const imageProps: any = {
    src: imageSrc,
    alt,
    className: clsx(className),
    priority,
    onError: handleError,
    style: objectFit !== 'cover' ? { objectFit } : undefined,
  };

  if (fill) {
    imageProps.fill = true;
    imageProps.sizes = sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
  } else {
    imageProps.width = width || 800;
    imageProps.height = height || 600;
  }

  if (placeholder === 'blur' && blurDataUrl) {
    imageProps.placeholder = 'blur';
    imageProps.blurDataURL = blurDataUrl;
  }

  return <Image {...imageProps} />;
}

