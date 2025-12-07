/**
 * Test constants and test data
 */

export const DISTRICTS = [
  'Colombo',
  'Gampaha',
  'Kalutara',
  'Kandy',
  'Matale',
  'Nuwara Eliya',
  'Galle',
  'Matara',
  'Hambantota',
  'Jaffna',
  'Kilinochchi',
  'Mannar',
  'Vavuniya',
  'Mullaitivu',
  'Batticaloa',
  'Ampara',
  'Trincomalee',
  'Kurunegala',
  'Puttalam',
  'Anuradhapura',
  'Polonnaruwa',
  'Badulla',
  'Monaragala',
  'Ratnapura',
  'Kegalle',
]

export const CLAIM_TYPES = [
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
] as const

export const TEST_PHONE_NUMBERS = {
  valid: '0771234567',
  invalid: '123456789',
  tooShort: '077123',
  tooLong: '07712345678',
}

export const TEST_NIC_NUMBERS = {
  oldFormat: '123456789V',
  newFormat: '123456789012',
  invalid: '12345',
}

