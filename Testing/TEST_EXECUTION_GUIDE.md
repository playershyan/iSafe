# Test Execution Guide for iSafe

This guide provides step-by-step instructions for executing the comprehensive test plan for iSafe.

## Prerequisites

Before running tests, ensure:

1. **Dependencies Installed**
   ```bash
   npm install
   npx playwright install
   ```

2. **Environment Setup**
   - Copy `.env.example` to `.env.local`
   - Configure test database credentials
   - Set up test Supabase project (or use mock)
   - Configure test phone numbers for OTP verification

3. **Test Data Seeded**
   - Run database migrations
   - Seed test shelters (codes: CMB-CC-001, etc.)
   - Seed test persons
   - Seed test missing person reports

4. **Development Server**
   ```bash
   npm run dev
   ```

## Test Structure

### Unit/Component Tests (`__tests__/`)
- Component rendering and interactions
- Form validation
- Utility functions
- API route handlers

### E2E Tests (`e2e/`)
- Full user flows
- Cross-browser testing
- Mobile viewport testing
- Integration testing

## Running Tests

### Quick Start

```bash
# Run all unit/component tests
npm run test

# Run all E2E tests
npm run test:e2e

# Run everything
npm run test:all
```

### Specific Test Suites

```bash
# Run only form tests
npm run test -- MissingPersonForm

# Run only E2E navigation tests
npm run test:e2e -- navigation.spec.ts

# Run with coverage
npm run test:coverage
```

## Test Execution Checklist

Follow the plan in `tree-shaking-optimization.plan.md` (the comprehensive testing plan). Here's a quick reference:

### Phase 1: Missing Person Form (P0)
- [ ] Run `npm run test -- MissingPersonForm`
- [ ] Run `npm run test:e2e -- missing-person-form.spec.ts`
- [ ] Manually test in browser: `/en/missing/report`

### Phase 2: Shelter Authentication (P0)
- [ ] Run `npm run test -- ShelterAuthForm`
- [ ] Run `npm run test:e2e -- shelter-authentication.spec.ts`
- [ ] Manually test login flow

### Phase 3: Navigation (P0)
- [ ] Run `npm run test:e2e -- navigation.spec.ts`
- [ ] Manually verify all header/footer links

### Phase 4: Search (P1)
- [ ] Run `npm run test:e2e -- search.spec.ts`
- [ ] Manually test search with various inputs

## Manual Testing Workflow

For comprehensive manual testing as per the plan:

1. **Start with P0 (Critical) Tests**
   - Missing person form submission
   - Shelter authentication
   - Person CRUD operations
   - Navigation links

2. **Then P1 (High Priority)**
   - Compensation form flow
   - Dashboard functionality
   - Edit/delete operations

3. **Finally P2/P3**
   - Edge cases
   - Performance testing
   - Browser compatibility

## Test Environment Configuration

### Test Credentials
```env
# Test Shelter
SHELTER_CODE=CMB-CC-001
ACCESS_CODE=TEST123

# Test Staff
STAFF_CODE=STAFF-001
STAFF_ACCESS_CODE=STAFF123

# Test Phone (for OTP)
TEST_PHONE=0771234567
```

### Mock Services
For testing without external services:

```typescript
// Mock Cloudinary uploads
jest.mock('@/lib/cloudinary', () => ({
  CloudinaryService: {
    uploadImage: jest.fn(() => Promise.resolve({ success: true, url: 'test-url' })),
  },
}))

// Mock OTP service
jest.mock('@/lib/services/textlkService', () => ({
  sendOTP: jest.fn(() => Promise.resolve({ success: true })),
}))
```

## Debugging Failed Tests

### Unit Tests
```bash
# Run with verbose output
npm run test -- --verbose

# Run specific test
npm run test -- Button.test.tsx

# Debug mode
node --inspect-brk node_modules/.bin/jest --runInBand
```

### E2E Tests
```bash
# Run with UI mode (recommended)
npm run test:e2e:ui

# Run in headed mode
npm run test:e2e:headed

# Debug specific test
npx playwright test missing-person-form.spec.ts --debug
```

### Common Issues

1. **Tests timeout**
   - Increase timeout in test files
   - Check if dev server is running
   - Verify API endpoints are accessible

2. **Mock not working**
   - Check jest.mock() placement
   - Verify module paths are correct
   - Clear jest cache: `npm run test -- --clearCache`

3. **E2E tests fail**
   - Check browser installation: `npx playwright install`
   - Verify base URL is correct
   - Check if dev server is accessible

## Coverage Goals

Target coverage:
- Unit tests: >80% code coverage
- Component tests: All UI components
- E2E tests: All P0 and P1 user flows

Check coverage:
```bash
npm run test:coverage
```

## Continuous Integration

For CI/CD pipeline:

```yaml
# Example GitHub Actions
- name: Run tests
  run: |
    npm run test:coverage
    npm run test:e2e
```

## Test Maintenance

- Update tests when features change
- Add tests for new features
- Remove obsolete tests
- Keep test data fresh
- Review and update test credentials regularly

## Next Steps

After completing automated tests:

1. Execute manual test checklist from the plan
2. Test on real devices
3. Test on slow networks (3G throttle)
4. Test in all three languages (en, si, ta)
5. Test accessibility (keyboard nav, screen readers)
6. Performance testing (Lighthouse, bundle size)

For detailed test scenarios, refer to the comprehensive testing plan document.

