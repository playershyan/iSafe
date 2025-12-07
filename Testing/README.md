# Testing Directory

This directory contains all testing-related files for the iSafe application.

## Structure

```
Testing/
├── __tests__/              # Unit and component tests
│   ├── components/        # Component tests
│   ├── api/              # API route tests
│   └── utils/            # Test utilities
├── e2e/                   # End-to-end tests (Playwright)
├── jest.config.js         # Jest configuration
├── jest.setup.js          # Jest setup file
├── playwright.config.ts   # Playwright configuration
├── README.md              # This file
├── TEST_EXECUTION_GUIDE.md
├── TESTING_SETUP_SUMMARY.md
└── TEST_QUICK_REFERENCE.md
```

## Quick Start

```bash
# Run all tests from project root
npm run test:all

# Unit tests only
npm run test

# E2E tests only
npm run test:e2e
```

## Documentation

- **TEST_QUICK_REFERENCE.md** - Quick command reference
- **TEST_EXECUTION_GUIDE.md** - Detailed test execution guide
- **TESTING_SETUP_SUMMARY.md** - Setup summary and overview
- **__tests__/README.md** - Unit test documentation
- **e2e/README.md** - E2E test documentation

## Running Tests

All test commands should be run from the project root directory:

```bash
# From project root (D:\projects\iSafe)
npm run test        # Unit/component tests
npm run test:e2e    # E2E tests
npm run test:all    # All tests
```

The configuration files are set up to work from this Testing subdirectory while referencing the main application code in the parent directory.

