# How to Change the Top Announcement Banner Text

This guide explains how to change the announcement banner that appears at the very top of the website.

## What is the Announcement Banner?

The announcement banner is the colored bar that appears at the top of every page. It's useful for displaying:
- Important announcements
- Emergency information
- Updates or notices
- Warnings or alerts

## Step-by-Step Instructions

### Step 1: Access Environment Variables

Find your `.env.local` file (if running locally) or go to your hosting platform's environment variables settings.

### Step 2: Set the Announcement Text

Add or update this environment variable:

```
NEXT_PUBLIC_ANNOUNCEMENT_TEXT="Your announcement message here"
```

**Example:**
```
NEXT_PUBLIC_ANNOUNCEMENT_TEXT="Emergency hotline: Call 1990 for assistance"
```

### Step 3: (Optional) Choose the Banner Style

You can set the banner color/style by adding:

```
NEXT_PUBLIC_ANNOUNCEMENT_VARIANT=info
```

**Available options:**
- `info` - Blue banner (default) - for general information
- `warning` - Yellow banner - for warnings
- `success` - Green banner - for success messages
- `error` - Red banner - for errors or urgent alerts

**Example:**
```
NEXT_PUBLIC_ANNOUNCEMENT_VARIANT=warning
```

### Step 4: (Optional) Make it Dismissible

If you want users to be able to close the banner, add:

```
NEXT_PUBLIC_ANNOUNCEMENT_DISMISSIBLE=true
```

If you don't add this or set it to `false`, users cannot close the banner.

### Step 5: Restart Your Application

After saving the environment variables:

1. **If running locally:** Stop your server (Ctrl+C) and restart with `npm run dev`
2. **If deployed:** Redeploy your application or restart your hosting service

### Step 6: Verify the Banner

Visit your website and check:
- The banner appears at the top
- The text is correct
- The color matches your chosen variant
- If dismissible, the X button works

## Complete Example Configuration

Here's a full example of all announcement banner settings:

```
NEXT_PUBLIC_ANNOUNCEMENT_TEXT="Important: System maintenance scheduled for Sunday 2 AM - 4 AM"
NEXT_PUBLIC_ANNOUNCEMENT_VARIANT=warning
NEXT_PUBLIC_ANNOUNCEMENT_DISMISSIBLE=true
```

## Removing the Banner

To hide the announcement banner, you have two options:

**Option 1:** Set an empty text
```
NEXT_PUBLIC_ANNOUNCEMENT_TEXT=""
```

**Option 2:** Remove the variable entirely (or don't set it)

When the text is empty or the variable doesn't exist, the banner won't appear.

## Banner Style Examples

### Info Banner (Blue)
```
NEXT_PUBLIC_ANNOUNCEMENT_TEXT="Welcome to iSafe - Your missing person reporting platform"
NEXT_PUBLIC_ANNOUNCEMENT_VARIANT=info
```
Use for: General information, welcome messages

### Warning Banner (Yellow)
```
NEXT_PUBLIC_ANNOUNCEMENT_TEXT="⚠️ High alert: Severe weather warning in effect"
NEXT_PUBLIC_ANNOUNCEMENT_VARIANT=warning
```
Use for: Warnings, important notices

### Success Banner (Green)
```
NEXT_PUBLIC_ANNOUNCEMENT_TEXT="✅ System is operational - All services running normally"
NEXT_PUBLIC_ANNOUNCEMENT_VARIANT=success
```
Use for: Positive messages, confirmations

### Error Banner (Red)
```
NEXT_PUBLIC_ANNOUNCEMENT_TEXT="🚨 URGENT: Emergency evacuation procedures now in effect"
NEXT_PUBLIC_ANNOUNCEMENT_VARIANT=error
```
Use for: Urgent alerts, errors, critical information

## Tips for Writing Announcements

- **Keep it short:** The banner is narrow, so keep messages brief
- **Be clear:** Use simple, direct language
- **Use emojis sparingly:** One emoji can help draw attention, but don't overdo it
- **Update regularly:** Change announcements to keep information current
- **Test on mobile:** Check how your message looks on phones

## Troubleshooting

**Problem:** Banner doesn't appear
- **Solution:**
  - Make sure `NEXT_PUBLIC_ANNOUNCEMENT_TEXT` is set and not empty
  - Check that you restarted the application after changing the variable
  - Verify the variable name is spelled correctly (case-sensitive)

**Problem:** Banner text is cut off
- **Solution:** Make your message shorter. The banner has limited space, especially on mobile devices.

**Problem:** Wrong color/style
- **Solution:**
  - Check that `NEXT_PUBLIC_ANNOUNCEMENT_VARIANT` is set to one of: `info`, `warning`, `success`, or `error`
  - Default is `info` (blue) if not specified

**Problem:** Users can't dismiss it
- **Solution:** Add `NEXT_PUBLIC_ANNOUNCEMENT_DISMISSIBLE=true` to your environment variables

## Quick Reference

**Main Variable:** `NEXT_PUBLIC_ANNOUNCEMENT_TEXT`
- Set to your message text
- Set to empty string `""` to hide banner

**Style Variable:** `NEXT_PUBLIC_ANNOUNCEMENT_VARIANT`
- Options: `info`, `warning`, `success`, `error`
- Optional (defaults to `info`)

**Dismissible:** `NEXT_PUBLIC_ANNOUNCEMENT_DISMISSIBLE`
- Set to `true` to allow users to close banner
- Optional (defaults to `false`)

**Where to edit:** `.env.local` file or hosting platform environment variables

