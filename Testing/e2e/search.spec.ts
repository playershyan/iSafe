/**
 * E2E tests for Search Functionality
 * Tests search form, results display, and search API
 */

import { test, expect } from '@playwright/test'

test.describe('Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/search/results')
  })

  test('should display search form', async ({ page }) => {
    // Verify search form elements
    await expect(page.getByLabel(/name|nic/i)).toBeVisible({ timeout: 5000 })
    await expect(page.getByRole('button', { name: /search/i })).toBeVisible()
  })

  test('should perform search by name', async ({ page }) => {
    // Mock search API response
    await page.route('**/api/search*', (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          results: [
            {
              id: 'test-id',
              fullName: 'John Doe',
              age: 30,
              gender: 'MALE',
              shelter: { name: 'Test Shelter', district: 'Colombo' },
            },
          ],
        }),
      })
    })

    // Fill search form
    const searchInput = page.getByLabel(/name|nic/i).first()
    await searchInput.fill('John Doe')
    
    const searchButton = page.getByRole('button', { name: /search/i })
    await searchButton.click()

    // Wait for results
    await expect(page.getByText('John Doe')).toBeVisible({ timeout: 5000 })
  })

  test('should show empty state when no results found', async ({ page }) => {
    // Mock empty search results
    await page.route('**/api/search*', (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          results: [],
        }),
      })
    })

    const searchInput = page.getByLabel(/name|nic/i).first()
    await searchInput.fill('NonExistent Person')
    
    const searchButton = page.getByRole('button', { name: /search/i })
    await searchButton.click()

    // Should show empty state message
    await expect(
      page.getByText(/no.*results|not.*found|no.*people/i)
    ).toBeVisible({ timeout: 5000 })
  })

  test('should display search results correctly', async ({ page }) => {
    // Mock search results
    await page.route('**/api/search*', (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          results: [
            {
              id: 'test-id-1',
              fullName: 'John Doe',
              age: 30,
              gender: 'MALE',
              photoUrl: null,
              shelter: { name: 'Test Shelter', district: 'Colombo', contactNumber: '0771234567' },
            },
          ],
        }),
      })
    })

    const searchInput = page.getByLabel(/name|nic/i).first()
    await searchInput.fill('John')
    await page.getByRole('button', { name: /search/i }).click()

    // Verify result card displays
    await expect(page.getByText('John Doe')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('30')).toBeVisible()
    await expect(page.getByText(/male/i)).toBeVisible()
    await expect(page.getByText('Test Shelter')).toBeVisible()
  })

  test('should handle search API errors', async ({ page }) => {
    // Mock API error
    await page.route('**/api/search*', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Server error' }),
      })
    })

    const searchInput = page.getByLabel(/name|nic/i).first()
    await searchInput.fill('Test')
    await page.getByRole('button', { name: /search/i }).click()

    // Should show error message
    await expect(page.getByText(/error/i)).toBeVisible({ timeout: 5000 })
  })
})

