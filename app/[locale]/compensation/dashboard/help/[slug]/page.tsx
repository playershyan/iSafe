'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { MarkdownContent } from '@/components/features/MarkdownContent';
import { ArrowLeft, HelpCircle } from 'lucide-react';

const guides: Record<string, string> = {
  'how-to-register-new-arrivals-to-shelter': `# How to Register New Arrivals to a Shelter

This guide explains how shelter staff can register new people arriving at their displacement shelter.

## Step-by-Step Instructions

### Step 1: Access the Registration Page

1. Open your web browser and go to the iSafe website
2. Look for the **"Register"** button or link in the navigation menu
3. Click on it to go to the registration page

### Step 2: Log In to Your Shelter Account

1. On the registration page, you will see a login form
2. Enter your **Shelter Code** (for example: \`CMB-CC-001\`)
3. Enter your **Access Code** (the password for your shelter)
4. Click the **"Login"** button

**Note:** If you don't have your shelter code and access code, contact your administrator.

### Step 3: Fill Out the Registration Form

Once you're logged in, you'll see a form to register a new person. Fill in the following information:

#### Required Information (marked with *)

- **Photo** (Optional): Click to upload a photo of the person
- **Full Name** *: Enter the person's full name
- **Age** *: Enter the person's age
- **Gender** *: Select Male, Female, or Other
- **NIC Number** (Optional): Enter the National Identity Card number if available
- **Contact Number** (Optional): Enter a phone number if the person has one
- **Special Notes** (Optional): Add any important information about the person

### Step 4: Review and Submit

1. Review all the information you entered
2. Make sure all required fields are filled
3. Click the **"Register"** or **"Submit"** button

### Step 5: Check for Matches

After submitting, the system will automatically check if this person matches any missing person reports. 

- **If matches are found**: You'll see a list of potential matches. Review them and confirm if any match the person you're registering.
- **If no matches are found**: You'll see a success message. The person has been registered successfully.

### Step 6: Registration Complete

The person is now registered in the system. You can register another person by filling out the form again.

## Important Notes

- **Privacy**: Make sure you have permission to register the person's information
- **Accuracy**: Double-check all information before submitting
- **Photos**: Photos help with identification and matching, but they are optional
- **Logout**: When you're done, click the logout button to protect your account

## Troubleshooting

**Problem:** I can't log in
- **Solution:** Check that your Shelter Code and Access Code are correct. Contact your administrator if you've forgotten them.

**Problem:** The form won't submit
- **Solution:** Make sure all required fields (marked with *) are filled in correctly.

**Problem:** Photo won't upload
- **Solution:** Make sure the photo is:
  - In a supported format (JPG, PNG, WebP)
  - Less than 10MB in size
  - A valid image file

## Getting Help

If you need help or have questions:
- Contact your shelter administrator
- Check the iSafe help documentation
- Contact the iSafe support team`,

  'how-to-change-hero-banner-image': `# How to Change Hero Banner Image and Link URL

This guide explains how to change the large banner image that appears at the top of the home page, and set up a link when people click on it.

## What You Need

- Access to your server or hosting environment
- Access to edit environment variables (usually in \`.env.local\` file or your hosting platform's settings)
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

- Desktop image URL example: \`https://res.cloudinary.com/your-account/image/upload/desktop-banner.jpg\`
- Mobile image URL example: \`https://res.cloudinary.com/your-account/image/upload/mobile-banner.jpg\`

### Step 3: Edit Environment Variables

Find your \`.env.local\` file (or the environment variables section in your hosting platform).

Look for or add this variable:

\`\`\`
NEXT_PUBLIC_HERO_BANNER_IMAGES
\`\`\`

### Step 4: Format the Configuration

The banner configuration uses JSON format. You can add **one or more** banner images. Multiple images will automatically create a rotating slideshow.

#### Single Image Format

For a single banner image:

\`\`\`json
[
  {
    "imageUrlDesktop": "https://your-image-url.com/desktop-banner.jpg",
    "imageUrlMobile": "https://your-image-url.com/mobile-banner.jpg",
    "linkUrl": "https://example.com/page-to-link-to",
    "alt": "Description of the banner image"
  }
]
\`\`\`

#### Multiple Images Format (Slideshow)

To add multiple images that will rotate automatically:

\`\`\`json
[
  {
    "imageUrlDesktop": "https://your-image-url.com/desktop-banner-1.jpg",
    "imageUrlMobile": "https://your-image-url.com/mobile-banner-1.jpg",
    "linkUrl": "https://example.com/page-1",
    "alt": "First banner description"
  },
  {
    "imageUrlDesktop": "https://your-image-url.com/desktop-banner-2.jpg",
    "imageUrlMobile": "https://your-image-url.com/mobile-banner-2.jpg",
    "linkUrl": "https://example.com/page-2",
    "alt": "Second banner description"
  },
  {
    "imageUrlDesktop": "https://your-image-url.com/desktop-banner-3.jpg",
    "imageUrlMobile": "https://your-image-url.com/mobile-banner-3.jpg",
    "linkUrl": "https://example.com/page-3",
    "alt": "Third banner description"
  }
]
\`\`\`

**Explanation of each field:**
- \`imageUrlDesktop\`: The image URL for desktop/tablet screens (required)
- \`imageUrlMobile\`: The image URL for mobile phones (required)
- \`linkUrl\`: Where users go when they click the banner (optional - leave out if you don't want a link)
- \`alt\`: Description text for accessibility (optional but recommended)

**Important Notes about Multiple Images:**
- Each image in the array must be a separate object with its own desktop/mobile URLs
- When you add multiple images, they will automatically rotate every 2 seconds
- Users can click on the dots at the bottom to manually switch between images
- Each image can have its own unique link URL
- There's no limit to how many images you can add (though 3-5 is recommended for best performance)

### Step 5: Add to Environment File

In your \`.env.local\` file, add or update:

**For a single image:**
\`\`\`
NEXT_PUBLIC_HERO_BANNER_IMAGES=[{"imageUrlDesktop":"https://your-image-url.com/desktop-banner.jpg","imageUrlMobile":"https://your-image-url.com/mobile-banner.jpg","linkUrl":"https://example.com","alt":"Banner description"}]
\`\`\`

**For multiple images (slideshow):**
\`\`\`
NEXT_PUBLIC_HERO_BANNER_IMAGES=[{"imageUrlDesktop":"https://your-image-url.com/desktop-banner-1.jpg","imageUrlMobile":"https://your-image-url.com/mobile-banner-1.jpg","linkUrl":"https://example.com/page-1","alt":"First banner"},{"imageUrlDesktop":"https://your-image-url.com/desktop-banner-2.jpg","imageUrlMobile":"https://your-image-url.com/mobile-banner-2.jpg","linkUrl":"https://example.com/page-2","alt":"Second banner"},{"imageUrlDesktop":"https://your-image-url.com/desktop-banner-3.jpg","imageUrlMobile":"https://your-image-url.com/mobile-banner-3.jpg","linkUrl":"https://example.com/page-3","alt":"Third banner"}]
\`\`\`

**Important:** 
- Put everything on one line (remove all line breaks from the JSON)
- Make sure the JSON is valid (use an online JSON validator if unsure)
- When adding multiple images, separate each image object with a comma
- Each image object must be enclosed in curly braces \`{}\`

### Step 6: Restart Your Application

After saving the environment file:

1. If running locally: Stop your development server (press Ctrl+C) and restart it with \`npm run dev\`
2. If deployed: Redeploy your application or restart your hosting service

### Step 7: Check the Home Page

Visit your home page and verify:
- The banner image displays correctly
- The desktop version shows on larger screens
- The mobile version shows on phones
- Clicking the banner (if you set a link) takes you to the correct page

## Example Configurations

### Single Image Example

\`\`\`
NEXT_PUBLIC_HERO_BANNER_IMAGES=[{"imageUrlDesktop":"https://res.cloudinary.com/myaccount/image/upload/v123/hero-desktop.jpg","imageUrlMobile":"https://res.cloudinary.com/myaccount/image/upload/v123/hero-mobile.jpg","linkUrl":"https://isafe.gov.lk/emergency-info","alt":"Emergency Information Banner"}]
\`\`\`

### Multiple Images Example (Slideshow)

Here's an example with three different banners that will rotate automatically:

\`\`\`
NEXT_PUBLIC_HERO_BANNER_IMAGES=[{"imageUrlDesktop":"https://res.cloudinary.com/myaccount/image/upload/v123/compensation-desktop.jpg","imageUrlMobile":"https://res.cloudinary.com/myaccount/image/upload/v123/compensation-mobile.jpg","linkUrl":"en/compensation/apply","alt":"Allowance application"},{"imageUrlDesktop":"https://res.cloudinary.com/myaccount/image/upload/v123/emergency-desktop.jpg","imageUrlMobile":"https://res.cloudinary.com/myaccount/image/upload/v123/emergency-mobile.jpg","linkUrl":"https://isafe.gov.lk/emergency-info","alt":"Emergency Information"},{"imageUrlDesktop":"https://res.cloudinary.com/myaccount/image/upload/v123/help-desktop.jpg","imageUrlMobile":"https://res.cloudinary.com/myaccount/image/upload/v123/help-mobile.jpg","linkUrl":"en/contact","alt":"Contact Us"}]
\`\`\`

**What happens with multiple images:**
- Images automatically rotate every 2 seconds
- Users see navigation dots at the bottom to manually switch between images
- Each image can link to a different page when clicked
- All images share the same size and positioning on the page

## Troubleshooting

**Problem:** Banner doesn't show up
- **Solution:** 
  - Check that \`NEXT_PUBLIC_HERO_BANNER_IMAGES\` is set correctly
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
  - Make sure \`linkUrl\` is included in your JSON
  - Verify the URL starts with \`http://\` or \`https://\`
  - Test the URL directly in your browser

## Tips for Multiple Images

When using multiple banner images:

- **Image Count:** 3-5 images work best. Too many may slow down page loading
- **Consistent Sizing:** Keep all images the same dimensions for a smooth slideshow experience
- **Different Links:** Each image can link to a different page - useful for promoting multiple features
- **Alt Text:** Use descriptive alt text for each image for better accessibility
- **Same Locale:** If you have locale-specific banners, each locale can have its own set of images
- **Auto-rotation:** Images automatically change every 2 seconds - users can pause by clicking a dot

## Quick Reference

**Environment Variable:** \`NEXT_PUBLIC_HERO_BANNER_IMAGES\`

**Format:** JSON array with one or more objects

**Single Image:** Array with one object \`[{...}]\`

**Multiple Images:** Array with multiple objects \`[{...}, {...}, {...}]\` (creates slideshow)

**Required Fields:** \`imageUrlDesktop\`, \`imageUrlMobile\`

**Optional Fields:** \`linkUrl\`, \`alt\`

**Slideshow:** Automatically enabled when array has 2+ images, rotates every 2 seconds

**Where to edit:** \`.env.local\` file or hosting platform environment variables`,

  'how-to-change-announcement-banner-text': `# How to Change the Top Announcement Banner Text

This guide explains how to change the announcement banner that appears at the very top of the website.

## What is the Announcement Banner?

The announcement banner is the colored bar that appears at the top of every page. It's useful for displaying:
- Important announcements
- Emergency information
- Updates or notices
- Warnings or alerts

## Step-by-Step Instructions

### Step 1: Access Environment Variables

Find your \`.env.local\` file (if running locally) or go to your hosting platform's environment variables settings.

### Step 2: Set the Announcement Text

Add or update this environment variable:

\`\`\`
NEXT_PUBLIC_ANNOUNCEMENT_TEXT="Your announcement message here"
\`\`\`

**Example:**
\`\`\`
NEXT_PUBLIC_ANNOUNCEMENT_TEXT="Emergency hotline: Call 1990 for assistance"
\`\`\`

### Step 3: (Optional) Choose the Banner Style

You can set the banner color/style by adding:

\`\`\`
NEXT_PUBLIC_ANNOUNCEMENT_VARIANT=info
\`\`\`

**Available options:**
- \`info\` - Blue banner (default) - for general information
- \`warning\` - Yellow banner - for warnings
- \`success\` - Green banner - for success messages
- \`error\` - Red banner - for errors or urgent alerts

**Example:**
\`\`\`
NEXT_PUBLIC_ANNOUNCEMENT_VARIANT=warning
\`\`\`

### Step 4: (Optional) Make it Dismissible

If you want users to be able to close the banner, add:

\`\`\`
NEXT_PUBLIC_ANNOUNCEMENT_DISMISSIBLE=true
\`\`\`

If you don't add this or set it to \`false\`, users cannot close the banner.

### Step 5: Restart Your Application

After saving the environment variables:

1. **If running locally:** Stop your server (Ctrl+C) and restart with \`npm run dev\`
2. **If deployed:** Redeploy your application or restart your hosting service

### Step 6: Verify the Banner

Visit your website and check:
- The banner appears at the top
- The text is correct
- The color matches your chosen variant
- If dismissible, the X button works

## Complete Example Configuration

Here's a full example of all announcement banner settings:

\`\`\`
NEXT_PUBLIC_ANNOUNCEMENT_TEXT="Important: System maintenance scheduled for Sunday 2 AM - 4 AM"
NEXT_PUBLIC_ANNOUNCEMENT_VARIANT=warning
NEXT_PUBLIC_ANNOUNCEMENT_DISMISSIBLE=true
\`\`\`

## Removing the Banner

To hide the announcement banner, you have two options:

**Option 1:** Set an empty text
\`\`\`
NEXT_PUBLIC_ANNOUNCEMENT_TEXT=""
\`\`\`

**Option 2:** Remove the variable entirely (or don't set it)

When the text is empty or the variable doesn't exist, the banner won't appear.

## Banner Style Examples

### Info Banner (Blue)
\`\`\`
NEXT_PUBLIC_ANNOUNCEMENT_TEXT="Welcome to iSafe - Your missing person reporting platform"
NEXT_PUBLIC_ANNOUNCEMENT_VARIANT=info
\`\`\`
Use for: General information, welcome messages

### Warning Banner (Yellow)
\`\`\`
NEXT_PUBLIC_ANNOUNCEMENT_TEXT="⚠️ High alert: Severe weather warning in effect"
NEXT_PUBLIC_ANNOUNCEMENT_VARIANT=warning
\`\`\`
Use for: Warnings, important notices

### Success Banner (Green)
\`\`\`
NEXT_PUBLIC_ANNOUNCEMENT_TEXT="✅ System is operational - All services running normally"
NEXT_PUBLIC_ANNOUNCEMENT_VARIANT=success
\`\`\`
Use for: Positive messages, confirmations

### Error Banner (Red)
\`\`\`
NEXT_PUBLIC_ANNOUNCEMENT_TEXT="🚨 URGENT: Emergency evacuation procedures now in effect"
NEXT_PUBLIC_ANNOUNCEMENT_VARIANT=error
\`\`\`
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
  - Make sure \`NEXT_PUBLIC_ANNOUNCEMENT_TEXT\` is set and not empty
  - Check that you restarted the application after changing the variable
  - Verify the variable name is spelled correctly (case-sensitive)

**Problem:** Banner text is cut off
- **Solution:** Make your message shorter. The banner has limited space, especially on mobile devices.

**Problem:** Wrong color/style
- **Solution:**
  - Check that \`NEXT_PUBLIC_ANNOUNCEMENT_VARIANT\` is set to one of: \`info\`, \`warning\`, \`success\`, or \`error\`
  - Default is \`info\` (blue) if not specified

**Problem:** Users can't dismiss it
- **Solution:** Add \`NEXT_PUBLIC_ANNOUNCEMENT_DISMISSIBLE=true\` to your environment variables

## Quick Reference

**Main Variable:** \`NEXT_PUBLIC_ANNOUNCEMENT_TEXT\`
- Set to your message text
- Set to empty string \`""\` to hide banner

**Style Variable:** \`NEXT_PUBLIC_ANNOUNCEMENT_VARIANT\`
- Options: \`info\`, \`warning\`, \`success\`, \`error\`
- Optional (defaults to \`info\`)

**Dismissible:** \`NEXT_PUBLIC_ANNOUNCEMENT_DISMISSIBLE\`
- Set to \`true\` to allow users to close banner
- Optional (defaults to \`false\`)

**Where to edit:** \`.env.local\` file or hosting platform environment variables`,

  'how-to-change-default-admin-login-credentials': `# How to Change Default Admin Login Credentials

This guide explains how to change the default admin username and password for the compensation dashboard.

## Default Credentials

The default admin login credentials are:
- **Username:** \`admin\`
- **Password:** \`Admin@2025\`

**⚠️ IMPORTANT:** Change these immediately after first setup for security!

## Method 1: Using the Seed Script (Recommended)

This is the easiest way to change the admin password.

### Step 1: Edit the Seed Script

1. Open the file: \`scripts/seed-compensation-admin.ts\`
2. Find these lines (around line 25-26):
   \`\`\`typescript
   const username = 'admin';
   const password = 'Admin@2025';
   \`\`\`
3. Change them to your desired username and password:
   \`\`\`typescript
   const username = 'your-new-username';
   const password = 'YourNewSecurePassword123!';
   \`\`\`

### Step 2: Run the Script

1. Open your terminal/command prompt
2. Navigate to your project folder
3. Run the command:
   \`\`\`bash
   npx tsx scripts/seed-compensation-admin.ts
   \`\`\`

### Step 3: Verify the Change

1. Go to the admin login page (usually at \`/compensation/admin\`)
2. Try logging in with your new credentials
3. If it works, you're done!

**Note:** If the admin user already exists, the script will update the password. If it doesn't exist, it will create a new admin user.

## Method 2: Direct Database Update

If you prefer to update the database directly:

### Step 1: Hash Your New Password

You'll need to hash your password first. Use Node.js to do this:

1. Open Node.js in your terminal:
   \`\`\`bash
   node
   \`\`\`
2. Run these commands:
   \`\`\`javascript
   const bcrypt = require('bcryptjs');
   bcrypt.hash('YourNewPassword123!', 10).then(hash => console.log(hash));
   \`\`\`
3. Copy the hashed password (a long string starting with \`$2a$\`)

### Step 2: Update the Database

Using Supabase Dashboard or a database tool:

1. Go to your Supabase project dashboard
2. Open the SQL Editor
3. Run this SQL command (replace with your values):

\`\`\`sql
UPDATE compensation_admins
SET 
  username = 'your-new-username',
  password_hash = 'your-hashed-password-here',
  updated_at = NOW()
WHERE username = 'admin';
\`\`\`

## Password Security Best Practices

When choosing a new password:

- ✅ Use at least 12 characters
- ✅ Mix uppercase and lowercase letters
- ✅ Include numbers
- ✅ Include special characters (!@#$%^&*)
- ✅ Don't use common words or personal information
- ✅ Use a password manager
- ❌ Don't share your password
- ❌ Don't write it down where others can see it

**Example of a good password:**
- \`iSafe@2025Secure!Admin\`

**Examples of bad passwords:**
- \`password123\`
- \`admin\`
- \`12345678\`
- \`Admin@2025\` (the default - change it!)

## Troubleshooting

**Problem:** Script says "Error creating admin"
- **Solution:**
  - Check that your \`.env.local\` file has \`NEXT_PUBLIC_SUPABASE_URL\` and \`SUPABASE_SERVICE_ROLE_KEY\` set correctly
  - Make sure you have internet connection
  - Verify your Supabase project is active

**Problem:** Can't log in after changing password
- **Solution:**
  - Double-check that you're using the exact username and password you set
  - Make sure the script ran successfully (check for error messages)
  - Try clearing your browser cookies and logging in again
  - If using database method, verify the password was hashed correctly

**Problem:** I forgot my new password
- **Solution:**
  - Run the seed script again with a new password
  - Or update it directly in the database

## Quick Reference

**Default Username:** \`admin\`  
**Default Password:** \`Admin@2025\`

**To change:** Edit \`scripts/seed-compensation-admin.ts\` and run:
\`\`\`bash
npx tsx scripts/seed-compensation-admin.ts
\`\`\`

**Database Table:** \`compensation_admins\`  
**Columns:** \`username\`, \`password_hash\`

**Security:** Always use a strong, unique password!`,

  'how-to-assign-shelter-login-credentials': `# How to Assign Displacement Shelter Login Credentials Through the Dashboard

This guide explains how administrators can assign or change login credentials (Shelter Code and Access Code) for displacement shelters through the compensation dashboard.

## Who Can Do This?

Only compensation administrators with dashboard access can assign shelter credentials. You need to be logged into the compensation dashboard.

## Step-by-Step Instructions

### Step 1: Log In to the Compensation Dashboard

1. Go to the compensation admin login page (usually at \`/compensation/admin\`)
2. Enter your admin username and password
3. Click "Login"

### Step 2: Navigate to Staff Centers Management

1. After logging in, you'll see the dashboard
2. Look for a button or link that says **"Manage Staff Centers"** or **"Staff Centers"**
3. Click on it

### Step 3: View Existing Centers

You'll see a table showing all displacement camps/staff centers:
- Center Name
- Center Code (this is the Shelter Code)
- District
- Access Code status (whether one is set or not)
- Status (Active/Inactive)
- Action buttons (Edit, Delete)

### Step 4: Create a New Center with Credentials

To create a new shelter center with login credentials:

1. Click the **"Add New Center"** or **"+"** button
2. A form will appear. Fill in the details:
   - **Center Name** * (required): e.g., "Colombo Central Camp"
   - **Center Code** * (required): e.g., "CMB-CC-001" - This will be the Shelter Code for login
   - **District** * (required): e.g., "Colombo"
   - **Address** (optional): Full address of the center
   - **Contact Person** (optional): Name of the person in charge
   - **Contact Number** (optional): Phone number
   - **Access Code** * (required for new centers): Enter the password that shelter staff will use to log in

3. Click **"Create"** to save

**Important Notes:**
- The **Center Code** you enter becomes the **Shelter Code** that staff use to log in
- The **Access Code** is the password - choose a strong one and share it securely with shelter staff
- Access codes must be at least 4 characters long

### Step 5: Change Credentials for Existing Center

To update the access code for an existing center:

1. Find the center in the table
2. Click the **Edit** button (pencil icon) next to it
3. In the form that appears, you can:
   - Update center information (name, address, etc.)
   - Change the **Access Code** by entering a new one in the "New Access Code" field
   - Leave the access code field blank if you don't want to change it

4. Click **"Update"** to save changes

**Note:** The Center Code (Shelter Code) cannot be easily changed. If you need to change it, you may need to create a new center and delete the old one.

### Step 6: Share Credentials with Shelter Staff

After creating or updating credentials, you need to securely share them with the shelter staff:

1. **Shelter Code:** The Center Code (e.g., \`CMB-CC-001\`)
2. **Access Code:** The password you set

**Security Best Practices:**
- Share credentials through secure channels (encrypted email, secure messaging)
- Don't share via public channels
- Keep a secure record of which center has which credentials

## Important Information

### About Access Codes

- Access codes are stored securely (encrypted/hashed) in the database
- Once set, you cannot view the actual access code, only whether one is set
- When editing, entering a new access code will replace the old one
- Access codes must be at least 4 characters long

### About Shelter Codes (Center Codes)

- These are the codes shelter staff enter to log in
- They should be unique (the system will prevent duplicates)
- Format is typically: \`DISTRICT-TYPE-NUMBER\` (e.g., \`CMB-CC-001\`)
- Once created, changing the code is difficult - be careful when creating

### Security Reminders

- ⚠️ Never share credentials in public channels
- ✅ Use strong access codes (mix of letters, numbers, special characters)
- ✅ Keep records of which staff centers have which credentials
- ✅ Change access codes if they may have been compromised
- ✅ Deactivate (set to inactive) centers that are no longer in use

## Troubleshooting

**Problem:** Can't access the Staff Centers page
- **Solution:** 
  - Make sure you're logged in as a compensation admin
  - Check that you have the right permissions
  - Try logging out and logging back in

**Problem:** "Access code is required" error
- **Solution:** Make sure you entered an access code when creating a new center. Access codes are required for new centers.

**Problem:** Center code already exists
- **Solution:** Each center code must be unique. Choose a different code (maybe change the number at the end).

**Problem:** Staff can't log in with the credentials I set
- **Solution:**
  - Verify the Center Code matches exactly (case-sensitive)
  - Make sure the Access Code was saved correctly (check for typos)
  - Confirm the center status is "Active"
  - Try editing the center and setting a new access code

**Problem:** I forgot what access code I set
- **Solution:** You cannot view existing access codes (they're encrypted). You'll need to edit the center and set a new access code, then share it with the shelter staff.

## Quick Reference

**To create a new shelter:**
1. Login to dashboard
2. Go to "Staff Centers Management"
3. Click "Add New Center"
4. Fill in Center Code (this becomes the Shelter Code)
5. Set an Access Code (this is the password)
6. Click "Create"

**To change access code:**
1. Find the center in the list
2. Click Edit (pencil icon)
3. Enter new access code
4. Click "Update"

**Credentials staff need:**
- Shelter Code = Center Code
- Access Code = Password you set`,

  'how-to-change-ta-json-with-tamil-fonts': `# How to Change ta.json with Tamil Fonts

This guide explains how to update the Tamil translation file (ta.json) and ensure Tamil text displays correctly with proper fonts.

## What is ta.json?

The \`ta.json\` file contains all the Tamil translations for the iSafe website. It's located in the \`messages/\` folder of your project.

## Step-by-Step Instructions

### Step 1: Locate the ta.json File

1. Open your project folder
2. Navigate to the \`messages/\` folder
3. Find the file named \`ta.json\`

**Full path example:** \`messages/ta.json\`

### Step 2: Open the File

You can open \`ta.json\` with:
- Any text editor (Notepad, TextEdit, VS Code, etc.)
- A code editor (recommended for better editing experience)

**Recommended editors:**
- Visual Studio Code (free)
- Sublime Text
- Atom

### Step 3: Understand the File Structure

The file is in JSON format and looks like this:

\`\`\`json
{
  "common": {
    "appName": "iSafe",
    "search": "தேடல்",
    "cancel": "ரத்துசெய்"
  },
  "home": {
    "title": "காணாமல் போனவர்களைத் தேடுங்கள்",
    "reportButton": "காணாமல் போனவரைப் பதிவு செய்யுங்கள்"
  }
}
\`\`\`

- Each section (like \`"common"\`, \`"home"\`) groups related translations
- The left side (in quotes) is the key - don't change this
- The right side (in quotes after the colon) is the Tamil text - this is what you change

### Step 4: Edit Tamil Text

To change any Tamil text:

1. Find the text you want to change (on the right side of the colon)
2. Change only the Tamil text between the quotes
3. **Don't change** the key (left side) or the structure (brackets, commas, quotes)

**Example:**

**Before:**
\`\`\`json
"search": "தேடல்"
\`\`\`

**After:**
\`\`\`json
"search": "தேடு"
\`\`\`

**Important Rules:**
- ✅ Change only the Tamil text between the quotes
- ✅ Keep all quotes, commas, and brackets exactly as they are
- ✅ Don't delete any keys
- ✅ Make sure every opening bracket \`{\` has a closing bracket \`}\`
- ✅ Make sure every opening quote \`"\` has a closing quote \`"\`

### Step 5: Save the File

1. After making your changes, save the file
2. Make sure the file is saved as \`ta.json\` (not \`ta.json.txt\`)
3. Keep it in the \`messages/\` folder

### Step 6: Check for Errors

JSON files must be perfectly formatted. Common mistakes:

**❌ Missing comma:**
\`\`\`json
"search": "தேடல்"
"cancel": "ரத்துசெய்"  // Missing comma after "தேடல்"
\`\`\`

**✅ Correct:**
\`\`\`json
"search": "தேடல்",
"cancel": "ரத்துசெய்"
\`\`\`

**❌ Missing quote:**
\`\`\`json
"search": "தேடல்  // Missing closing quote
\`\`\`

**✅ Correct:**
\`\`\`json
"search": "தேடல்"
\`\`\`

### Step 7: Validate JSON Format

Before saving, validate your JSON:

**Option 1: Online Validator**
1. Copy the entire contents of your \`ta.json\` file
2. Go to https://jsonlint.com/
3. Paste your JSON
4. Click "Validate JSON"
5. Fix any errors it shows

**Option 2: VS Code**
- If using VS Code, it will highlight JSON errors in red
- Hover over red squiggly lines to see what's wrong

### Step 8: Test Your Changes

1. Restart your development server (if running locally)
2. Visit your website
3. Switch the language to Tamil (using the language switcher)
4. Check that your changes appear correctly

## Tamil Font Display

### How Tamil Fonts Work

The website should automatically display Tamil text correctly. The system uses:

- **System fonts** for Tamil text
- **Web-safe Tamil fonts** that come with most devices
- **Fallback fonts** if the primary font isn't available

### Ensuring Tamil Text Displays Correctly

The fonts are configured in the project's CSS/Tailwind configuration. Tamil text should work automatically, but if you see boxes or question marks:

1. **Check your browser:** Make sure your browser supports Tamil (all modern browsers do)
2. **Check the JSON:** Make sure the Tamil characters are correct in the file
3. **Check encoding:** The file should be saved as UTF-8 encoding

## Troubleshooting

**Problem:** Website shows boxes or question marks instead of Tamil
- **Solution:**
  - Check that the file is saved as UTF-8 encoding
  - Verify the Tamil characters are correct in the file
  - Clear your browser cache and reload

**Problem:** JSON error when loading the page
- **Solution:**
  - Validate your JSON using an online validator
  - Check for missing commas, quotes, or brackets
  - Make sure there are no extra commas at the end of objects

**Problem:** Changes don't appear on the website
- **Solution:**
  - Make sure you saved the file
  - Restart your development server
  - Clear browser cache
  - Hard refresh the page (Ctrl+F5 or Cmd+Shift+R)

## Quick Reference

**File Location:** \`messages/ta.json\`

**File Format:** JSON (JavaScript Object Notation)

**Encoding:** UTF-8

**What to change:** Only the Tamil text (right side of the colon)

**What NOT to change:** Keys (left side), structure, brackets, commas

**Validation:** Use jsonlint.com or VS Code to check for errors

**After editing:** Save file → Restart server → Test on website`
};

export default function GuidePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const router = useRouter();
  const [locale, setLocale] = useState('en');
  const [slug, setSlug] = useState<string>('');

  useEffect(() => {
    params.then((p) => {
      setLocale(p.locale);
      setSlug(p.slug);
    });
  }, [params]);

  const content = guides[slug];
  const guideTitles: Record<string, string> = {
    'how-to-register-new-arrivals-to-shelter': 'How to Register New Arrivals to a Shelter',
    'how-to-change-hero-banner-image': 'How to Change Hero Banner Image and Link URL',
    'how-to-change-announcement-banner-text': 'How to Change the Top Announcement Banner Text',
    'how-to-change-default-admin-login-credentials': 'How to Change Default Admin Login Credentials',
    'how-to-assign-shelter-login-credentials': 'How to Assign Displacement Shelter Login Credentials',
    'how-to-change-ta-json-with-tamil-fonts': 'How to Change ta.json with Tamil Fonts',
  };

  if (!content) {
    return (
      <main className="min-h-screen bg-gray-50 py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="secondary"
            onClick={() => router.push(`/${locale}/compensation/dashboard/help`)}
            size="small"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Help
          </Button>
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Guide Not Found</h1>
            <p className="text-gray-600">The requested guide could not be found.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="secondary"
            onClick={() => router.push(`/${locale}/compensation/dashboard/help`)}
            size="small"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Help
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <HelpCircle className="w-8 h-8 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {guideTitles[slug] || 'Guide'}
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow p-6 md:p-8">
          <MarkdownContent content={content} />
        </div>
      </div>
    </main>
  );
}

