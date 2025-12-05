// Enum types (previously from Prisma, now defined directly)
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type MissingStatus = 'MISSING' | 'FOUND' | 'CLOSED';
export type MatchMethod = 'MANUAL' | 'AUTOMATIC' | 'PHOTO_MATCH';

// Person types
export interface PersonData {
  fullName: string;
  age: number;
  gender: Gender;
  nic?: string;
  contactNumber?: string;
  shelterId: string;
  specialNotes?: string;
  photoUrl?: string;
  photoPublicId?: string;
}

// Missing Person types
export interface MissingPersonData {
  fullName: string;
  age: number;
  gender: Gender;
  photoUrl: string;
  photoPublicId: string;
  lastSeenLocation: string;
  lastSeenDistrict: string;
  lastSeenDate: Date;
  clothing?: string;
  reporterName: string;
  reporterPhone: string;
  altContact?: string;
}

// Search types
export type SearchType = 'name' | 'nic';

export interface SearchParams {
  type: SearchType;
  query?: string;
  nic?: string;
}

export type SearchStatus = 'SHELTERED' | 'FOUND_AND_SHELTERED' | 'FOUND' | 'MISSING';

export interface UnifiedSearchResultPerson {
  id: string;
  fullName: string;
  age: number;
  gender: Gender;
  nic?: string;
  photoUrl?: string;
  shelter?: {
    name: string;
    district: string;
    contactNumber?: string;
  };
  createdAt: Date;
}

// Type alias for PersonCard component which expects shelter to be required
export type PersonSearchResult = Omit<UnifiedSearchResultPerson, 'shelter'> & {
  shelter: {
    name: string;
    district: string;
    contactNumber?: string;
  };
};

export interface UnifiedSearchResultMissingReport {
  id: string;
  posterCode: string;
  fullName: string;
  age: number;
  gender: Gender;
  nic?: string;
  photoUrl?: string;
  lastSeenLocation: string;
  lastSeenDistrict: string;
  lastSeenDate?: Date;
  clothing?: string;
  reporterName: string;
  reporterPhone: string;
  altContact?: string;
  status: MissingStatus;
  createdAt: Date;
}

export interface UnifiedSearchResult {
  id: string;
  status: SearchStatus;
  similarityScore?: number;
  person?: UnifiedSearchResultPerson;
  missingReport?: UnifiedSearchResultMissingReport;
}

// Match types
export interface PotentialMatch {
  id: string;
  fullName: string;
  age: number;
  gender: Gender;
  lastSeenLocation: string;
  lastSeenDistrict: string;
  lastSeenDate: Date;
  reporterName: string;
  reporterPhone: string;
  confidence: number;
}

// Shelter types
export interface ShelterData {
  name: string;
  code: string;
  district: string;
  address?: string;
  contactPerson?: string;
  contactNumber?: string;
  capacity?: number;
}

// Statistics types
export interface AppStatistics {
  totalPersons: number;
  totalShelters: number;
  activeShelters: number;
  totalMissing: number;
  totalMatches: number;
  byDistrict: Record<string, number>;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
}

export interface ValidationError {
  field: string;
  message: string;
}
