'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { usePhoneVerification } from '@/lib/hooks/usePhoneVerification'
import EditPhoneModal from './EditPhoneModal'

interface PhoneVerificationFieldProps {
  phone: string
  onPhoneChange: (phone: string) => void
  onVerified: (phone: string) => void
  error?: string
  required?: boolean
  label?: string
  placeholder?: string
  anonymous?: boolean // If true, use anonymous verification
  anonymousUserId?: string // Anonymous user ID
  purpose?: 'profile' | 'listing' | 'wanted' | 'missing_report' // Purpose for verification
}

type VerificationStatus = 'unverified' | 'verifying' | 'verified' | 'error'

export function PhoneVerificationField({
  phone,
  onPhoneChange,
  onVerified,
  error,
  required = true,
  label = 'Phone Number',
  placeholder = 'e.g., 0771234567',
  anonymous = false,
  anonymousUserId,
  purpose = 'profile'
}: PhoneVerificationFieldProps) {
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('unverified')
  const [verifiedPhone, setVerifiedPhone] = useState<string>('')
  const [showModal, setShowModal] = useState(false)
  const { sendOTP, verifyOTP, isSending, isVerifying } = usePhoneVerification({ 
    purpose,
    anonymous,
    anonymousUserId
  })

  // Reset verification when phone number changes
  useEffect(() => {
    if (phone !== verifiedPhone) {
      setVerificationStatus('unverified')
      setVerifiedPhone('')
    }
  }, [phone, verifiedPhone])

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPhone = e.target.value
    onPhoneChange(newPhone)
    // Reset verification if phone changes
    if (newPhone !== verifiedPhone) {
      setVerificationStatus('unverified')
    }
  }

  const handleVerifyClick = async () => {
    if (!phone || !/^0\d{9}$/.test(phone)) {
      return
    }
    
    // Send OTP first
    setVerificationStatus('verifying')
    const result = await sendOTP(phone)
    
    if (result.success) {
      // OTP sent successfully, open modal at step 2 (OTP entry)
      setShowModal(true)
    } else {
      // Failed to send OTP
      setVerificationStatus('error')
      alert(result.error || 'Failed to send verification code. Please try again.')
    }
  }

  const handleModalVerified = (verifiedPhone: string) => {
    setVerifiedPhone(verifiedPhone)
    setVerificationStatus('verified')
    onVerified(verifiedPhone)
    setShowModal(false)
  }

  const handleModalCancel = () => {
    setShowModal(false)
    // Reset verification status if modal is cancelled
    if (verificationStatus === 'verifying') {
      setVerificationStatus('unverified')
    }
  }

  const isPhoneValid = phone && /^0\d{9}$/.test(phone)
  const showVerifyButton = isPhoneValid && verificationStatus !== 'verified'

  return (
    <>
      <div>
        <label className="mb-2 block text-base font-medium text-gray-700">
          {label} {required && <span className="text-danger">*</span>}
        </label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder={placeholder}
              className={`w-full rounded-md border px-3 py-2 text-base min-h-touch focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20 ${
                error ? 'border-danger' : 'border-gray-300'
              } ${
                verificationStatus === 'verified' ? 'border-green-500 bg-green-50' : ''
              }`}
            />
            {/* Status indicator inside field */}
            {phone && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {verificationStatus === 'verified' && (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                )}
                {verificationStatus === 'unverified' && isPhoneValid && (
                  <XCircle className="w-5 h-5 text-gray-400" />
                )}
                {verificationStatus === 'verifying' && (
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                )}
              </div>
            )}
          </div>
          {showVerifyButton && (
            <button
              type="button"
              onClick={handleVerifyClick}
              className="px-4 py-2 rounded-md border border-primary text-primary font-medium hover:bg-primary hover:text-white transition-colors whitespace-nowrap"
            >
              Verify
            </button>
          )}
          {verificationStatus === 'verified' && (
            <div className="px-4 py-2 rounded-md bg-green-50 border border-green-200 text-green-700 font-medium whitespace-nowrap flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Verified
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-danger">{error}</p>
        )}
        {verificationStatus === 'unverified' && isPhoneValid && (
          <p className="mt-1 text-sm text-gray-600">Please verify your phone number</p>
        )}
      </div>

      <EditPhoneModal
        currentPhone={phone}
        isOpen={showModal}
        onVerified={handleModalVerified}
        onCancel={handleModalCancel}
        purpose={purpose}
        user={null} // Anonymous users don't have a user object
        skipPhoneInput={true} // Skip phone input step, go directly to OTP
        isAnonymous={anonymous} // Pass anonymous flag
        anonymousUserId={anonymousUserId} // Pass anonymous user ID
        showSuccessToast={(message) => {
          // You can integrate with your toast system here
          console.log(message)
        }}
      />
    </>
  )
}

