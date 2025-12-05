import { NextRequest, NextResponse } from 'next/server';
import { CloudinaryService } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/tiff'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, WebP, TIFF' },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Check Cloudinary configuration
    if (!CloudinaryService.isConfigured()) {
      console.error('Cloudinary configuration check failed');
      console.error('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Missing');
      console.error('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'Set' : 'Missing');
      console.error('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Missing');
      return NextResponse.json(
        { error: 'Cloudinary not configured. Please check environment variables.' },
        { status: 500 }
      );
    }

    // Convert to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    console.log('File received:', { size: file.size, type: file.type, bufferSize: buffer.length });

    // Upload to Cloudinary with optimization
    const uploadResult = await CloudinaryService.uploadImage(buffer, 'isafe/missing-persons', {
      transformation: [
        {
          width: 1920,
          height: 1440,
          crop: 'limit',
          quality: 'auto:eco',
          fetch_format: 'auto',
        },
      ],
      tags: ['missing-person', 'isafe'],
    });

    console.log('Upload result:', { success: uploadResult.success, public_id: uploadResult.public_id, error: uploadResult.error });

    if (!uploadResult.success || !uploadResult.public_id) {
      return NextResponse.json(
        { error: uploadResult.error || 'Upload failed - no public_id returned' },
        { status: 500 }
      );
    }

    // Generate optimized URLs
    const thumbnail = CloudinaryService.getThumbnailUrl(uploadResult.public_id, 400, false);
    const mobile = CloudinaryService.getMobileUrl(uploadResult.public_id, false);
    const gallery = CloudinaryService.getGalleryUrl(uploadResult.public_id, false);

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url || uploadResult.url,
      publicId: uploadResult.public_id,
      thumbnail,
      mobile,
      gallery,
    });
  } catch (error) {
    console.error('Upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json(
      { error: errorMessage, details: process.env.NODE_ENV === 'development' ? String(error) : undefined },
      { status: 500 }
    );
  }
}
