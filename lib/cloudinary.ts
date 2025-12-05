import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  success: boolean;
  url?: string;
  public_id?: string;
  secure_url?: string;
  error?: string;
}

export class CloudinaryService {
  /**
   * Verify Cloudinary configuration
   */
  static isConfigured(): boolean {
    return !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );
  }

  /**
   * Upload image to Cloudinary
   * Note: Quality/format transformations happen at delivery time, not upload
   */
  static async uploadImage(
    file: Buffer | string,
    folder: string = 'isafe/missing-persons',
    options: {
      quality?: 'auto' | 'auto:best' | 'auto:good' | 'auto:eco' | 'auto:low' | number | string;
      transformation?: any[];
      tags?: string[];
      fileType?: string;
    } = {}
  ): Promise<CloudinaryUploadResult> {
    try {
      const uploadOptions: any = {
        folder,
        resource_type: 'image' as const,
      };

      if (options.transformation) {
        uploadOptions.transformation = options.transformation;
      }

      if (options.tags) uploadOptions.tags = options.tags;

      let uploadResult: { url: string; secure_url: string; public_id: string };

      if (Buffer.isBuffer(file)) {
        // Upload buffer via stream (more efficient than base64)
        uploadResult = await new Promise<{ url: string; secure_url: string; public_id: string }>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
              if (error) {
                console.error('Cloudinary upload error:', error);
                reject(error);
              } else if (result) {
                resolve({
                  url: result.url || '',
                  secure_url: result.secure_url || '',
                  public_id: result.public_id || '',
                });
              } else {
                reject(new Error('Upload failed: no result'));
              }
            }
          );
          uploadStream.end(file);
        });
      } else if (typeof file === 'string') {
        const result = await cloudinary.uploader.upload(file, uploadOptions);
        uploadResult = {
          url: result.url || '',
          secure_url: result.secure_url || '',
          public_id: result.public_id || '',
        };
      } else {
        throw new Error('Invalid file type - only Buffer and string supported');
      }

      return {
        success: true,
        url: uploadResult.url,
        secure_url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Upload failed',
      };
    }
  }

  /**
   * Upload multiple images
   */
  static async uploadMultipleImages(
    files: { buffer: Buffer; fileType: string }[],
    folder: string = 'isafe/missing-persons',
    options?: Omit<Parameters<typeof CloudinaryService.uploadImage>[2], 'fileType'>
  ): Promise<CloudinaryUploadResult[]> {
    const uploadPromises = files.map((file) =>
      this.uploadImage(file.buffer, folder, { ...options, fileType: file.fileType })
    );
    return Promise.all(uploadPromises);
  }

  /**
   * Delete image from Cloudinary
   */
  static async deleteImage(publicId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return {
        success: result.result === 'ok',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Delete failed',
      };
    }
  }

  /**
   * Check if watermarks are enabled globally
   */
  static isWatermarkEnabled(): boolean {
    return process.env.CLOUDINARY_WATERMARK_ENABLED !== 'false';
  }

  /**
   * Extract public ID from Cloudinary URL
   */
  static extractPublicIdFromUrl(url: string): string | null {
    if (!url.includes('cloudinary.com')) return null;
    const match = url.match(/\/v\d+\/(.+?)\.[^.]+$/);
    return match ? match[1] : null;
  }

  /**
   * Get watermark transformation configuration
   */
  static getWatermarkTransformation(): any {
    return {
      overlay: {
        font_family: 'Arial',
        font_size: 36,
        font_weight: 'bold',
        text: 'iSafe.lk',
      },
      gravity: 'center',
      opacity: 35,
      color: 'white',
    };
  }

  /**
   * Generate optimized URL for existing image with watermark
   */
  static getOptimizedUrl(
    publicId: string,
    options: {
      width?: number;
      height?: number;
      crop?: 'fill' | 'fit' | 'limit' | 'scale';
      quality?: 'auto' | 'auto:best' | 'auto:good' | 'auto:eco' | 'auto:low' | number | string;
      format?: 'auto' | 'jpg' | 'png' | 'webp';
      watermark?: boolean;
    } = {}
  ): string {
    const transformation: any = {
      width: options.width || 800,
      height: options.height || 600,
      crop: options.crop || 'limit',
      quality: options.quality || 'auto:good',
      dpr: 'auto', // Automatic device pixel ratio
    };

    if (options.format) {
      transformation.fetch_format = options.format;
    }

    let transformationChain = [transformation];

    // Add watermark by default (disable with watermark: false)
    if (options.watermark !== false && this.isWatermarkEnabled()) {
      transformationChain = this.addWatermarkToTransformation(transformationChain);
    }

    return cloudinary.url(publicId, {
      transformation: transformationChain,
      secure: true,
    });
  }

  /**
   * Generate thumbnail URL with optimizations
   */
  static getThumbnailUrl(publicId: string, size: number = 400, watermark: boolean = true): string {
    const transformation = {
      width: size,
      height: Math.round(size * 0.75), // 4:3 aspect ratio
      crop: 'fill',
      quality: 'auto:eco', // Optimized for thumbnails
      fetch_format: 'auto',
      dpr: 'auto',
      flags: 'strip_profile.force_strip.progressive',
    };

    let transformationChain = [transformation];

    if (watermark && this.isWatermarkEnabled()) {
      transformationChain = this.addWatermarkToTransformation(transformationChain);
    }

    return cloudinary.url(publicId, {
      transformation: transformationChain,
      secure: true,
    });
  }

  /**
   * Generate mobile-optimized URL
   */
  static getMobileUrl(publicId: string, watermark: boolean = true): string {
    const transformation = {
      width: 800,
      height: 600,
      crop: 'limit',
      quality: 'auto:good',
      fetch_format: 'auto',
      dpr: 'auto',
      flags: 'strip_profile.force_strip.progressive',
    };

    let transformationChain = [transformation];

    if (watermark && this.isWatermarkEnabled()) {
      transformationChain = this.addWatermarkToTransformation(transformationChain);
    }

    return cloudinary.url(publicId, {
      transformation: transformationChain,
      secure: true,
    });
  }

  /**
   * Generate gallery URL for full-size viewing
   */
  static getGalleryUrl(publicId: string, watermark: boolean = true): string {
    const transformation = {
      width: 1920,
      height: 1440,
      crop: 'limit',
      quality: 'auto:best',
      fetch_format: 'auto',
      dpr: 'auto',
      flags: 'strip_profile.force_strip.progressive',
    };

    let transformationChain = [transformation];

    if (watermark && this.isWatermarkEnabled()) {
      transformationChain = this.addWatermarkToTransformation(transformationChain);
    }

    return cloudinary.url(publicId, {
      transformation: transformationChain,
      secure: true,
    });
  }

  /**
   * Add watermark transformation to existing transformation chain
   */
  static addWatermarkToTransformation(transformation: any[]): any[] {
    const watermarkTransform = this.getWatermarkTransformation();
    return [...transformation, watermarkTransform];
  }

  /**
   * Get image info
   */
  static async getImageInfo(publicId: string) {
    try {
      const result = await cloudinary.api.resource(publicId);
      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export default CloudinaryService;

