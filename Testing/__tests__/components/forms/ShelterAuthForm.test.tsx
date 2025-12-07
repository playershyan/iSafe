/**
 * Tests for ShelterAuthForm component
 * Tests authentication flow, validation, and error handling
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ShelterAuthForm } from '@/components/forms/ShelterAuthForm'
import { mockFetchSuccess, mockFetchError, TEST_CREDENTIALS } from '../../utils/test-helpers'

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

describe('ShelterAuthForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetchSuccess({ success: true, shelter: { id: 'test-id', name: 'Test Shelter' } })
  })

  describe('Form Rendering', () => {
    it('renders shelter code and access code fields', () => {
      render(<ShelterAuthForm locale="en" />)
      
      expect(screen.getByLabelText(/shelterCode/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/accessCode/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('shows validation errors for empty form', async () => {
      const user = userEvent.setup()
      render(<ShelterAuthForm locale="en" />)
      
      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/required/i)).toBeInTheDocument()
      })
    })

    it('validates shelter code is not empty', async () => {
      const user = userEvent.setup()
      render(<ShelterAuthForm locale="en" />)
      
      const accessCodeInput = screen.getByLabelText(/accessCode/i)
      await user.type(accessCodeInput, TEST_CREDENTIALS.shelter.accessCode)
      
      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/required/i)).toBeInTheDocument()
      })
    })

    it('validates access code is not empty', async () => {
      const user = userEvent.setup()
      render(<ShelterAuthForm locale="en" />)
      
      const shelterCodeInput = screen.getByLabelText(/shelterCode/i)
      await user.type(shelterCodeInput, TEST_CREDENTIALS.shelter.code)
      
      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/required/i)).toBeInTheDocument()
      })
    })
  })

  describe('Authentication Flow', () => {
    it('successfully authenticates with valid credentials', async () => {
      const user = userEvent.setup()
      render(<ShelterAuthForm locale="en" />)
      
      const shelterCodeInput = screen.getByLabelText(/shelterCode/i)
      const accessCodeInput = screen.getByLabelText(/accessCode/i)
      const submitButton = screen.getByRole('button', { name: /submit/i })
      
      await user.type(shelterCodeInput, TEST_CREDENTIALS.shelter.code)
      await user.type(accessCodeInput, TEST_CREDENTIALS.shelter.accessCode)
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/auth/shelter',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
              shelterCode: TEST_CREDENTIALS.shelter.code,
              accessCode: TEST_CREDENTIALS.shelter.accessCode,
            }),
          })
        )
      })
    })

    it('handles authentication failure', async () => {
      mockFetchError(401, 'Invalid credentials')
      const user = userEvent.setup()
      render(<ShelterAuthForm locale="en" />)
      
      const shelterCodeInput = screen.getByLabelText(/shelterCode/i)
      const accessCodeInput = screen.getByLabelText(/accessCode/i)
      const submitButton = screen.getByRole('button', { name: /submit/i })
      
      await user.type(shelterCodeInput, 'INVALID-CODE')
      await user.type(accessCodeInput, 'INVALID-PASS')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument()
      })
    })

    it('shows loading state during submission', async () => {
      const user = userEvent.setup()
      render(<ShelterAuthForm locale="en" />)
      
      const shelterCodeInput = screen.getByLabelText(/shelterCode/i)
      const accessCodeInput = screen.getByLabelText(/accessCode/i)
      const submitButton = screen.getByRole('button', { name: /submit/i })
      
      await user.type(shelterCodeInput, TEST_CREDENTIALS.shelter.code)
      await user.type(accessCodeInput, TEST_CREDENTIALS.shelter.accessCode)
      await user.click(submitButton)
      
      expect(submitButton).toBeDisabled()
    })
  })
})

