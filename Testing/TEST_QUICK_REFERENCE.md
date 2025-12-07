# Test Quick Reference

## Quick Commands

```bash
# Run all tests
npm run test:all

# Unit tests only
npm run test

# E2E tests only
npm run test:e2e

# Watch mode (unit tests)
npm run test:watch

# Coverage report
npm run test:coverage

# E2E with UI (recommended for debugging)
npm run test:e2e:ui
```

## Test Files Location

- **Unit/Component Tests**: `__tests__/`
- **E2E Tests**: `e2e/`
- **Test Utilities**: `__tests__/utils/`

## Priority Test Scenarios

### P0 (Critical) - Implemented ✅
- Missing person form
- Shelter authentication
- Navigation
- Basic component tests

### P1 (High) - In Progress
- Compensation form
- CRUD operations
- Dashboard
- Search

## Running Specific Tests

```bash
# Run specific test file
npm run test -- Button.test.tsx

# Run E2E test
npm run test:e2e -- missing-person-form.spec.ts

# Run tests matching pattern
npm run test -- MissingPerson
```

## Debugging

```bash
# Debug E2E test
npx playwright test --debug

# Debug unit test
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Test Data

Test credentials (configure in `.env.local`):
- Shelter: `CMB-CC-001` / `TEST123`
- Staff: `STAFF-001` / `STAFF123`
- Phone: `0771234567`

## Documentation

- Full guide: `TEST_EXECUTION_GUIDE.md`
- Setup summary: `TESTING_SETUP_SUMMARY.md`
- Unit tests: `__tests__/README.md`
- E2E tests: `e2e/README.md`

