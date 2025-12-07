/**
 * E2E tests for Shelter Authentication flow
 * Tests login, authentication, and protected routes
 */

import { test, expect } from '@playwright/test'

const TEST_SHELTER_CODE = 'CMB-CC-001'
const TEST_ACCESS_CODE = 'TEST123'

test.describe('Shelter Authentication', () => {
  test('should redirect to auth page when accessing protected route', async ({ page }) => {
    await page.goto('/en/register')
    
    // Should redirect to auth page
    await expect(page).toHaveURL(/auth/, { timeout: 5000 })
  })

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/en/register/auth')
    
    const submitButton = page.getByRole('button', { name: /submit|login|continue/i })
    await submitButton.click()
    
    // Should show validation errors
    await expect(page.getByText(/required/i).first()).toBeVisible({ timeout: 2000 })
  })

  test('should authenticate with valid credentials', async ({ page }) => {
    await page.goto('/en/register/auth')
    
    // Fill in credentials
    const shelterCodeInput = page.getByLabel(/shelter.*code/i)
    const accessCodeInput = page.getByLabel(/access.*code/i)
    
    await shelterCodeInput.fill(TEST_SHELTER_CODE)
    await accessCodeInput.fill(TEST_ACCESS_CODE)
    
    // Submit form
    const submitButton = page.getByRole('button', { name: /submit|login|continue/i })
    
    // Intercept the API call
    const requestPromise = page.waitForRequest((request) =>
      request.url().includes('/api/auth/shelter') && request.method() === 'POST'
    )
    
    await submitButton.click()
    
    // Wait for API request
    const request = await requestPromise
    
    // Verify request payload
    const requestBody = request.postDataJSON()
    expect(requestBody).toMatchObject({
      shelterCode: TEST_SHELTER_CODE,
      accessCode: TEST_ACCESS_CODE,
    })
    
    // If successful, should redirect to registration page
    // Note: This will depend on your actual API response
    await expect(page).toHaveURL(/register/, { timeout: 5000 })
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/en/register/auth')
    
    // Fill in invalid credentials
    const shelterCodeInput = page.getByLabel(/shelter.*code/i)
    const accessCodeInput = page.getByLabel(/access.*code/i)
    
    await shelterCodeInput.fill('INVALID-CODE')
    await accessCodeInput.fill('INVALID-PASS')
    
    // Mock API error response
    await page.route('**/api/auth/shelter', (route) => {
      route.fulfill({
        status: 401,
        body: JSON.stringify({ error: 'Invalid credentials' }),
      })
    })
    
    const submitButton = page.getByRole('button', { name: /submit|login|continue/i })
    await submitButton.click()
    
    // Should show error message
    await expect(page.getByText(/error|invalid|credentials/i)).toBeVisible({ timeout: 3000 })
    
    // Should stay on auth page
    await expect(page).toHaveURL(/auth/)
  })

  test('should set authentication cookie on successful login', async ({ page, context }) => {
    await page.goto('/en/register/auth')
    
    // Mock successful authentication
    await page.route('**/api/auth/shelter', (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true, shelter: { id: 'test', name: 'Test' } }),
        headers: {
          'Set-Cookie': 'shelter_token=test-token; Path=/; HttpOnly',
        },
      })
    })
    
    const shelterCodeInput = page.getByLabel(/shelter.*code/i)
    const accessCodeInput = page.getByLabel(/access.*code/i)
    
    await shelterCodeInput.fill(TEST_SHELTER_CODE)
    await accessCodeInput.fill(TEST_ACCESS_CODE)
    
    const submitButton = page.getByRole('button', { name: /submit|login|continue/i })
    await submitButton.click()
    
    // Wait for navigation
    await page.waitForURL(/register/, { timeout: 5000 })
    
    // Verify cookie is set
    const cookies = await context.cookies()
    const shelterToken = cookies.find((c) => c.name === 'shelter_token')
    expect(shelterToken).toBeDefined()
  })
})

test.describe('Shelter Registration Flow', () => {
  test.beforeEach(async ({ page, context }) => {
    // Set authentication cookie
    await context.addCookies([
      {
        name: 'shelter_token',
        value: 'test-token',
        domain: 'localhost',
        path: '/',
      },
    ])
  })

  test('should show registration form after authentication', async ({ page }) => {
    await page.goto('/en/register')
    
    // Should show registration form, not auth form
    await expect(page.getByLabel(/full.*name/i)).toBeVisible({ timeout: 5000 })
    await expect(page.getByText(/auth/i)).not.toBeVisible()
  })

  test('should validate registration form fields', async ({ page }) => {
    await page.goto('/en/register')
    
    // Try to submit empty form
    const submitButton = page.getByRole('button', { name: /register|submit/i })
    await submitButton.click()
    
    // Should show validation errors
    await expect(page.getByText(/required/i).first()).toBeVisible({ timeout: 2000 })
  })

  test('should submit registration with valid data', async ({ page }) => {
    await page.goto('/en/register')
    
    // Fill form
    await page.getByLabel(/full.*name/i).fill('Test Person')
    await page.getByLabel(/age/i).fill('25')
    await page.selectOption('select[name*="gender"]', 'MALE')
    
    // Mock successful registration
    await page.route('**/api/register', (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          person: { id: 'test-id', fullName: 'Test Person' },
        }),
      })
    })
    
    const submitButton = page.getByRole('button', { name: /register.*finish/i })
    
    // Intercept API call
    const requestPromise = page.waitForRequest((request) =>
      request.url().includes('/api/register') && request.method() === 'POST'
    )
    
    await submitButton.click()
    
    // Verify API request was made
    const request = await requestPromise
    expect(request).toBeDefined()
  })
})

