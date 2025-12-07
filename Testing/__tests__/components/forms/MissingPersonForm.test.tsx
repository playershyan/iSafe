/**
 * Tests for MissingPersonForm component
 * Tests form validation, submission, and user interactions
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MissingPersonForm } from '@/components/forms/MissingPersonForm'
import { mockFetchSuccess, mockFetchError, createMockFile, waitForAsync } from '../../utils/test-helpers'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}))

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}))

// Mock phone verification
jest.mock('@/components/features/PhoneVerificationField', () => ({
  PhoneVerificationField: ({ onVerified }: any) => (
    <div>
      <input data-testid="phone-input" />
      <button data-testid="verify-phone" onClick={() => onVerified('0771234567')}>
        Verify
      </button>
    </div>
  ),
}))

// Mock image compression
jest.mock('@/lib/utils/imageCompression', () => ({
  compressImage: jest.fn((file) => Promise.resolve(file)),
  validateImageFile: jest.fn((file) => ({ valid: true })),
}))

// Mock low bandwidth context
jest.mock('@/lib/contexts/LowBandwidthContext', () => ({
  useLowBandwidth: () => ({ isLowBandwidth: false }),
}))

describe('MissingPersonForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetchSuccess({ success: true, posterCode: 'TEST123' })
  })

  describe('Form Access and Navigation', () => {
    it('renders form with all required fields', () => {
      render(<MissingPersonForm locale="en" />)
      
      expect(screen.getByLabelText(/fullName/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/age/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/gender/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/lastSeenLocation/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/reporterName/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/reporterPhone/i)).toBeInTheDocument()
    })
  })

  describe('Field Validation - Required Fields', () => {
    it('shows validation errors when submitting empty form', async () => {
      render(<MissingPersonForm locale="en" />)
      const submitButton = screen.getByRole('button', { name: /submit/i })
      
      await userEvent.click(submitButton)
      
      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/required/i)).toBeInTheDocument()
      })
    })

    it('validates fullName minimum length', async () => {
      render(<MissingPersonForm locale="en" />)
      const nameInput = screen.getByLabelText(/fullName/i)
      
      await userEvent.type(nameInput, 'A')
      await userEvent.tab()
      
      await waitFor(() => {
        expect(screen.getByText(/minimum/i)).toBeInTheDocument()
      })
    })

    it('validates age range (0-120)', async () => {
      render(<MissingPersonForm locale="en" />)
      const ageInput = screen.getByLabelText(/age/i)
      
      await userEvent.type(ageInput, '150')
      await userEvent.tab()
      
      await waitFor(() => {
        expect(screen.getByText(/maximum/i)).toBeInTheDocument()
      })
    })

    it('validates phone number format', async () => {
      render(<MissingPersonForm locale="en" />)
      const phoneInput = screen.getByLabelText(/reporterPhone/i)
      
      await userEvent.type(phoneInput, '123456789')
      await userEvent.tab()
      
      await waitFor(() => {
        expect(screen.getByText(/phone/i)).toBeInTheDocument()
      })
    })
  })

  describe('Photo Upload', () => {
    it('allows uploading valid image file', async () => {
      render(<MissingPersonForm locale="en" />)
      const fileInput = screen.getByLabelText(/photo/i)
      const file = createMockFile('test.jpg', 'image/jpeg', 1024 * 1024) // 1MB
      
      await userEvent.upload(fileInput, file)
      
      await waitFor(() => {
        expect(fileInput).toHaveValue(expect.any(String))
      })
    })

    it('rejects file larger than 5MB', async () => {
      render(<MissingPersonForm locale="en" />)
      const fileInput = screen.getByLabelText(/photo/i)
      const largeFile = createMockFile('large.jpg', 'image/jpeg', 6 * 1024 * 1024) // 6MB
      
      await userEvent.upload(fileInput, largeFile)
      
      await waitFor(() => {
        expect(screen.getByText(/size/i)).toBeInTheDocument()
      })
    })

    it('rejects invalid file types', async () => {
      render(<MissingPersonForm locale="en" />)
      const fileInput = screen.getByLabelText(/photo/i)
      const invalidFile = createMockFile('document.pdf', 'application/pdf')
      
      await userEvent.upload(fileInput, invalidFile)
      
      await waitFor(() => {
        expect(screen.getByText(/invalid.*file/i)).toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('submits form with valid data', async () => {
      const user = userEvent.setup()
      render(<MissingPersonForm locale="en" />)
      
      // Fill required fields
      await user.type(screen.getByLabelText(/fullName/i), 'John Doe')
      await user.type(screen.getByLabelText(/age/i), '30')
      await user.selectOptions(screen.getByLabelText(/gender/i), 'MALE')
      await user.type(screen.getByLabelText(/lastSeenLocation/i), 'Colombo')
      await user.type(screen.getByLabelText(/reporterName/i), 'Jane Reporter')
      await user.type(screen.getByLabelText(/reporterPhone/i), '0771234567')
      
      // Verify phone
      await user.click(screen.getByTestId('verify-phone'))
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/missing'),
          expect.objectContaining({
            method: 'POST',
          })
        )
      })
    })

    it('handles API errors gracefully', async () => {
      mockFetchError(500, 'Server error')
      const user = userEvent.setup()
      render(<MissingPersonForm locale="en" />)
      
      // Fill and submit form
      await user.type(screen.getByLabelText(/fullName/i), 'John Doe')
      await user.type(screen.getByLabelText(/age/i), '30')
      await user.selectOptions(screen.getByLabelText(/gender/i), 'MALE')
      await user.type(screen.getByLabelText(/lastSeenLocation/i), 'Colombo')
      await user.type(screen.getByLabelText(/reporterName/i), 'Jane Reporter')
      await user.type(screen.getByLabelText(/reporterPhone/i), '0771234567')
      await user.click(screen.getByTestId('verify-phone'))
      await user.click(screen.getByRole('button', { name: /submit/i }))
      
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument()
      })
    })
  })
})

