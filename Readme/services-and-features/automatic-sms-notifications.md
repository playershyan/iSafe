# Automatic SMS Notifications

## Overview

The Automatic SMS Notification system provides instant alerts to reporters when their missing person is found and registered at a displacement camp. This automated feature ensures families and friends are immediately informed without manual intervention.

## Access

- **Who receives notifications:** Original reporters of missing persons
- **Trigger:** Automatic (when match is found)
- **Cost:** Free for recipients
- **Languages:** English, Sinhala, Tamil

## How It Works

1. **Missing Person Report Created**
   - Reporter submits missing person report
   - Phone number verified via SMS OTP
   - Report stored in database

2. **Person Registered at Camp**
   - Government staff registers person at displacement camp
   - System automatically searches for matches
   - Matching algorithm compares: name, age, gender, NIC

3. **Match Found**
   - System identifies potential match
   - SMS notification automatically sent
   - Reporter receives instant alert
   - Includes camp contact information

4. **Follow-Up**
   - Reporter can contact camp
   - Staff can confirm match
   - Missing person report status updated

## Key Features

### Instant Notification
- SMS sent immediately when match found
- No manual intervention required
- Works 24/7 automatically
- Real-time matching and alerting

### Multi-Language Support
- SMS in reporter's preferred language
- English, Sinhala, and Tamil versions
- Language detected from report or user preference
- Clear and understandable messages

### Match Information
- Missing person's name
- Camp name and code
- Camp contact information
- Next steps for reporter

### Privacy Protection
- Only original reporter receives notification
- Personal information protected
- Secure SMS delivery
- No spam or unauthorized messages

## Notification Content

### SMS Includes:
- Confirmation that missing person may be found
- Missing person's name
- Camp name and location
- Camp code for reference
- Contact instructions
- Language-appropriate formatting

### Example SMS (English):
```
iSafe Alert: A person matching your missing person report may have been found. Name: [Name]. Registered at: [Camp Name] ([Camp Code]). Please contact the camp for verification. - iSafe Team
```

## Matching Criteria

The system matches based on:
- **Name similarity:** Fuzzy matching for name variations
- **Age:** Within reasonable range
- **Gender:** Must match exactly
- **NIC:** If available, exact match preferred
- **Location:** Last seen area considered

## Benefits

- **Instant Alerts:** No delay in notification
- **Automatic:** No manual work required
- **Accurate:** Smart matching algorithm
- **Multi-Language:** Understandable in all languages
- **Privacy:** Only relevant parties notified
- **Free:** No cost to recipients

## Privacy and Security

- **Phone Numbers:** Verified and securely stored
- **Data Protection:** Personal information encrypted
- **Access Control:** Only system can send notifications
- **Opt-Out:** Can be disabled if requested
- **Compliance:** Follows data protection regulations

## Notification Timing

- **Immediate:** Sent as soon as match is found
- **24/7:** Works around the clock
- **Reliable:** High delivery success rate
- **Retry Logic:** Resends if delivery fails

## Language Selection

SMS language determined by:
1. Language preference in missing person report
2. System language setting
3. Default to English if preference unclear
4. Language-appropriate formatting and fonts

## What Reporters Should Do

1. **Verify Phone Number:** Ensure correct number in report
2. **Respond Promptly:** Contact camp when notified
3. **Keep Phone Available:** Check messages regularly
4. **Follow Up:** Contact camp to verify match
5. **Update Status:** Inform authorities if match confirmed

## Limitations

- Requires valid phone number
- SMS delivery depends on network
- Language selection must be accurate
- Some regions may have delivery delays
- Notifications only for active reports

## Technical Details

### SMS Provider
- Integrated SMS gateway service
- Reliable delivery system
- Multi-language character support
- Unicode support for Sinhala and Tamil

### Delivery Status
- Delivery confirmation tracking
- Failed delivery retry mechanism
- Error logging and monitoring
- Performance metrics

## Troubleshooting

**Didn't receive SMS:**
- Check phone number is correct
- Verify phone has signal
- Check spam/junk folder
- Contact support if issue persists

**SMS in wrong language:**
- Update language preference in report
- Contact support to change language
- Check system language settings

**Received duplicate SMS:**
- May happen if multiple matches found
- Check all messages for details
- Contact support if excessive duplicates

## Related Features

- **Missing Person Reports:** Source of reporter information
- **Camp Registration:** Triggers matching process
- **Multi-Language Support:** Ensures appropriate language
- **Match Review:** Staff confirms matches

## Support

For issues with SMS notifications:
- Contact iSafe support team
- Verify phone number with system
- Check notification preferences
- Report delivery problems

