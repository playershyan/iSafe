# Hero Banner Component

A full-width, edge-to-edge hero banner image component that displays large promotional images at the top of pages. Supports clickable images that link to pages, multiple image configurations, and low-bandwidth mode.

## Features

- ✅ **Full-width edge-to-edge** - Spans the entire width of the viewport
- ✅ **Clickable images** - Optional link to navigate to any page
- ✅ **Multiple height options** - Small, medium, or large banner heights
- ✅ **Low-bandwidth support** - Shows text placeholder instead of images
- ✅ **Environment-based configuration** - Easy to configure via env vars
- ✅ **Next.js Image optimization** - Automatic image optimization and lazy loading
- ✅ **Responsive design** - Adapts to mobile and desktop screens

## Component Location

```
components/features/HeroBanner.tsx
```

## Props Interface

```typescript
interface BannerImage {
  imageUrlDesktop: string;  // Required: URL of the desktop banner image
  imageUrlMobile: string;   // Required: URL of the mobile banner image
  linkUrl?: string;         // Optional: URL to navigate when clicked
  alt?: string;             // Optional: Alt text for accessibility
}

interface HeroBannerProps {
  images: BannerImage[];              // Required: Array of banner images
  height?: 'small' | 'medium' | 'large';  // Default: 'large'
  locale?: string;                     // Default: 'en'
}
```

## Height Options

| Height | Mobile | Desktop | Use Case |
|--------|--------|---------|----------|
| `small` | 192px (h-48) | 256px (h-64) | Subtle banner, minimal space |
| `medium` | 256px (h-64) | 384px (h-96) | Standard promotional banner |
| `large` | 320px (h-80) | 500px (h-[500px]) | Prominent hero section |

## Configuration via Environment Variables

The banner is configured through environment variables using JSON format.

### Environment Variable

```env
# JSON array of banner images with separate desktop and mobile URLs
NEXT_PUBLIC_HERO_BANNER_IMAGES='[{"imageUrlDesktop":"https://example.com/banner-desktop.jpg","imageUrlMobile":"https://example.com/banner-mobile.jpg","linkUrl":"/promotion","alt":"Promotional banner"}]'
```

### JSON Format

```json
[
  {
    "imageUrlDesktop": "https://example.com/banner1-desktop.jpg",
    "imageUrlMobile": "https://example.com/banner1-mobile.jpg",
    "linkUrl": "/promotion-page",
    "alt": "Promotional banner description"
  },
  {
    "imageUrlDesktop": "https://example.com/banner2-desktop.jpg",
    "imageUrlMobile": "https://example.com/banner2-mobile.jpg",
    "linkUrl": "/another-page",
    "alt": "Another banner"
  }
]
```

**Important:** Both `imageUrlDesktop` and `imageUrlMobile` are required. This allows you to use different images optimized for each screen size, rather than just resizing the same image.

**Note:** Currently, only the first image in the array is displayed. The component is designed to support multiple images for future carousel functionality.

## Usage Examples

### Single Banner with Desktop and Mobile Images

```env
NEXT_PUBLIC_HERO_BANNER_IMAGES='[{"imageUrlDesktop":"https://res.cloudinary.com/your-cloud/image/upload/banner-desktop.jpg","imageUrlMobile":"https://res.cloudinary.com/your-cloud/image/upload/banner-mobile.jpg","linkUrl":"/emergency-info","alt":"Emergency Information Banner"}]'
```

### Banner without Link

```env
NEXT_PUBLIC_HERO_BANNER_IMAGES='[{"imageUrlDesktop":"https://res.cloudinary.com/your-cloud/image/upload/banner-desktop.jpg","imageUrlMobile":"https://res.cloudinary.com/your-cloud/image/upload/banner-mobile.jpg","alt":"Welcome Banner"}]'
```

### Multiple Banners (Future Support)

```env
NEXT_PUBLIC_HERO_BANNER_IMAGES='[{"imageUrlDesktop":"https://example.com/banner1-desktop.jpg","imageUrlMobile":"https://example.com/banner1-mobile.jpg","linkUrl":"/page1"},{"imageUrlDesktop":"https://example.com/banner2-desktop.jpg","imageUrlMobile":"https://example.com/banner2-mobile.jpg","linkUrl":"/page2"}]'
```

## Integration Steps

### 1. Add Component to Page

```tsx
import { HeroBanner } from '@/components/features/HeroBanner';

export default function HomePage() {
  // Parse banner images from environment variable
  let heroBannerImages: Array<{ imageUrlDesktop: string; imageUrlMobile: string; linkUrl?: string; alt?: string }> = [];
  try {
    const bannerConfig = process.env.NEXT_PUBLIC_HERO_BANNER_IMAGES;
    if (bannerConfig) {
      heroBannerImages = JSON.parse(bannerConfig);
    }
  } catch (error) {
    console.error('Error parsing hero banner images config:', error);
  }

  return (
    <>
      {/* Hero Banner - Full Width Edge-to-Edge */}
      {heroBannerImages.length > 0 && (
        <div className="w-full">
          <HeroBanner images={heroBannerImages} height="large" locale="en" />
        </div>
      )}
      
      {/* Rest of your page content */}
      <div className="container">
        {/* ... */}
      </div>
    </>
  );
}
```

### 2. Add Environment Variable

Add to `.env.local` or your deployment environment:

```env
NEXT_PUBLIC_HERO_BANNER_IMAGES='[{"imageUrl":"https://res.cloudinary.com/your-cloud/image/upload/banner.jpg","linkUrl":"/promotion","alt":"Promotional Banner"}]'
```

### 3. Ensure Image Domain is Allowed

Add your image domain to `next.config.js`:

```js
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'res.cloudinary.com',
      pathname: '/**',
    },
    {
      protocol: 'https',
      hostname: 'your-image-domain.com',
      pathname: '/**',
    },
  ],
}
```

### 4. Ensure Low-Bandwidth Context is Available

The component requires `LowBandwidthProvider` to be in the component tree:

```tsx
// In your layout or root component
import { LowBandwidthProvider } from '@/lib/contexts/LowBandwidthContext';

export default function Layout({ children }) {
  return (
    <LowBandwidthProvider>
      {children}
    </LowBandwidthProvider>
  );
}
```

## Component Structure

```tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLowBandwidth } from '@/lib/contexts/LowBandwidthContext';

export function HeroBanner({ images, height = 'large', locale = 'en' }: HeroBannerProps) {
  const { isLowBandwidth } = useLowBandwidth();
  
  // Component logic...
}
```

## Low-Bandwidth Mode Behavior

When `isLowBandwidth` is `true`:
- ❌ Image is not loaded
- ✅ Text placeholder is shown with alt text
- ✅ Link functionality remains intact
- ✅ Reduced bandwidth usage

The placeholder displays:
- Alt text (or "Banner image" if not provided)
- "Click to view" text if link is configured

## Image Requirements

### Recommended Specifications

**Desktop Images:**
- **Format**: JPG, PNG, or WebP
- **Aspect Ratio**: 16:9 or 21:9 (landscape)
- **File Size**: Optimize to < 500KB for faster loading
- **Dimensions**: 
  - Minimum: 1920x1080px
  - Recommended: 2560x1440px (for high-DPI displays)

**Mobile Images:**
- **Format**: JPG, PNG, or WebP
- **Aspect Ratio**: 16:9 (landscape) - same as desktop but optimized for smaller screens
- **File Size**: Optimize to < 200KB for faster loading
- **Dimensions**: 
  - Minimum: 750x422px (16:9 aspect ratio)
  - Recommended: 1080x608px (for high-DPI displays)

**Why Separate Images?**
- Mobile images can be optimized differently (smaller file size, different content)
- Better performance - users only download the image they need
- Better visual design - content can be tailored to screen size
- Same landscape orientation ensures consistent visual experience across devices

### Image Hosting

Recommended image hosting services:
- **Cloudinary** - Automatic optimization and CDN
- **Supabase Storage** - Integrated with your database
- **Vercel Blob** - Fast CDN delivery
- **AWS S3 + CloudFront** - Enterprise solution

## Styling Details

### Default Styles

- **Width**: `100vw` (full viewport width)
- **Height**: Responsive based on `height` prop
- **Object Fit**: `cover` (maintains aspect ratio, crops if needed)
- **Overflow**: `hidden` (prevents image overflow)
- **Position**: `relative` (for Next.js Image fill positioning)

### Customization

To customize the banner, modify the component or add wrapper classes:

```tsx
<div className="w-full relative">
  <HeroBanner 
    images={heroBannerImages} 
    height="large" 
    locale={locale}
  />
  {/* Optional: Overlay content */}
  <div className="absolute inset-0 flex items-center justify-center">
    <h2 className="text-white text-4xl">Your Overlay Text</h2>
  </div>
</div>
```

## Dependencies

- `next/image` - Next.js Image component for optimization
- `next/link` - Next.js Link component for navigation
- `@/lib/contexts/LowBandwidthContext` - For low-bandwidth detection

## Accessibility

- ✅ Alt text support for screen readers
- ✅ Semantic HTML structure
- ✅ Keyboard navigation support (when linked)
- ✅ Focus states for interactive elements

## Best Practices

1. **Optimize images** - Compress images before uploading to reduce load time
2. **Use descriptive alt text** - Important for accessibility and low-bandwidth mode
3. **Test in low-bandwidth mode** - Ensure placeholder text is meaningful
4. **Use appropriate height** - Match banner height to content importance
5. **Provide links for context** - Link banners to relevant pages for more information
6. **Monitor performance** - Use Next.js Image optimization features
7. **CDN delivery** - Host images on a CDN for faster global delivery

## Disabling the Banner

To hide the banner, simply remove or leave empty the `NEXT_PUBLIC_HERO_BANNER_IMAGES` environment variable:

```env
# Banner will not show
NEXT_PUBLIC_HERO_BANNER_IMAGES=""
```

Or remove the variable entirely.

## Troubleshooting

### Banner not showing?

1. Check that `NEXT_PUBLIC_HERO_BANNER_IMAGES` is set and contains valid JSON
2. Verify JSON syntax is correct (use a JSON validator)
3. Ensure `images` array is not empty
4. Check browser console for parsing errors
5. Verify environment variables are loaded (restart dev server if needed)

### Image not loading?

1. Check that both `imageUrlDesktop` and `imageUrlMobile` are valid, accessible URLs
2. Verify image domains are added to `next.config.js` `remotePatterns`
3. Check image URLs are using HTTPS (required for Next.js Image)
4. Verify images exist and are accessible
5. Check browser console for CORS or loading errors
6. Test both desktop and mobile images separately
7. Use browser dev tools to check which image is being requested

### Styling issues?

1. Ensure Tailwind CSS is properly configured
2. Check that height classes are available in your Tailwind config
3. Verify `LowBandwidthProvider` is wrapping your app
4. Check for CSS conflicts with other styles

### Link not working?

1. Ensure `linkUrl` is set in the image configuration
2. Verify link URL is a valid route in your application
3. Check that Next.js Link component is working correctly
4. Test link in browser developer tools

## Future Enhancements

Potential features for future versions:

- **Image carousel** - Support for multiple images with automatic rotation
- **Manual controls** - Previous/next buttons for carousel navigation
- **Auto-play** - Automatic image rotation with configurable interval
- **Indicators** - Dots or thumbnails showing current image
- **Fade transitions** - Smooth transitions between images
- **Admin panel** - UI for uploading and managing banner images
- **A/B testing** - Support for multiple banner variations

## License

This component is part of the iSafe project and can be reused in other projects with appropriate attribution.

