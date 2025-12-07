/**
 * Test utilities and helper functions
 */

import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'

/**
 * Custom render function that includes providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { ...options })
}

/**
 * Test data generators
 */
export const createMockPerson = (overrides = {}) => ({
  id: 'test-person-id',
  fullName: 'John Doe',
  age: 30,
  gender: 'MALE' as const,
  nic: '123456789V',
  photoUrl: null,
  contactNumber: '0771234567',
  specialNotes: null,
  shelterId: 'test-shelter-id',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
})

export const createMockShelter = (overrides = {}) => ({
  id: 'test-shelter-id',
  name: 'Test Shelter',
  code: 'TEST-001',
  district: 'Colombo',
  address: '123 Test Street',
  contactPerson: 'Jane Manager',
  contactNumber: '0771234567',
  isActive: true,
  ...overrides,
})

export const createMockMissingPersonReport = (overrides = {}) => ({
  id: 'test-report-id',
  fullName: 'Missing Person',
  age: 25,
  gender: 'FEMALE' as const,
  photoUrl: null,
  lastSeenLocation: 'Colombo',
  lastSeenDistrict: 'Colombo',
  lastSeenDate: new Date().toISOString(),
  clothing: 'Blue shirt, jeans',
  reporterName: 'Reporter Name',
  reporterPhone: '0771234567',
  altContact: null,
  status: 'MISSING' as const,
  posterCode: 'TEST123',
  createdAt: new Date().toISOString(),
  ...overrides,
})

/**
 * Mock fetch responses
 */
export const mockFetchSuccess = (data: any) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => data,
  })
}

export const mockFetchError = (status: number, message: string) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: false,
    status,
    json: async () => ({ error: message }),
  })
}

/**
 * Wait for async operations
 */
export const waitForAsync = () => new Promise((resolve) => setTimeout(resolve, 0))

/**
 * Mock file for uploads
 */
export const createMockFile = (name = 'test.jpg', type = 'image/jpeg', size = 1000) => {
  const file = new File(['test'], name, { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

/**
 * Test credentials
 */
export const TEST_CREDENTIALS = {
  shelter: {
    code: 'CMB-CC-001',
    accessCode: 'TEST123',
  },
  staff: {
    code: 'STAFF-001',
    accessCode: 'STAFF123',
  },
  compensationAdmin: {
    username: 'admin@test.com',
    password: 'admin123',
  },
}

/**
 * Mock localStorage
 */
export const mockLocalStorage = () => {
  const store: Record<string, string> = {}
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString()
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach((key) => delete store[key])
    }),
  }
}

/**
 * Mock cookies
 */
export const mockCookies = (cookies: Record<string, string> = {}) => ({
  get: jest.fn((name: string) => ({
    name,
    value: cookies[name] || null,
  })),
  set: jest.fn(),
  getAll: jest.fn(() =>
    Object.entries(cookies).map(([name, value]) => ({ name, value }))
  ),
})

