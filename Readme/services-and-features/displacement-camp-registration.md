# Displacement Camp Registration

## Overview

The Displacement Camp Registration system is a secure database designed exclusively for government staff to register individuals who have been admitted to displacement camps. This system helps track and manage people in camps while automatically matching them with missing person reports.

## Access

- **Who can use it:** Government staff only
- **Login required:** Yes (Shelter Code + Access Code)
- **Access Level:** Restricted to authorized personnel
- **Languages:** English, Sinhala, Tamil

## Authentication

Staff members need:
- **Shelter Code:** Unique code for their displacement camp (e.g., CMB-CC-001)
- **Access Code:** Secure password provided by administrators

These credentials are assigned through the compensation dashboard by system administrators.

## How It Works

1. **Login**
   - Access the registration page
   - Enter Shelter Code
   - Enter Access Code
   - Click Login

2. **Register New Arrival**
   - Fill in person's details (name, age, gender, NIC)
   - Upload optional photo
   - Add contact information if available
   - Enter special notes or important information
   - Submit registration

3. **Automatic Matching**
   - System automatically checks against missing person database
   - If match found, reporter receives SMS notification
   - Staff can review and confirm matches

## Key Features

### Secure Access
- Login with shelter-specific credentials
- Session-based authentication
- Secure cookie management
- Auto-logout for security

### Registration Form
- Photo upload (optional)
- Personal information collection
- NIC number verification
- Contact information
- Special notes field

### Automatic Matching
- Real-time matching against missing person database
- Multiple matching criteria (name, age, gender, NIC)
- Match probability scoring
- Notification to original reporter

### Match Review
- View potential matches
- Confirm or reject matches
- Link missing person reports with registrations
- Update missing person status

## Benefits

- **Secure Database:** Only authorized staff can access
- **Organized Records:** Centralized database of camp residents
- **Automatic Matching:** Reduces manual searching
- **Instant Notifications:** Families notified immediately when matches found
- **Multi-Language:** Available in all three languages
- **Audit Trail:** Complete record of all registrations

## Registration Fields

### Required Information
- Full name
- Age
- Gender
- Shelter ID (automatically assigned)

### Optional Information
- NIC number
- Photo
- Contact number
- Special notes (medical conditions, etc.)

## Match Notification System

When a registered person matches a missing person report:
1. System identifies match automatically
2. SMS sent to original reporter
3. Reporter can contact the camp
4. Match can be confirmed by staff
5. Missing person report status updated

## Data Security

- **Encrypted Storage:** All data stored securely
- **Access Control:** Only authorized staff can access
- **Audit Logs:** All actions are logged
- **Secure Transmission:** Data encrypted in transit
- **Regular Backups:** Data backed up regularly

## Staff Responsibilities

- **Accurate Entry:** Enter information correctly
- **Regular Updates:** Update records as needed
- **Match Review:** Review and confirm matches promptly
- **Privacy:** Protect personal information
- **Security:** Keep credentials secure

## Access Management

### Getting Credentials
- Contact system administrator
- Receive Shelter Code and Access Code
- Credentials assigned through dashboard

### Changing Credentials
- Contact administrator to change Access Code
- Shelter Code typically remains the same
- Update credentials if compromised

## Reporting Features

### Daily Statistics
- View registrations for the day
- Track total registrations
- Monitor match statistics

### Export Capabilities
- Download registration data (if authorized)
- Generate reports
- Share data with authorized parties

## Technical Requirements

- Modern web browser
- Internet connection
- Valid shelter credentials
- JavaScript enabled

## Related Features

- **Missing Person Reports:** System matches against these
- **SMS Notifications:** Automatic alerts to reporters
- **Staff Centers Management:** Admin manages camp access

## Support

For assistance:
- Contact your system administrator
- Refer to registration guide in Help section
- Check [How-To Guides](../how-to/README.md)

