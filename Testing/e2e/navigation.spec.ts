/**
 * E2E tests for Navigation and Links
 * Tests header, footer, and internal navigation
 */

import { test, expect } from '@playwright/test'

test.describe('Header Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en')
  })

  test('should navigate to home when clicking logo', async ({ page }) => {
    const logo = page.getByRole('link', { name: /isafe/i }).first()
    await logo.click()
    
    await expect(page).toHaveURL('/en')
  })

  test('should navigate to home when clicking home link', async ({ page }) => {
    const homeLink = page.getByRole('link', { name: /home/i })
    await homeLink.click()
    
    await expect(page).toHaveURL('/en')
  })

  test('should navigate to missing person report page', async ({ page }) => {
    const reportLink = page.getByRole('link', { name: /report.*missing/i })
    await reportLink.click()
    
    await expect(page).toHaveURL(/missing/)
  })

  test('should switch languages', async ({ page }) => {
    // Find language toggle (සිං | த | EN)
    const languageToggle = page.getByRole('button', { name: /සිං|த|en/i }).first()
    
    if (await languageToggle.isVisible()) {
      await languageToggle.click()
      
      // URL should change to reflect new locale
      await expect(page).toHaveURL(/\/si\/|\/ta\//)
    }
  })
})

test.describe('Footer Links', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en')
  })

  test('should navigate to about page', async ({ page }) => {
    const aboutLink = page.getByRole('link', { name: /about/i })
    await aboutLink.click()
    
    await expect(page).toHaveURL('/en/about')
  })

  test('should navigate to contact page', async ({ page }) => {
    const contactLink = page.getByRole('link', { name: /contact/i })
    await contactLink.click()
    
    await expect(page).toHaveURL('/en/contact')
  })

  test('should navigate to privacy page', async ({ page }) => {
    const privacyLink = page.getByRole('link', { name: /privacy/i })
    await privacyLink.click()
    
    await expect(page).toHaveURL('/en/privacy')
  })

  test('should navigate to terms page', async ({ page }) => {
    const termsLink = page.getByRole('link', { name: /terms/i })
    await termsLink.click()
    
    await expect(page).toHaveURL('/en/terms')
  })
})

test.describe('Home Page Navigation', () => {
  test('should navigate to search page from home', async ({ page }) => {
    await page.goto('/en')
    
    const searchButton = page.getByRole('link', { name: /search.*someone/i })
    await searchButton.click()
    
    await expect(page).toHaveURL(/search/)
  })

  test('should navigate to missing person report from home', async ({ page }) => {
    await page.goto('/en')
    
    const reportButton = page.getByRole('link', { name: /report.*missing/i })
    await reportButton.click()
    
    await expect(page).toHaveURL(/missing/)
  })
})

test.describe('Form Navigation', () => {
  test('should have back navigation in forms', async ({ page }) => {
    await page.goto('/en/missing/report')
    
    // Look for back button or link
    const backButton = page.getByRole('link', { name: /back/i })
    
    if (await backButton.isVisible()) {
      await backButton.click()
      // Should navigate back
      await expect(page).toHaveURL(/\/en\/?$/)
    }
  })
})

