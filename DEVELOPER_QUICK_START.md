# iSafe UI Implementation - Developer Quick Start

## 🎯 What Changed

The iSafe UI has been completely rebuilt according to comprehensive wireframe specifications. Here's what you need to know to start working with the new implementation.

## 🏗️ Architecture Overview

### Mobile-First Approach
All components are built mobile-first with progressive enhancement:
- Base styles target 320px width
- Responsive breakpoints: `md:` (768px+), `lg:` (1024px+)
- Touch-friendly (44px minimum touch targets)

### Component Structure

```
UI Primitives (components/ui/)
  ├── Button.tsx          # Primary, secondary, danger variants
  ├── Input.tsx           # Form inputs with validation
  ├── Card.tsx            # Container component
  ├── Alert.tsx           # Info, success, warning, error alerts
  └── Loading.tsx         # Loading spinner

Layout (components/layout/)
  ├── Header.tsx          # Simplified header with logo + language
  ├── Footer.tsx          # Responsive footer
  └── LanguageToggle.tsx  # සිං | த | EN switcher

Forms (components/forms/)
  ├── SearchForm.tsx                  # Multi-step search
  ├── MissingPersonFormMultiStep.tsx  # Multi-step missing person report
  └── ShelterRegistrationForm.tsx     # Shelter person registration

Features (components/features/)
  ├── SearchResults.tsx       # Found/not found results
  ├── PosterPreview.tsx       # Poster display & share
  └── StatusPersonCard.tsx    # Person info card
```

## 🎨 Design System

### Colors
```typescript
primary: '#2563EB'        // blue-600
primary-dark: '#1E40AF'   // blue-700
primary-light: '#DBEAFE'  // blue-50
success: '#16A34A'        // green-600
warning: '#F59E0B'        // amber-500
danger: '#DC2626'         // red-600
```

### Typography
```css
Base: 16px (text-base)
H1: 24px mobile, 32px desktop
H2: 20px mobile, 24px desktop
Body: 16px (never smaller on mobile to prevent iOS zoom)
Small: 14px (text-sm)
```

### Spacing
```css
Mobile: px-4 py-6 (16px, 24px)
Desktop: px-8 py-12 (32px, 48px)
```

## 🔑 Key Components Usage

### Button
```tsx
import { Button } from '@/components/ui';

// Primary button (default)
<Button onClick={handleClick}>Submit</Button>

// Secondary button (outline)
<Button variant="secondary">Cancel</Button>

// Full width, large size
<Button fullWidth size="large">Continue</Button>

// Disabled state
<Button disabled={isLoading}>
  {isLoading ? 'Loading...' : 'Submit'}
</Button>
```

### Input
```tsx
import { Input } from '@/components/ui';

// Basic input
<Input 
  label="Full Name"
  value={name}
  onChange={(e) => setName(e.target.value)}
  required
/>

// With error
<Input 
  label="Phone"
  value={phone}
  error={errors.phone}
  helperText="10 digits starting with 0"
/>
```

### Alert
```tsx
import { Alert } from '@/components/ui';

// Info alert
<Alert variant="info" title="Note">
  This is an informational message.
</Alert>

// Success alert
<Alert variant="success">
  Person registered successfully!
</Alert>
```

## 📱 Page Structure Examples

### Standard Page Layout
```tsx
export default function MyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center rounded text-base text-primary hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          ← Back to Home
        </Link>
      </div>

      {/* Page title */}
      <h1 className="mb-6 text-2xl font-bold text-gray-900 md:text-3xl">
        Page Title
      </h1>

      {/* Page content */}
      <div className="space-y-6">
        {/* Your content here */}
      </div>
    </div>
  );
}
```

### Multi-Step Form Pattern
```tsx
'use client';

import { useState } from 'react';
import { Button, Input } from '@/components/ui';

export function MultiStepForm() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState({
    // your form fields
  });

  // Progress indicator
  const ProgressIndicator = () => (
    <div className="mb-8 flex items-center justify-center">
      {/* Step circles with connecting lines */}
    </div>
  );

  return (
    <div className="space-y-6">
      <ProgressIndicator />
      
      {step === 1 && (
        <div className="space-y-4">
          {/* Step 1 fields */}
          <Button onClick={() => setStep(2)}>Continue</Button>
        </div>
      )}
      
      {step === 2 && (
        <div className="space-y-4">
          <button onClick={() => setStep(1)}>← Back</button>
          {/* Step 2 fields */}
          <Button onClick={() => setStep(3)}>Continue</Button>
        </div>
      )}
      
      {/* More steps... */}
    </div>
  );
}
```

## 🎯 Common Patterns

### Loading State
```tsx
const [isLoading, setIsLoading] = useState(false);

// In button
<Button disabled={isLoading}>
  {isLoading ? 'Processing...' : 'Submit'}
</Button>

// Full page
import { Loading } from '@/components/ui';
<Loading text="Searching..." />
```

### Error Handling
```tsx
const [error, setError] = useState<string | null>(null);

// Display error
{error && (
  <Alert variant="error">
    {error}
  </Alert>
)}

// Clear error on input
<Input
  value={value}
  onChange={(e) => {
    setValue(e.target.value);
    setError(null); // Clear error when user types
  }}
  error={error}
/>
```

### Form Validation
```tsx
import { z } from 'zod';

const schema = z.object({
  fullName: z.string().min(2).max(100),
  age: z.coerce.number().min(0).max(120),
  phone: z.string().regex(/^0\d{9}$/, 'Invalid phone number'),
});

// Use with React Hook Form
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema)
});
```

## 🔍 Navigation Patterns

### Back Button (Standard)
```tsx
<Link
  href={`/${locale}`}
  className="inline-flex items-center rounded text-base text-primary hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
>
  ← Back to Home
</Link>
```

### Action Button (Standard)
```tsx
<Link href={`/${locale}/search`} className="block">
  <Button fullWidth size="large">
    Search for Someone
  </Button>
</Link>
```

## ♿ Accessibility Requirements

### ARIA Labels
```tsx
// Icon buttons need labels
<button aria-label="Close dialog">
  ✕
</button>

// Decorative icons
<span aria-hidden="true">📍</span>
```

### Form Fields
```tsx
// Required fields
<Input 
  label="Name"
  required
  aria-required="true"
/>

// Error states
<Input
  error="Name is required"
  aria-invalid="true"
  aria-describedby="name-error"
/>
```

### Focus Management
All interactive elements must:
- Be keyboard accessible (Tab/Shift+Tab)
- Have visible focus indicators
- Be in logical tab order

## 📦 Image Handling

### Upload Pattern
```tsx
import { compressImage, validateImageFile } from '@/lib/utils/imageCompression';

const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Validate
  const validation = validateImageFile(file);
  if (!validation.valid) {
    setError(validation.error);
    return;
  }

  // Compress
  const compressed = await compressImage(file);
  
  // Preview
  const reader = new FileReader();
  reader.onloadend = () => {
    setPreview(reader.result as string);
  };
  reader.readAsDataURL(compressed);
};
```

## 🌐 Internationalization

### Using Translations
```tsx
import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('namespace');
  
  return <h1>{t('title')}</h1>;
}
```

### Link with Locale
```tsx
import Link from 'next/link';
import { useLocale } from 'next-intl';

const locale = useLocale();
<Link href={`/${locale}/search`}>Search</Link>
```

## 🚀 Performance Tips

1. **Server Components by Default**
   - Only use `'use client'` when necessary
   - For: useState, useEffect, event handlers

2. **Image Optimization**
   - Always use Next.js Image component
   - Compress before upload (handled by utils)

3. **Code Splitting**
   - Use dynamic imports for heavy components
   ```tsx
   const HeavyComponent = dynamic(() => import('./HeavyComponent'));
   ```

4. **Avoid Client-Side Fetching**
   - Prefer Server Components with async/await
   - Use Server Actions for mutations

## 🐛 Common Issues & Solutions

### Issue: iOS Form Zoom
**Solution**: Use 16px base font size (text-base)
```tsx
<Input className="text-base" /> // ✅
<Input className="text-sm" />  // ❌ Will zoom on iOS
```

### Issue: Button Not Full Width on Mobile
**Solution**: Add fullWidth prop
```tsx
<Button fullWidth>Submit</Button>
```

### Issue: Focus Ring Not Visible
**Solution**: Ensure you're not removing outline
```tsx
// ✅ Good - custom focus
className="focus:outline-none focus:ring-2 focus:ring-primary"

// ❌ Bad - no focus indicator
className="outline-none"
```

## 📝 Code Style

### Naming Conventions
- Components: PascalCase (e.g., `SearchForm`)
- Files: PascalCase for components (e.g., `SearchForm.tsx`)
- Functions: camelCase (e.g., `handleSubmit`)
- Constants: UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`)

### Component Structure
```tsx
'use client'; // Only if needed

import { useState } from 'react';
import { Button } from '@/components/ui';

interface MyComponentProps {
  // Props interface
}

export function MyComponent({ prop1, prop2 }: MyComponentProps) {
  // State
  const [state, setState] = useState();
  
  // Handlers
  const handleAction = () => {
    // ...
  };
  
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### Tailwind Class Order
1. Layout (flex, grid, block)
2. Positioning (absolute, relative)
3. Spacing (p-, m-)
4. Sizing (w-, h-)
5. Typography (text-, font-)
6. Colors (bg-, text-, border-)
7. Effects (shadow-, opacity-)
8. Responsive (md:, lg:)

Example:
```tsx
className="flex items-center gap-2 px-4 py-2 text-base font-medium text-white bg-primary rounded-lg hover:bg-primary-dark md:px-6"
```

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Check types
npx tsc --noEmit

# Format code
npm run format
```

## 📚 Additional Resources

- [Wireframe Implementation Summary](./WIREFRAME_IMPLEMENTATION_SUMMARY.md)
- [Development Directives](./Readme/iSafe_Development_Directives.txt)
- [Tech Stack Plan](./Readme/iSafe_Tech_Stack_Plan.txt)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Next.js 14 Docs](https://nextjs.org/docs)

## 🎉 Quick Win Checklist

When implementing a new page/feature:
- [ ] Use Server Component unless client interactivity needed
- [ ] Start with mobile layout (320px)
- [ ] Add responsive classes (md:, lg:)
- [ ] Include focus states for all interactive elements
- [ ] Add ARIA labels where needed
- [ ] Test keyboard navigation
- [ ] Handle loading states
- [ ] Handle error states
- [ ] Add empty states
- [ ] Test on real mobile device
- [ ] Check color contrast
- [ ] Verify text is 16px minimum on mobile

---

**Need help?** Review the existing implemented components as reference examples. They follow all these patterns and best practices.

