# Announcement Banner Component

A reusable, configurable announcement banner component for displaying important messages at the top of pages. Supports clickable links, dismissible functionality, multiple variants, and low-bandwidth mode.

## Features

- ✅ **Full-width banner** - Spans the entire width of the page
- ✅ **Clickable** - Optional link to navigate to any URL
- ✅ **Dismissible** - Optional close button to hide the banner
- ✅ **Multiple variants** - Info, warning, success, and error styles
- ✅ **Low-bandwidth support** - Automatically adapts for slow connections
- ✅ **Environment-based configuration** - Easy to enable/disable via env vars
- ✅ **Accessible** - Proper ARIA labels and keyboard navigation

## Component Location

```
components/features/AnnouncementBanner.tsx
```

## Props Interface

```typescript
interface AnnouncementBannerProps {
  text: string;                    // Required: Banner message text
  href?: string;                   // Optional: URL to navigate when clicked
  variant?: 'info' | 'warning' | 'success' | 'error';  // Default: 'info'
  dismissible?: boolean;           // Default: false
  locale?: string;                // Default: 'en'
}
```

## Variants

| Variant | Background | Border | Text Color | Use Case |
|---------|-----------|--------|------------|----------|
| `info` | Blue-50 | Blue-200 | Blue-900 | General information |
| `warning` | Yellow-50 | Yellow-200 | Yellow-900 | Warnings, cautions |
| `success` | Green-50 | Green-200 | Green-900 | Success messages |
| `error` | Red-50 | Red-200 | Red-900 | Errors, critical alerts |

## Configuration via Environment Variables

The banner is controlled through environment variables, making it easy to enable/disable without code changes.

### Required Variables

```env
# Set the announcement text (banner only shows if this is set)
NEXT_PUBLIC_ANNOUNCEMENT_TEXT="Your announcement message here"
```

### Optional Variables

```env
# Make banner clickable (navigate to URL)
NEXT_PUBLIC_ANNOUNCEMENT_HREF="/announcement-details"

# Set variant: 'info', 'warning', 'success', or 'error' (default: 'info')
NEXT_PUBLIC_ANNOUNCEMENT_VARIANT="warning"

# Enable dismissible close button: 'true' or 'false' (default: 'false')
NEXT_PUBLIC_ANNOUNCEMENT_DISMISSIBLE="true"
```

## Usage Examples

### Basic Info Banner

```env
NEXT_PUBLIC_ANNOUNCEMENT_TEXT="New features available! Check out our latest updates."
NEXT_PUBLIC_ANNOUNCEMENT_VARIANT="info"
```

### Warning Banner with Link

```env
NEXT_PUBLIC_ANNOUNCEMENT_TEXT="System maintenance scheduled for tonight at 11 PM"
NEXT_PUBLIC_ANNOUNCEMENT_VARIANT="warning"
NEXT_PUBLIC_ANNOUNCEMENT_HREF="/maintenance"
```

### Dismissible Success Banner

```env
NEXT_PUBLIC_ANNOUNCEMENT_TEXT="Your report has been successfully submitted!"
NEXT_PUBLIC_ANNOUNCEMENT_VARIANT="success"
NEXT_PUBLIC_ANNOUNCEMENT_DISMISSIBLE="true"
```

### Critical Error Banner

```env
NEXT_PUBLIC_ANNOUNCEMENT_TEXT="Service temporarily unavailable. Please try again later."
NEXT_PUBLIC_ANNOUNCEMENT_VARIANT="error"
NEXT_PUBLIC_ANNOUNCEMENT_HREF="/status"
NEXT_PUBLIC_ANNOUNCEMENT_DISMISSIBLE="true"
```

## Integration Steps

### 1. Add Component to Page

```tsx
import { AnnouncementBanner } from '@/components/features/AnnouncementBanner';

export default function HomePage() {
  // Read from environment variables
  const announcementText = process.env.NEXT_PUBLIC_ANNOUNCEMENT_TEXT || '';
  const announcementHref = process.env.NEXT_PUBLIC_ANNOUNCEMENT_HREF || undefined;
  const announcementVariant = (process.env.NEXT_PUBLIC_ANNOUNCEMENT_VARIANT as 'info' | 'warning' | 'success' | 'error') || 'info';
  const announcementDismissible = process.env.NEXT_PUBLIC_ANNOUNCEMENT_DISMISSIBLE === 'true';

  return (
    <>
      {/* Announcement Banner - Full Width */}
      {announcementText && (
        <div className="w-full">
          <AnnouncementBanner
            text={announcementText}
            href={announcementHref}
            variant={announcementVariant}
            dismissible={announcementDismissible}
            locale="en"
          />
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

### 2. Add Environment Variables

Add to `.env.local` or your deployment environment:

```env
NEXT_PUBLIC_ANNOUNCEMENT_TEXT="Your message here"
NEXT_PUBLIC_ANNOUNCEMENT_VARIANT="info"
NEXT_PUBLIC_ANNOUNCEMENT_DISMISSIBLE="false"
```

### 3. Ensure Low-Bandwidth Context is Available

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

import { useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { useLowBandwidth } from '@/lib/contexts/LowBandwidthContext';

export function AnnouncementBanner({
  text,
  href,
  variant = 'info',
  dismissible = false,
  locale = 'en',
}: AnnouncementBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const { isLowBandwidth } = useLowBandwidth();

  // Component logic...
}
```

## Low-Bandwidth Mode Behavior

When `isLowBandwidth` is `true`:
- ❌ Hover effects are removed
- ❌ Icons are hidden (X button shows "Close" text instead)
- ✅ All functionality remains intact
- ✅ Text and links still work

## Styling Details

### Default Styles

- **Padding**: `px-4 py-3` (mobile), responsive
- **Text Size**: `text-sm` (mobile), `text-base` (desktop)
- **Font Weight**: `font-medium`
- **Border**: Bottom border with variant color
- **Layout**: Flexbox with space-between

### Customization

To customize colors or styles, modify the `variantStyles` object in the component:

```tsx
const variantStyles = {
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-900',
    hover: isLowBandwidth ? '' : 'hover:bg-blue-100',
  },
  // Add more variants...
};
```

## Dependencies

- `react` - For state management
- `next/link` - For navigation
- `lucide-react` - For X icon (optional in low-bandwidth mode)
- `@/lib/contexts/LowBandwidthContext` - For low-bandwidth detection

## Accessibility

- ✅ Proper ARIA labels on dismiss button
- ✅ Keyboard navigation support
- ✅ Focus states for interactive elements
- ✅ Semantic HTML structure

## Best Practices

1. **Keep messages concise** - Banner should be scannable at a glance
2. **Use appropriate variants** - Match the variant to the message importance
3. **Provide links for details** - If message is complex, link to full details page
4. **Make critical messages non-dismissible** - Use `dismissible: false` for important alerts
5. **Test in low-bandwidth mode** - Ensure message is readable without icons

## Disabling the Banner

To hide the banner, simply remove or leave empty the `NEXT_PUBLIC_ANNOUNCEMENT_TEXT` environment variable:

```env
# Banner will not show
NEXT_PUBLIC_ANNOUNCEMENT_TEXT=""
```

Or remove the variable entirely.

## Example: Multi-Language Support

For multi-language applications, you can use translation keys:

```tsx
import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('announcements');
  
  const announcementText = process.env.NEXT_PUBLIC_ANNOUNCEMENT_TEXT 
    ? t(process.env.NEXT_PUBLIC_ANNOUNCEMENT_TEXT) 
    : '';

  return (
    <>
      {announcementText && (
        <AnnouncementBanner
          text={announcementText}
          // ...
        />
      )}
    </>
  );
}
```

## Troubleshooting

### Banner not showing?

1. Check that `NEXT_PUBLIC_ANNOUNCEMENT_TEXT` is set and not empty
2. Verify environment variables are loaded (restart dev server if needed)
3. Check browser console for errors

### Styling issues?

1. Ensure Tailwind CSS is properly configured
2. Check that variant color classes are available in your Tailwind config
3. Verify `LowBandwidthProvider` is wrapping your app

### Dismiss not working?

1. Ensure `dismissible` prop is set to `true`
2. Check that state management is working (component is client-side)
3. Verify no JavaScript errors in console

## License

This component is part of the iSafe project and can be reused in other projects with appropriate attribution.

