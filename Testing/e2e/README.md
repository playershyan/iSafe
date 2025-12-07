# E2E Testing Guide

This directory contains end-to-end tests using Playwright for the iSafe application.

## Prerequisites

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install
```

## Running Tests

### All Tests
```bash
npm run test:e2e
```

### With UI Mode (Interactive)
```bash
npm run test:e2e:ui
```

### Headed Mode (See Browser)
```bash
npm run test:e2e:headed
```

### Specific Test File
```bash
npx playwright test missing-person-form.spec.ts
```

### Debug Mode
```bash
npx playwright test --debug
```

## Test Files

- `missing-person-form.spec.ts` - Missing person form flow tests
- `shelter-authentication.spec.ts` - Shelter auth and registration tests
- `navigation.spec.ts` - Navigation and links tests
- `search.spec.ts` - Search functionality tests

## Configuration

Tests are configured in `playwright.config.ts`:
- Base URL: `http://localhost:3000` (or `PLAYWRIGHT_TEST_BASE_URL` env var)
- Tests run against Chromium, Firefox, WebKit
- Mobile viewports: Pixel 5, iPhone 12
- Dev server starts automatically before tests

## Test Environment Setup

Ensure you have:
- Development server running (`npm run dev`)
- Test database with sample data
- Test credentials:
  - Shelter Code: `CMB-CC-001`
  - Access Code: `TEST123`

## Writing E2E Tests

### Basic Test Structure
```typescript
import { test, expect } from '@playwright/test'

test('should do something', async ({ page }) => {
  await page.goto('/en')
  await expect(page).toHaveURL('/en')
})
```

### API Mocking
```typescript
await page.route('**/api/search*', (route) => {
  route.fulfill({
    status: 200,
    body: JSON.stringify({ success: true, results: [] }),
  })
})
```

### Authentication
```typescript
// Set authentication cookie
await context.addCookies([{
  name: 'shelter_token',
  value: 'test-token',
  domain: 'localhost',
  path: '/',
}])
```

## Test Coverage

E2E tests cover:
- Critical user flows (P0 priority)
- Form submissions
- Authentication flows
- Navigation
- Search functionality

## Debugging

1. Use `--debug` flag to step through tests
2. Use `--headed` to see browser
3. Use `page.pause()` in test code to pause execution
4. Check Playwright trace viewer for failed tests

