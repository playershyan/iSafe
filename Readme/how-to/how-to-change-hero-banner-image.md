# How to Change Hero Banner Image and Link URL

This guide explains how to change the large banner image that appears at the top of the home page, and set up a link when people click on it.

## What You Need

- Access to your server or hosting environment
- Access to edit environment variables (usually in `.env.local` file or your hosting platform's settings)
- The image URLs you want to use (desktop and mobile versions)

## Step-by-Step Instructions

### Step 1: Prepare Your Images

You'll need two versions of your banner image:

1. **Desktop Image**: A wide image (recommended: 1920x600 pixels or similar)
   - This shows on computers and tablets

2. **Mobile Image**: A smaller, mobile-optimized version (recommended: 800x400 pixels or similar)
   - This shows on phones

**Where to store images:**
- Upload your images to Cloudinary (if you're using Cloudinary)
- Or upload to Supabase Storage
- Or use any publicly accessible image URL

**Note:** Make sure your images are:
- In JPG, PNG, or WebP format
- Optimized for web (compressed to reduce file size)
- Publicly accessible via URL

### Step 2: Get Your Image URLs

Once your images are uploaded, get the full URLs:

- Desktop image URL example: `https://res.cloudinary.com/your-account/image/upload/desktop-banner.jpg`
- Mobile image URL example: `https://res.cloudinary.com/your-account/image/upload/mobile-banner.jpg`

### Step 3: Edit Environment Variables

Find your `.env.local` file (or the environment variables section in your hosting platform).

Look for or add this variable:

```
NEXT_PUBLIC_HERO_BANNER_IMAGES
```

### Step 4: Format the Configuration

The banner configuration uses JSON format. You need to format it like this:

```json
[
  {
    "imageUrlDesktop": "https://your-image-url.com/desktop-banner.jpg",
    "imageUrlMobile": "https://your-image-url.com/mobile-banner.jpg",
    "linkUrl": "https://example.com/page-to-link-to",
    "alt": "Description of the banner image"
  }
]
```

**Explanation of each field:**
- `imageUrlDesktop`: The image URL for desktop/tablet screens (required)
- `imageUrlMobile`: The image URL for mobile phones (required)
- `linkUrl`: Where users go when they click the banner (optional - leave out if you don't want a link)
- `alt`: Description text for accessibility (optional but recommended)

### Step 5: Add to Environment File

In your `.env.local` file, add or update **ONE** `NEXT_PUBLIC_HERO_BANNER_IMAGES` variable with all your images:

**For a single banner:**
```
NEXT_PUBLIC_HERO_BANNER_IMAGES=[{"imageUrlDesktop":"https://your-image-url.com/desktop-banner.jpg","imageUrlMobile":"https://your-image-url.com/mobile-banner.jpg","linkUrl":"https://example.com","alt":"Banner description"}]
```

**For multiple banners (slideshow):**
```
NEXT_PUBLIC_HERO_BANNER_IMAGES=[{"imageUrlDesktop":"https://your-image-url.com/desktop1.jpg","imageUrlMobile":"https://your-image-url.com/mobile1.jpg","linkUrl":"en/compensation/apply","alt":"English Banner"},{"imageUrlDesktop":"https://your-image-url.com/desktop2.jpg","imageUrlMobile":"https://your-image-url.com/mobile2.jpg","linkUrl":"si/compensation/apply","alt":"Sinhala Banner"},{"imageUrlDesktop":"https://your-image-url.com/desktop3.jpg","imageUrlMobile":"https://your-image-url.com/mobile3.jpg","linkUrl":"ta/compensation/apply","alt":"Tamil Banner"}]
```

**Important:** 
- You can only have **ONE** `NEXT_PUBLIC_HERO_BANNER_IMAGES` variable. If you define it multiple times, only the last one will be used.
- For multiple banners, combine them all into a single JSON array separated by commas
- Put everything on one line (remove all line breaks from the JSON)
- Make sure the JSON is valid (use an online JSON validator if unsure)
- When you have multiple images, they will automatically rotate in a slideshow every 2 seconds

### Step 6: Restart Your Application

After saving the environment file:

1. If running locally: Stop your development server (press Ctrl+C) and restart it with `npm run dev`
2. If deployed: Redeploy your application or restart your hosting service

### Step 7: Check the Home Page

Visit your home page and verify:
- The banner image displays correctly
- The desktop version shows on larger screens
- The mobile version shows on phones
- Clicking the banner (if you set a link) takes you to the correct page

## Example Configuration

Here's a complete example:

```
NEXT_PUBLIC_HERO_BANNER_IMAGES=[{"imageUrlDesktop":"https://res.cloudinary.com/myaccount/image/upload/v123/hero-desktop.jpg","imageUrlMobile":"https://res.cloudinary.com/myaccount/image/upload/v123/hero-mobile.jpg","linkUrl":"https://isafe.gov.lk/emergency-info","alt":"Emergency Information Banner"}]
```

## Multiple Banners (Slideshow)

When you add multiple banner objects to the array, they will automatically rotate in a slideshow:
- Each image displays for 2 seconds
- Images transition smoothly with a fade effect
- Navigation dots appear at the bottom (users can click to jump to any image)
- The slideshow loops continuously

**Example with 3 banners:**
```json
[
  {
    "imageUrlDesktop": "https://example.com/desktop-en.jpg",
    "imageUrlMobile": "https://example.com/mobile-en.jpg",
    "linkUrl": "en/compensation/apply",
    "alt": "English Banner"
  },
  {
    "imageUrlDesktop": "https://example.com/desktop-si.jpg",
    "imageUrlMobile": "https://example.com/mobile-si.jpg",
    "linkUrl": "si/compensation/apply",
    "alt": "Sinhala Banner"
  },
  {
    "imageUrlDesktop": "https://example.com/desktop-ta.jpg",
    "imageUrlMobile": "https://example.com/mobile-ta.jpg",
    "linkUrl": "ta/compensation/apply",
    "alt": "Tamil Banner"
  }
]
```

**Important:** All images must be in the same environment variable as a single JSON array. Do NOT create separate variables like `NEXT_PUBLIC_HERO_BANNER_IMAGES_EN`, `NEXT_PUBLIC_HERO_BANNER_IMAGES_SI`, etc. - only the last one will be used!

## Troubleshooting

**Problem:** Banner doesn't show up
- **Solution:** 
  - Check that `NEXT_PUBLIC_HERO_BANNER_IMAGES` is set correctly
  - Verify the JSON format is valid (use a JSON validator)
  - Make sure you restarted the application after changing the environment variable
  - Check that image URLs are publicly accessible

**Problem:** Image URLs are broken
- **Solution:**
  - Verify the URLs work by opening them in a browser
  - Make sure images are publicly accessible (not behind authentication)
  - Check that image files exist and haven't been deleted

**Problem:** Banner link doesn't work
- **Solution:**
  - Make sure `linkUrl` is included in your JSON
  - Verify the URL starts with `http://` or `https://`
  - Test the URL directly in your browser

**Problem:** Wrong image shows on mobile/desktop
- **Solution:**
  - Double-check that `imageUrlDesktop` and `imageUrlMobile` are correct
  - Make sure you're using the right URLs for each version

## Quick Reference

**Environment Variable:** `NEXT_PUBLIC_HERO_BANNER_IMAGES`

**Format:** JSON array with one object

**Required Fields:** `imageUrlDesktop`, `imageUrlMobile`

**Optional Fields:** `linkUrl`, `alt`

**Where to edit:** `.env.local` file or hosting platform environment variables

