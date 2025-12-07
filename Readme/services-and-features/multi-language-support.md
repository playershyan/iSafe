# Multi-Language Support

## Overview

iSafe provides comprehensive multi-language support across the entire platform, ensuring accessibility for all users in Sri Lanka. The system supports English, Sinhala, and Tamil languages throughout all features and services.

## Supported Languages

### English (EN)
- Primary interface language
- International standard
- Default fallback language

### Sinhala (සිංහල) (SI)
- Native language support
- Full Unicode support
- Proper font rendering

### Tamil (தமிழ்) (TA)
- Native language support
- Full Unicode support
- Proper font rendering

## Access

- **Where Available:** Entire platform
- **Language Switcher:** Available on all pages
- **Default Language:** English
- **User Preference:** Saved in browser/localStorage

## How It Works

### Language Selection
1. **Language Toggle:** Click language selector in header
2. **Choose Language:** Select English, Sinhala, or Tamil
3. **Instant Switch:** Page reloads in selected language
4. **Preference Saved:** Choice remembered for future visits

### Automatic Detection
- Browser language detection (optional)
- URL-based language routing (e.g., /en/, /si/, /ta/)
- User preference storage
- Fallback to English if language unavailable

## Language Coverage

### Fully Translated Features
- ✅ Home page and navigation
- ✅ Missing person report forms
- ✅ Search interface and results
- ✅ Camp registration forms
- ✅ Disaster relief applications
- ✅ Help and documentation
- ✅ SMS notifications
- ✅ Error messages and alerts
- ✅ Dashboard interfaces
- ✅ Admin panels

### Translated Content Types
- **Interface Elements:** Buttons, labels, menus
- **Form Fields:** All input labels and placeholders
- **Messages:** Success, error, and info messages
- **Help Text:** Instructions and guidance
- **Notifications:** SMS and email messages
- **Documentation:** All help guides

## Key Features

### Consistent Experience
- Complete translation across all pages
- No mixed-language interfaces
- Proper formatting for all languages
- Culturally appropriate content

### Font Support
- System fonts for optimal rendering
- Unicode support for Sinhala and Tamil
- Fallback fonts if primary unavailable
- Proper character display

### SMS Language Support
- SMS sent in user's preferred language
- Unicode support for native scripts
- Proper encoding for Sinhala/Tamil
- Clear formatting and readability

### Form Translations
- All form labels translated
- Placeholder text in selected language
- Validation messages translated
- Help text in appropriate language

## Implementation

### URL Structure
- English: `/en/` or `/`
- Sinhala: `/si/`
- Tamil: `/ta/`

### Translation Files
- Located in `messages/` folder
- `en.json` - English translations
- `si.json` - Sinhala translations
- `ta.json` - Tamil translations

### Language Switching
- Click language toggle in header
- Select desired language
- Page reloads with new language
- Preference saved automatically

## Benefits

### Accessibility
- **Wider Reach:** Accessible to all language groups
- **Better Understanding:** Native language reduces errors
- **Inclusive:** Ensures no one is excluded
- **Cultural Appropriateness:** Respects language preferences

### User Experience
- **Familiar Interface:** Users see their language
- **Reduced Errors:** Better understanding = fewer mistakes
- **Increased Trust:** Native language builds confidence
- **Ease of Use:** No language barriers

### Communication
- **Clear SMS:** Notifications in preferred language
- **Better Comprehension:** Users understand messages
- **Effective Outreach:** Reach more communities
- **Improved Response:** Better engagement rates

## Technical Details

### Font Rendering
- **Sinhala:** System fonts with Unicode support
- **Tamil:** System fonts with Unicode support
- **English:** Standard web fonts
- **Fallbacks:** Multiple font stacks for reliability

### Character Encoding
- UTF-8 encoding throughout
- Proper Unicode support
- Correct character display
- No encoding issues

### Translation Management
- JSON-based translation files
- Easy to update and maintain
- Version controlled
- Consistent structure

## Language-Specific Features

### Right-to-Left Support
- Currently not required (all languages are LTR)
- Can be added if needed
- Framework supports RTL if required

### Date/Number Formatting
- Respects language conventions
- Appropriate date formats
- Number formatting per language
- Currency if applicable

### Text Direction
- All supported languages are left-to-right
- No special handling required
- Standard text flow

## Content Management

### Adding Translations
- Edit JSON files in `messages/` folder
- Maintain consistent structure
- Use proper encoding (UTF-8)
- Test translations thoroughly

### Translation Guidelines
- Use clear, simple language
- Avoid jargon and technical terms
- Maintain consistency across pages
- Cultural appropriateness

### Quality Assurance
- Native speaker review recommended
- Test all interface elements
- Verify SMS formatting
- Check special characters

## User Preferences

### Saving Preferences
- Stored in browser localStorage
- Persists across sessions
- Can be changed anytime
- Respects user choice

### Default Language
- English if no preference set
- Can detect from browser settings
- URL-based override available
- Admin can set defaults

## SMS Language Selection

### Automatic Detection
- Based on missing person report language
- Uses reporter's preferred language
- Falls back to English if unclear
- Respects user settings

### Message Formatting
- Proper Unicode encoding
- Clear formatting in all languages
- Appropriate length for SMS
- Readable character sets

## Benefits for Each Language Group

### English Speakers
- International standard
- Technical accuracy
- Wide accessibility

### Sinhala Speakers
- Native language comfort
- Better comprehension
- Cultural connection

### Tamil Speakers
- Native language comfort
- Better comprehension
- Cultural connection

## Related Features

- **All Platform Features:** Available in all languages
- **SMS Notifications:** Language-appropriate messages
- **Help Documentation:** Translated guides
- **Forms:** All translated

## Support

For language-related issues:
- Check language preference settings
- Verify translations are correct
- Report translation errors
- Request new translations if needed

## Future Enhancements

- Additional language support if needed
- Improved automatic detection
- Enhanced font rendering
- Better translation management tools

