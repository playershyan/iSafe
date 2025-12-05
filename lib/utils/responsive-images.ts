export type ImageQuality = 'thumbnail' | 'listing' | 'gallery' | 'auto:eco' | 'auto:best' | 'auto:good' | 'auto:low' | number;

export interface OptimizedImageOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'limit' | 'scale';
  quality?: ImageQuality;
  format?: 'auto' | 'jpg' | 'png' | 'webp';
  watermark?: boolean;
}

// Get Cloudinary cloud name from environment (client-safe)
function getCloudName(): string {
  if (typeof window !== 'undefined') {
    // Client-side: use public env var
    return process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
  }
  // Server-side: use private env var
  return process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
}

// Extract public ID from Cloudinary URL (client-safe)
function extractPublicIdFromUrl(url: string): string | null {
  if (!url.includes('cloudinary.com')) return null;
  
  // Match pattern: /v{version}/{public_id}.{ext}
  const match = url.match(/\/v\d+\/(.+?)(?:\.[^.]+)?$/);
  if (match && match[1]) {
    return match[1];
  }
  
  // Alternative pattern: /upload/{transformations}/{public_id}.{ext}
  const uploadMatch = url.match(/\/upload\/[^/]*\/(.+?)(?:\.[^.]+)?$/);
  if (uploadMatch && uploadMatch[1]) {
    return uploadMatch[1];
  }
  
  return null;
}

// Build Cloudinary transformation URL (client-safe)
function buildCloudinaryUrl(
  publicId: string,
  options: OptimizedImageOptions = {},
  originalUrl?: string
): string {
  const cloudName = getCloudName();
  if (!cloudName) {
    // If no cloud name, return original URL if provided, otherwise return empty
    if (originalUrl && originalUrl.includes('http')) {
      return originalUrl;
    }
    return publicId.includes('http') ? publicId : '';
  }

  // Map quality presets
  let quality: string | number = options.quality || 'auto:good';
  if (options.quality === 'thumbnail') {
    quality = 'auto:eco';
  } else if (options.quality === 'listing') {
    quality = 'auto:good';
  } else if (options.quality === 'gallery') {
    quality = 'auto:best';
  }

  // Build transformation string
  const transformations: string[] = [];
  
  if (options.width) transformations.push(`w_${options.width}`);
  if (options.height) transformations.push(`h_${options.height}`);
  if (options.crop) transformations.push(`c_${options.crop}`);
  transformations.push(`q_${quality}`);
  if (options.format) transformations.push(`f_${options.format}`);
  transformations.push('dpr_auto');
  transformations.push('fl_strip_profile.force_strip.progressive');

  // Add watermark if enabled (simplified - just add overlay text)
  if (options.watermark !== false && process.env.CLOUDINARY_WATERMARK_ENABLED !== 'false') {
    // Watermark transformation
    transformations.push('l_text:Arial_36_bold:iSafe.lk,co_white,o_35,g_center');
  }

  const transformationString = transformations.join(',');
  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;
  
  return `${baseUrl}/${transformationString}/${publicId}`;
}

/**
 * Get optimized Cloudinary URL from public ID or existing URL
 */
export function getOptimizedUrl(
  publicIdOrUrl: string,
  options: OptimizedImageOptions = {}
): string {
  // If it's not a Cloudinary URL, return as-is
  if (!publicIdOrUrl.includes('cloudinary.com') && !publicIdOrUrl.includes('http')) {
    // Might be a public ID without URL
    const result = buildCloudinaryUrl(publicIdOrUrl, options);
    // If build failed (empty string), return original
    return result || publicIdOrUrl;
  }

  // Extract public ID if URL is provided
  let publicId = publicIdOrUrl;
  if (publicIdOrUrl.includes('cloudinary.com')) {
    const extracted = extractPublicIdFromUrl(publicIdOrUrl);
    if (extracted) {
      publicId = extracted;
      const result = buildCloudinaryUrl(publicId, options, publicIdOrUrl);
      // If build failed (empty string), return original URL
      return result || publicIdOrUrl;
    } else {
      // If we can't extract, return original URL
      return publicIdOrUrl;
    }
  } else {
    // Not a Cloudinary URL, return as-is
    return publicIdOrUrl;
  }
}

/**
 * Get thumbnail URL
 */
export function getThumbnailUrl(
  publicIdOrUrl: string,
  size: number = 400,
  watermark: boolean = false
): string {
  let publicId = publicIdOrUrl;
  if (publicIdOrUrl.includes('cloudinary.com')) {
    const extracted = extractPublicIdFromUrl(publicIdOrUrl);
    if (extracted) {
      publicId = extracted;
    } else {
      return publicIdOrUrl;
    }
  }

  return buildCloudinaryUrl(publicId, {
    width: size,
    height: Math.round(size * 0.75),
    crop: 'fill',
    quality: 'auto:eco',
    format: 'auto',
    watermark,
  });
}

/**
 * Get mobile-optimized URL
 */
export function getMobileUrl(publicIdOrUrl: string, watermark: boolean = false): string {
  let publicId = publicIdOrUrl;
  if (publicIdOrUrl.includes('cloudinary.com')) {
    const extracted = extractPublicIdFromUrl(publicIdOrUrl);
    if (extracted) {
      publicId = extracted;
    } else {
      return publicIdOrUrl;
    }
  }

  return buildCloudinaryUrl(publicId, {
    width: 800,
    height: 600,
    crop: 'limit',
    quality: 'auto:good',
    format: 'auto',
    watermark,
  });
}

/**
 * Get gallery URL
 */
export function getGalleryUrl(publicIdOrUrl: string, watermark: boolean = false): string {
  let publicId = publicIdOrUrl;
  if (publicIdOrUrl.includes('cloudinary.com')) {
    const extracted = extractPublicIdFromUrl(publicIdOrUrl);
    if (extracted) {
      publicId = extracted;
    } else {
      return publicIdOrUrl;
    }
  }

  return buildCloudinaryUrl(publicId, {
    width: 1920,
    height: 1440,
    crop: 'limit',
    quality: 'auto:best',
    format: 'auto',
    watermark,
  });
}

/**
 * Generate responsive srcset
 */
export function generateSrcset(
  publicIdOrUrl: string,
  sizes: number[],
  options: Omit<OptimizedImageOptions, 'width' | 'height'> = {}
): string {
  return sizes
    .map((size) => {
      const url = getOptimizedUrl(publicIdOrUrl, {
        ...options,
        width: size,
        height: Math.round(size * 0.75),
      });
      return `${url} ${size}w`;
    })
    .join(', ');
}

/**
 * Generate blur placeholder data URL
 */
export function generateBlurDataURL(publicIdOrUrl: string): string {
  const placeholderUrl = getOptimizedUrl(publicIdOrUrl, {
    width: 20,
    height: 15,
    quality: 'auto:low',
    format: 'jpg',
    watermark: false,
  });
  // Return a simple base64 placeholder or the low-quality URL
  // For a true blur placeholder, you'd need to fetch and convert to base64
  return placeholderUrl;
}
