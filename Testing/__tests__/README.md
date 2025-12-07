# Testing Guide for iSafe

This directory contains unit and component tests for the iSafe application.

## Test Structure

```
__tests__/
├── components/          # Component tests
│   ├── ui/             # UI component tests
│   └── forms/          # Form component tests
├── utils/              # Test utilities and helpers
│   ├── test-helpers.ts # Helper functions
│   └── test-constants.ts # Test constants
└── README.md           # This file
```

## Running Tests

### Unit/Component Tests (Jest)
```bash
# Run all tests
npm run test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### E2E Tests (Playwright)
```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed
```

### Run All Tests
```bash
npm run test:all
```

## Test Coverage

Tests are organized by priority:

### P0 (Critical - Must Pass)
- Missing person form validation and submission
- Shelter authentication
- Person CRUD operations
- Phone verification
- Navigation links

### P1 (High Priority)
- Compensation form flow
- Dashboard functionality
- Search functionality
- Edit/delete operations
- Image uploads

## Writing Tests

### Component Tests Example
```typescript
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/Button'

test('renders button correctly', () => {
  render(<Button>Click me</Button>)
  expect(screen.getByRole('button')).toBeInTheDocument()
})
```

### Using Test Helpers
```typescript
import { createMockPerson, mockFetchSuccess } from '../utils/test-helpers'

test('displays person data', () => {
  const person = createMockPerson({ fullName: 'John Doe' })
  mockFetchSuccess({ success: true, person })
  // ... test code
})
```

## Test Utilities

See `__tests__/utils/test-helpers.ts` for available utilities:
- `createMockPerson()` - Generate mock person data
- `createMockShelter()` - Generate mock shelter data
- `mockFetchSuccess()` - Mock successful API responses
- `mockFetchError()` - Mock API errors
- `createMockFile()` - Create mock file objects for uploads

## Notes

- Tests use mocked Next.js router and navigation
- next-intl is mocked to return translation keys
- API calls are mocked by default
- Environment variables are set in `jest.setup.js`

