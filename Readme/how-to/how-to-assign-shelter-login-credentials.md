# How to Assign Displacement Shelter Login Credentials Through the Dashboard

This guide explains how administrators can assign or change login credentials (Shelter Code and Access Code) for displacement shelters through the compensation dashboard.

## Who Can Do This?

Only compensation administrators with dashboard access can assign shelter credentials. You need to be logged into the compensation dashboard.

## Step-by-Step Instructions

### Step 1: Log In to the Compensation Dashboard

1. Go to the compensation admin login page (usually at `/compensation/admin`)
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

1. **Shelter Code:** The Center Code (e.g., `CMB-CC-001`)
2. **Access Code:** The password you set

**Security Best Practices:**
- Share credentials through secure channels (encrypted email, secure messaging)
- Don't share via public channels
- Ask staff to change the access code if possible (if you implement this feature)
- Keep a secure record of which center has which credentials

## Example: Creating a New Shelter

Let's say you want to create a new shelter called "Gampaha District Camp 1":

1. Click **"Add New Center"**
2. Fill in:
   - Center Name: `Gampaha District Camp 1`
   - Center Code: `GAM-DC-001`
   - District: `Gampaha`
   - Address: `123 Main Street, Gampaha`
   - Contact Person: `Mr. John Silva`
   - Contact Number: `0771234567`
   - Access Code: `SecurePass123!`

3. Click **"Create"**

Now shelter staff can log in using:
- **Shelter Code:** `GAM-DC-001`
- **Access Code:** `SecurePass123!`

## Viewing Access Code Status

In the centers table, you'll see the "Access Code" column showing:
- **✓ Set** (green) - An access code has been assigned
- **Not set** (red) - No access code assigned yet

If a center shows "Not set", you should edit it and add an access code so staff can log in.

## Important Information

### About Access Codes

- Access codes are stored securely (encrypted/hashed) in the database
- Once set, you cannot view the actual access code, only whether one is set
- When editing, entering a new access code will replace the old one
- Access codes must be at least 4 characters long

### About Shelter Codes (Center Codes)

- These are the codes shelter staff enter to log in
- They should be unique (the system will prevent duplicates)
- Format is typically: `DISTRICT-TYPE-NUMBER` (e.g., `CMB-CC-001`)
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
- Access Code = Password you set

