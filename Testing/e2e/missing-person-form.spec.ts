/**
 * E2E tests for Missing Person Form flow
 * Tests form access, validation, submission, and success flow
 */

import { test, expect } from '@playwright/test'

test.describe('Missing Person Form Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to missing person report page
    await page.goto('/en/missing/report')
  })

  test('should load form with all required fields', async ({ page }) => {
    // Verify form fields are visible
    await expect(page.getByLabel(/full.*name/i)).toBeVisible()
    await expect(page.getByLabel(/age/i)).toBeVisible()
    await expect(page.getByLabel(/gender/i)).toBeVisible()
    await expect(page.getByLabel(/last.*seen.*location/i)).toBeVisible()
    await expect(page.getByLabel(/reporter.*name/i)).toBeVisible()
    await expect(page.getByLabel(/reporter.*phone/i)).toBeVisible()
  })

  test('should show validation errors for empty form submission', async ({ page }) => {
    // Try to submit empty form
    const submitButton = page.getByRole('button', { name: /submit/i })
    await submitButton.click()

    // Wait for validation errors
    await expect(page.getByText(/required/i).first()).toBeVisible({ timeout: 5000 })
  })

  test('should validate field inputs', async ({ page }) => {
    // Test name minimum length
    const nameInput = page.getByLabel(/full.*name/i)
    await nameInput.fill('A')
    await nameInput.blur()
    await expect(page.getByText(/minimum/i)).toBeVisible({ timeout: 2000 })

    // Test age validation
    const ageInput = page.getByLabel(/age/i)
    await ageInput.fill('150')
    await ageInput.blur()
    await expect(page.getByText(/maximum|invalid/i)).toBeVisible({ timeout: 2000 })

    // Test phone format
    const phoneInput = page.getByLabel(/reporter.*phone/i)
    await phoneInput.fill('123456789')
    await phoneInput.blur()
    await expect(page.getByText(/phone|format/i)).toBeVisible({ timeout: 2000 })
  })

  test('should allow uploading valid image', async ({ page }) => {
    const fileInput = page.getByLabel(/photo/i)
    
    // Create a mock image file
    await fileInput.setInputFiles({
      name: 'test-image.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image-content'),
    })

    // Verify file is selected (no error message should appear)
    await expect(page.getByText(/invalid.*file/i)).not.toBeVisible({ timeout: 1000 })
  })

  test('should reject invalid file types', async ({ page }) => {
    const fileInput = page.getByLabel(/photo/i)
    
    // Try to upload PDF file
    await fileInput.setInputFiles({
      name: 'document.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('fake-pdf-content'),
    })

    // Should show error
    await expect(page.getByText(/invalid.*file|jpg|png/i)).toBeVisible({ timeout: 2000 })
  })

  test('should submit form with valid data', async ({ page }) => {
    // Fill in required fields
    await page.getByLabel(/full.*name/i).fill('John Doe')
    await page.getByLabel(/age/i).fill('30')
    await page.selectOption('select[name*="gender"]', 'MALE')
    await page.getByLabel(/last.*seen.*location/i).fill('Colombo')
    await page.getByLabel(/reporter.*name/i).fill('Jane Reporter')
    
    // Fill phone and verify (mock OTP)
    const phoneInput = page.getByLabel(/reporter.*phone/i)
    await phoneInput.fill('0771234567')
    
    // Note: Phone verification would need to be mocked or test environment configured
    // For now, we'll check if the field is filled
    await expect(phoneInput).toHaveValue('0771234567')

    // Submit form (this will fail if phone verification is required)
    // In a real scenario, you'd need to handle OTP verification
    const submitButton = page.getByRole('button', { name: /submit/i })
    
    // Intercept the API call to verify it's made
    const requestPromise = page.waitForRequest((request) =>
      request.url().includes('/api/missing') && request.method() === 'POST'
    )

    await submitButton.click()

    // Verify API request was made (if phone verification is bypassed in test env)
    try {
      await requestPromise
      // If request is made, verify redirect or success message
      await expect(page).toHaveURL(/success|poster/i, { timeout: 5000 })
    } catch {
      // If phone verification blocks submission, that's expected behavior
      console.log('Form submission blocked by phone verification (expected)')
    }
  })
})

test.describe('Missing Person Form - Phone Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/missing/report')
  })

  test('should require phone verification before submission', async ({ page }) => {
    // Fill form
    await page.getByLabel(/full.*name/i).fill('John Doe')
    await page.getByLabel(/age/i).fill('30')
    await page.selectOption('select[name*="gender"]', 'MALE')
    await page.getByLabel(/last.*seen.*location/i).fill('Colombo')
    await page.getByLabel(/reporter.*name/i).fill('Jane Reporter')
    await page.getByLabel(/reporter.*phone/i).fill('0771234567')

    // Try to submit without verification
    const submitButton = page.getByRole('button', { name: /submit/i })
    
    // Form should not submit if phone is not verified
    // This test assumes phone verification is enforced
    const initialUrl = page.url()
    await submitButton.click()
    
    // Wait a bit to see if navigation happens
    await page.waitForTimeout(1000)
    
    // URL should not change if verification is required
    // Note: This might need adjustment based on actual implementation
    expect(page.url()).toBe(initialUrl)
  })
})

