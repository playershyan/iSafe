import { customAlphabet } from 'nanoid';

// Generate unique poster code (e.g., MP12345)
const nanoid = customAlphabet('0123456789', 5);

export function generatePosterCode(): string {
  return `MP${nanoid()}`;
}

// Format phone number (0771234567 → 077 123 4567)
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  return phone;
}

// Format NIC (add spaces for readability)
export function formatNIC(nic: string): string {
  const cleaned = nic.trim().toUpperCase();
  if (cleaned.length === 10) {
    // Old format: 951234567V → 95 1234 567 V
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  } else if (cleaned.length === 12) {
    // New format: 199512345678 → 1995 1234 5678
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 8)} ${cleaned.slice(8)}`;
  }
  return cleaned;
}

// Calculate age from date
export function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

// Truncate text with ellipsis
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}
