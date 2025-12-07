# How to Change ta.json with Tamil Fonts

This guide explains how to update the Tamil translation file (ta.json) and ensure Tamil text displays correctly with proper fonts.

## What is ta.json?

The `ta.json` file contains all the Tamil translations for the iSafe website. It's located in the `messages/` folder of your project.

## Step-by-Step Instructions

### Step 1: Locate the ta.json File

1. Open your project folder
2. Navigate to the `messages/` folder
3. Find the file named `ta.json`

**Full path example:** `messages/ta.json`

### Step 2: Open the File

You can open `ta.json` with:
- Any text editor (Notepad, TextEdit, VS Code, etc.)
- A code editor (recommended for better editing experience)

**Recommended editors:**
- Visual Studio Code (free)
- Sublime Text
- Atom

### Step 3: Understand the File Structure

The file is in JSON format and looks like this:

```json
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
```

- Each section (like `"common"`, `"home"`) groups related translations
- The left side (in quotes) is the key - don't change this
- The right side (in quotes after the colon) is the Tamil text - this is what you change

### Step 4: Edit Tamil Text

To change any Tamil text:

1. Find the text you want to change (on the right side of the colon)
2. Change only the Tamil text between the quotes
3. **Don't change** the key (left side) or the structure (brackets, commas, quotes)

**Example:**

**Before:**
```json
"search": "தேடல்"
```

**After:**
```json
"search": "தேடு"
```

**Important Rules:**
- ✅ Change only the Tamil text between the quotes
- ✅ Keep all quotes, commas, and brackets exactly as they are
- ✅ Don't delete any keys
- ✅ Make sure every opening bracket `{` has a closing bracket `}`
- ✅ Make sure every opening quote `"` has a closing quote `"`

### Step 5: Save the File

1. After making your changes, save the file
2. Make sure the file is saved as `ta.json` (not `ta.json.txt`)
3. Keep it in the `messages/` folder

### Step 6: Check for Errors

JSON files must be perfectly formatted. Common mistakes:

**❌ Missing comma:**
```json
"search": "தேடல்"
"cancel": "ரத்துசெய்"  // Missing comma after "தேடல்"
```

**✅ Correct:**
```json
"search": "தேடல்",
"cancel": "ரத்துசெய்"
```

**❌ Missing quote:**
```json
"search": "தேடல்  // Missing closing quote
```

**✅ Correct:**
```json
"search": "தேடல்"
```

**❌ Extra comma:**
```json
"search": "தேடல்",,  // Two commas
```

**✅ Correct:**
```json
"search": "தேடல்",
```

### Step 7: Validate JSON Format

Before saving, validate your JSON:

**Option 1: Online Validator**
1. Copy the entire contents of your `ta.json` file
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

### Typing Tamil Text

When adding Tamil text to `ta.json`:

**Option 1: Copy from Tamil Source**
- Copy Tamil text from a reliable source
- Paste it between the quotes in ta.json
- Make sure it pastes correctly (not as boxes or question marks)

**Option 2: Use Tamil Keyboard**
- Install a Tamil keyboard on your computer
- Type directly into the file

**Option 3: Use Online Translators**
- Use Google Translate or similar (but verify accuracy)
- Copy the Tamil translation
- Paste into ta.json

## Complete Example: Adding a New Translation

Let's say you want to add a new Tamil translation for "Welcome":

1. Find the appropriate section in `ta.json` (or decide where to add it)
2. Add the new line following the same pattern:

```json
{
  "home": {
    "title": "காணாமல் போனவர்களைத் தேடுங்கள்",
    "welcome": "வணக்கம்"  // New translation added
  }
}
```

3. Make sure there's a comma after the previous line
4. Save and test

## Common Sections in ta.json

The file typically contains these sections:

- `"common"` - Common words used throughout (Save, Cancel, etc.)
- `"home"` - Home page text
- `"search"` - Search page text
- `"missing"` - Missing person report form
- `"register"` - Registration form
- `"auth"` - Login/authentication text
- `"nav"` - Navigation menu items

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

**Problem:** Can't type Tamil characters
- **Solution:**
  - Install a Tamil keyboard input method on your computer
  - Or copy Tamil text from another source and paste it

**Problem:** File looks corrupted after editing
- **Solution:**
  - Use a proper text editor (VS Code, Sublime Text)
  - Don't use Microsoft Word or rich text editors
  - Always validate JSON before saving

## Quick Reference

**File Location:** `messages/ta.json`

**File Format:** JSON (JavaScript Object Notation)

**Encoding:** UTF-8

**What to change:** Only the Tamil text (right side of the colon)

**What NOT to change:** Keys (left side), structure, brackets, commas

**Validation:** Use jsonlint.com or VS Code to check for errors

**After editing:** Save file → Restart server → Test on website

## Tips

- ✅ Always keep a backup of the original file before making changes
- ✅ Test changes on a development site before deploying to production
- ✅ Use a code editor with JSON syntax highlighting
- ✅ Validate JSON before saving
- ✅ Make small changes and test frequently

