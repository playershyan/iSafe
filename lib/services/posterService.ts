import sharp from 'sharp';
import { formatPhoneNumber } from '@/lib/utils/helpers';

interface PosterData {
  fullName: string;
  age: number;
  gender: string;
  photoUrl?: string | null;
  lastSeenLocation: string;
  lastSeenDistrict: string;
  lastSeenDate?: string | null;
  reporterPhone: string;
  posterCode: string;
}

export async function generatePosterImage(
  data: PosterData,
  format: 'square' | 'story' = 'square'
): Promise<Buffer> {
  const width = 1080;
  const height = format === 'square' ? 1080 : 1920;

  // Build SVG poster
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          .header { fill: #DC2626; }
          .text-dark { fill: #1F2937; font-family: Arial, sans-serif; }
          .text-gray { fill: #6B7280; font-family: Arial, sans-serif; }
          .text-white { fill: #FFFFFF; font-family: Arial, sans-serif; font-weight: bold; }
          .label { fill: #6B7280; font-family: Arial, sans-serif; font-size: 24px; }
          .value { fill: #1F2937; font-family: Arial, sans-serif; font-size: 28px; font-weight: bold; }
          .footer { fill: #9CA3AF; font-family: Arial, sans-serif; font-size: 20px; }
        </style>
      </defs>

      <!-- Red header -->
      <rect width="${width}" height="120" class="header" />
      <text x="${width / 2}" y="75" class="text-white" font-size="48" text-anchor="middle">
        ⚠️ MISSING PERSON
      </text>

      <!-- Photo placeholder (will be replaced if photo exists) -->
      <rect x="${width / 2 - 200}" y="160" width="400" height="400" fill="#E5E7EB" stroke="#D1D5DB" stroke-width="2" />
      <text x="${width / 2}" y="380" class="text-gray" font-size="32" text-anchor="middle">
        ${data.photoUrl ? '' : 'NO PHOTO'}
      </text>

      <!-- Person details -->
      <text x="80" y="620" class="label">Name:</text>
      <text x="80" y="660" class="value">${escapeXml(data.fullName)}</text>

      <text x="80" y="720" class="label">Age & Gender:</text>
      <text x="80" y="760" class="value">${data.age} years | ${data.gender}</text>

      <!-- Last seen -->
      <text x="80" y="840" class="label">Last Seen:</text>
      <text x="80" y="880" class="value">${escapeXml(data.lastSeenLocation)}</text>
      <text x="80" y="920" class="value">${escapeXml(data.lastSeenDistrict)} District</text>
      ${
        data.lastSeenDate
          ? `<text x="80" y="960" class="text-gray" font-size="24">${new Date(
              data.lastSeenDate
            ).toLocaleDateString()}</text>`
          : ''
      }

      <!-- Contact -->
      <text x="80" y="${format === 'square' ? '1000' : '1600'}" class="label">Contact:</text>
      <text x="80" y="${format === 'square' ? '1040' : '1640'}" class="value">${formatPhoneNumber(
    data.reporterPhone
  )}</text>

      <!-- Footer -->
      <text x="${width / 2}" y="${height - 40}" class="footer" text-anchor="middle">
        iSafe.lk | ${data.posterCode}
      </text>
    </svg>
  `;

  // Convert SVG to PNG
  let image = sharp(Buffer.from(svg));

  // If photo exists, composite it over the placeholder
  if (data.photoUrl) {
    try {
      // Fetch and process photo
      const photoResponse = await fetch(data.photoUrl);
      const photoBuffer = await photoResponse.arrayBuffer();

      const processedPhoto = await sharp(Buffer.from(photoBuffer))
        .resize(400, 400, {
          fit: 'cover',
          position: 'center',
        })
        .toBuffer();

      // Composite photo onto poster
      image = sharp(Buffer.from(svg)).composite([
        {
          input: processedPhoto,
          top: 160,
          left: width / 2 - 200,
        },
      ]);
    } catch (error) {
      console.error('Error adding photo to poster:', error);
      // Continue without photo
    }
  }

  return await image.png().toBuffer();
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
