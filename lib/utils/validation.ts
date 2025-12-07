import { z } from 'zod';

// NIC validation (Sri Lankan format)
const nicRegex = /^(\d{9}[VvXx]|\d{12})$/;

export const nicSchema = z
  .string()
  .regex(nicRegex, 'Invalid NIC format (e.g., 199512345678 or 951234567V)')
  .transform((val) => val.toUpperCase());

// Phone validation (Sri Lankan format: 10 digits starting with 0)
const phoneRegex = /^0\d{9}$/;

export const phoneSchema = z
  .string()
  .regex(phoneRegex, 'Invalid phone number (e.g., 0771234567)');

// Search validation
export const searchSchema = z.object({
  type: z.enum(['name', 'nic']),
  query: z.preprocess(
    (val) => (val === null || val === '' ? undefined : val),
    z.string().min(2, 'Search term must be at least 2 characters').optional()
  ),
  nic: z.preprocess(
    (val) => (val === null || val === '' ? undefined : val),
    z.string().optional()
  ),
}).refine(
  (data) => {
    if (data.type === 'name') {
      return !!data.query && data.query.trim().length >= 2;
    }
    if (data.type === 'nic') {
      return !!data.nic && data.nic.trim().length > 0;
    }
    return false;
  },
  {
    message: 'Query is required for name search (min 2 characters), NIC is required for NIC search',
  }
);

// Person registration validation
export const personSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  age: z.coerce.number().min(0, 'Age must be at least 0').max(120, 'Age must be at most 120'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  nic: nicSchema.optional().or(z.literal('')),
  contactNumber: phoneSchema.optional().or(z.literal('')),
  shelterId: z.string().min(1, 'Shelter is required'),
  specialNotes: z.string().max(500, 'Notes must be at most 500 characters').optional(),
  photoUrl: z.string().optional(),
  photoPublicId: z.string().optional(),
});

// Missing person validation
export const missingPersonSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  age: z.coerce.number().min(0, 'Age must be at least 0').max(120, 'Age must be at most 120'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  photoUrl: z.string().min(1, 'Photo is required'),
  photoPublicId: z.string().min(1, 'Photo is required'),
  lastSeenLocation: z.string().min(2, 'Location is required'),
  lastSeenDistrict: z.string().min(1, 'District is required'),
  lastSeenDate: z.coerce.date(),
  clothing: z.string().max(200).optional(),
  reporterName: z.string().min(2, 'Your name is required'),
  reporterPhone: phoneSchema,
  altContact: phoneSchema.optional().or(z.literal('')),
  consent: z.boolean().refine((val) => val === true, 'You must authorize sharing this information'),
});

// Shelter auth validation
export const shelterAuthSchema = z.object({
  code: z.string().min(1, 'Shelter code is required'),
  accessCode: z.string().min(1, 'Access code is required'),
});

// Compensation claim types
export const claimTypeEnum = z.enum([
  'CLEANING_ALLOWANCE',
  'KITCHEN_UTENSILS',
  'LIVELIHOOD_ALLOWANCE',
  'RENTAL_ALLOWANCE',
  'CROP_DAMAGE_PADDY',
  'CROP_DAMAGE_VEGETABLES',
  'LIVESTOCK_FARM',
  'SMALL_ENTERPRISE',
  'FISHING_BOAT',
  'SCHOOL_SUPPLIES',
  'BUSINESS_BUILDING',
  'NEW_HOUSE_CONSTRUCTION',
  'LAND_PURCHASE',
  'HOUSE_REPAIR',
  'DEATH_DISABILITY',
]);

export type ClaimType = z.infer<typeof claimTypeEnum>;

// Compensation application validation
export const compensationApplicationSchema = z.object({
  applicantName: z.string().min(2, 'Name must be at least 2 characters').max(255),
  applicantNic: nicSchema,
  applicantPhone: phoneSchema,
  applicantAddress: z.string().min(10, 'Please provide complete address').max(500),
  district: z.string().min(1, 'District is required'),
  divisionalSecretariat: z.string().min(1, 'Divisional Secretariat is required'),
  gramaNiladhariDivision: z.string().min(1, 'Grama Niladhari Division is required'),
  claims: z.array(claimTypeEnum).min(1, 'Please select at least one claim type'),
  phoneVerified: z.boolean().refine((val) => val === true, 'Phone number must be verified'),
  locale: z.enum(['en', 'si', 'ta']).optional().default('en'),
});

export type CompensationApplicationInput = z.infer<typeof compensationApplicationSchema>;

// Admin authentication validation
export const compensationAdminAuthSchema = z.object({
  username: z.string().min(3, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Application filters validation
export const compensationFilterSchema = z.object({
  status: z.enum(['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'PAID']).optional(),
  district: z.string().optional(),
  divisionalSecretariat: z.string().optional(),
  gramaNiladhariDivision: z.string().optional(),
  claimType: claimTypeEnum.optional(),
  search: z.string().optional(), // Search by name, NIC, or application code
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(50),
});

export type CompensationFilter = z.infer<typeof compensationFilterSchema>;
