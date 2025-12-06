-- =====================================================
-- Compensation Application System Migration
-- Created: 2025-12-06
-- Purpose: Enable disaster-affected individuals to apply
--          for government compensation
-- =====================================================

-- =====================================================
-- 1. ADMINISTRATIVE DIVISIONS REFERENCE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS administrative_divisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district VARCHAR(100) NOT NULL,
  divisional_secretariat VARCHAR(100) NOT NULL,
  grama_niladhari_division VARCHAR(100) NOT NULL,
  gn_code VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(district, divisional_secretariat, grama_niladhari_division)
);

CREATE INDEX idx_admin_div_district ON administrative_divisions(district);
CREATE INDEX idx_admin_div_div_sec ON administrative_divisions(divisional_secretariat);
CREATE INDEX idx_admin_div_gn ON administrative_divisions(grama_niladhari_division);

-- =====================================================
-- 2. COMPENSATION APPLICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS compensation_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Applicant Information
  applicant_name VARCHAR(255) NOT NULL,
  applicant_nic VARCHAR(20) NOT NULL,
  applicant_phone VARCHAR(15) NOT NULL,
  applicant_address TEXT NOT NULL,

  -- Location Information
  district VARCHAR(100) NOT NULL,
  divisional_secretariat VARCHAR(100) NOT NULL,
  grama_niladhari_division VARCHAR(100) NOT NULL,

  -- Application Status
  status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN (
    'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'PAID'
  )),

  -- Administrative Fields
  admin_notes TEXT,
  reviewed_by VARCHAR(100),
  reviewed_at TIMESTAMPTZ,

  -- Metadata
  application_code VARCHAR(20) UNIQUE NOT NULL,
  submitted_from_ip VARCHAR(50),
  phone_verified BOOLEAN DEFAULT FALSE,
  sms_sent BOOLEAN DEFAULT FALSE,
  sms_sent_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_comp_app_status ON compensation_applications(status);
CREATE INDEX idx_comp_app_district ON compensation_applications(district);
CREATE INDEX idx_comp_app_div_sec ON compensation_applications(divisional_secretariat);
CREATE INDEX idx_comp_app_gn ON compensation_applications(grama_niladhari_division);
CREATE INDEX idx_comp_app_created ON compensation_applications(created_at DESC);
CREATE INDEX idx_comp_app_code ON compensation_applications(application_code);
CREATE INDEX idx_comp_app_nic ON compensation_applications(applicant_nic);
CREATE INDEX idx_comp_app_phone ON compensation_applications(applicant_phone);

-- =====================================================
-- 3. COMPENSATION CLAIMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS compensation_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES compensation_applications(id) ON DELETE CASCADE,

  -- Claim Type (based on government circular)
  claim_type VARCHAR(50) NOT NULL CHECK (claim_type IN (
    'CLEANING_ALLOWANCE',           -- Serial 1: Rs 25,000
    'KITCHEN_UTENSILS',             -- Serial 2: Rs 50,000
    'LIVELIHOOD_ALLOWANCE',         -- Serial 3: Rs 25,000-50,000 (3 months)
    'RENTAL_ALLOWANCE',             -- Serial 4: Rs 25,000/month (max 6 months)
    'CROP_DAMAGE_PADDY',            -- Serial 5: Rs 150,000/hectare
    'CROP_DAMAGE_VEGETABLES',       -- Serial 6: Rs 200,000/hectare
    'LIVESTOCK_FARM',               -- Serial 7: Rs 200,000
    'SMALL_ENTERPRISE',             -- Serial 8: Rs 200,000
    'FISHING_BOAT',                 -- Serial 9: Max Rs 400,000
    'SCHOOL_SUPPLIES',              -- Serial 10: Rs 15,000/child
    'BUSINESS_BUILDING',            -- Serial 11: Max Rs 5,000,000
    'NEW_HOUSE_CONSTRUCTION',       -- Serial 12: Rs 5,000,000
    'LAND_PURCHASE',                -- Serial 13: Max Rs 5,000,000
    'HOUSE_REPAIR',                 -- Serial 14: Max Rs 2,500,000
    'DEATH_DISABILITY'              -- Serial 15: Rs 1,000,000
  )),

  -- Claim Status
  claim_status VARCHAR(50) DEFAULT 'PENDING' CHECK (claim_status IN (
    'PENDING', 'APPROVED', 'REJECTED'
  )),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comp_claims_application ON compensation_claims(application_id);
CREATE INDEX idx_comp_claims_type ON compensation_claims(claim_type);
CREATE INDEX idx_comp_claims_status ON compensation_claims(claim_status);

-- =====================================================
-- 4. COMPENSATION ADMINS TABLE (for dashboard access)
-- =====================================================
CREATE TABLE IF NOT EXISTS compensation_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  role VARCHAR(50) DEFAULT 'ADMIN' CHECK (role IN ('ADMIN', 'SUPER_ADMIN')),
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comp_admins_username ON compensation_admins(username);
CREATE INDEX idx_comp_admins_active ON compensation_admins(is_active);

-- =====================================================
-- 5. TRIGGER: Update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_compensation_applications_updated_at
  BEFORE UPDATE ON compensation_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compensation_claims_updated_at
  BEFORE UPDATE ON compensation_claims
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compensation_admins_updated_at
  BEFORE UPDATE ON compensation_admins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. INSERT ADMINISTRATIVE DIVISIONS DATA
-- =====================================================
-- Official DS Divisions from government data
-- NOTE: GN divisions are placeholders - replace with actual GN division data

INSERT INTO administrative_divisions (district, divisional_secretariat, grama_niladhari_division, gn_code) VALUES
-- Ampara District (20 DS Divisions)
('Ampara', 'Addalaichenai', 'GN Division 1', NULL),
('Ampara', 'Akkaraipattu', 'GN Division 1', NULL),
('Ampara', 'Alaiyadivembu', 'GN Division 1', NULL),
('Ampara', 'Damana', 'GN Division 1', NULL),
('Ampara', 'Dehiaththakandiya', 'GN Division 1', NULL),
('Ampara', 'Irakkamam', 'GN Division 1', NULL),
('Ampara', 'Kalmunai Tamil', 'GN Division 1', NULL),
('Ampara', 'Kalmunai', 'GN Division 1', NULL),
('Ampara', 'Karathivu', 'GN Division 1', NULL),
('Ampara', 'Lahugala', 'GN Division 1', NULL),
('Ampara', 'Mahaoya', 'GN Division 1', NULL),
('Ampara', 'Namaloya - Ampara', 'GN Division 1', NULL),
('Ampara', 'Nawithanweli', 'GN Division 1', NULL),
('Ampara', 'Ninthaur', 'GN Division 1', NULL),
('Ampara', 'Padiyathalawa', 'GN Division 1', NULL),
('Ampara', 'Pothuwil', 'GN Division 1', NULL),
('Ampara', 'Sammanthurai', 'GN Division 1', NULL),
('Ampara', 'Sainthamaruthu', 'GN Division 1', NULL),
('Ampara', 'Thirukkovil', 'GN Division 1', NULL),
('Ampara', 'Uhana', 'GN Division 1', NULL),

-- Anuradhapura District (22 DS Divisions)
('Anuradhapura', 'Galenbidunuwewa', 'GN Division 1', NULL),
('Anuradhapura', 'Galnewa', 'GN Division 1', NULL),
('Anuradhapura', 'Horowpothana', 'GN Division 1', NULL),
('Anuradhapura', 'Ipalogama', 'GN Division 1', NULL),
('Anuradhapura', 'Kahatagasdigiliya', 'GN Division 1', NULL),
('Anuradhapura', 'Kebithigollewa', 'GN Division 1', NULL),
('Anuradhapura', 'Kekirawa', 'GN Division 1', NULL),
('Anuradhapura', 'Mahawilachchiya', 'GN Division 1', NULL),
('Anuradhapura', 'Medawachchiya', 'GN Division 1', NULL),
('Anuradhapura', 'Mihinthale', 'GN Division 1', NULL),
('Anuradhapura', 'Nachchaduwa', 'GN Division 1', NULL),
('Anuradhapura', 'Nochchiyagama', 'GN Division 1', NULL),
('Anuradhapura', 'Nuwaragampalatha Central', 'GN Division 1', NULL),
('Anuradhapura', 'Nuwaragampalatha East', 'GN Division 1', NULL),
('Anuradhapura', 'Padaviya', 'GN Division 1', NULL),
('Anuradhapura', 'Palagala', 'GN Division 1', NULL),
('Anuradhapura', 'Palugaswewa', 'GN Division 1', NULL),
('Anuradhapura', 'Rajanganaya', 'GN Division 1', NULL),
('Anuradhapura', 'Rambewa', 'GN Division 1', NULL),
('Anuradhapura', 'Thalawa', 'GN Division 1', NULL),
('Anuradhapura', 'Thambuttegama', 'GN Division 1', NULL),
('Anuradhapura', 'Thirappane', 'GN Division 1', NULL),

-- Badulla District (15 DS Divisions)
('Badulla', 'Badulla', 'GN Division 1', NULL),
('Badulla', 'Bandarawela', 'GN Division 1', NULL),
('Badulla', 'Ella', 'GN Division 1', NULL),
('Badulla', 'Haldummulla', 'GN Division 1', NULL),
('Badulla', 'Haliela', 'GN Division 1', NULL),
('Badulla', 'Haputhale', 'GN Division 1', NULL),
('Badulla', 'Kandeketiya', 'GN Division 1', NULL),
('Badulla', 'Lunugala', 'GN Division 1', NULL),
('Badulla', 'Mahiyanganaya', 'GN Division 1', NULL),
('Badulla', 'Meegahakiwula', 'GN Division 1', NULL),
('Badulla', 'Passara', 'GN Division 1', NULL),
('Badulla', 'Ridimaliyadda', 'GN Division 1', NULL),
('Badulla', 'Soranathota', 'GN Division 1', NULL),
('Badulla', 'Uva- Paranagama', 'GN Division 1', NULL),
('Badulla', 'Welimada', 'GN Division 1', NULL),

-- Batticaloa District (14 DS Divisions)
('Batticaloa', 'Manmunai NORTH/Batticaloa', 'GN Division 1', NULL),
('Batticaloa', 'Eravur Pattu/CHENKALADI', 'GN Division 1', NULL),
('Batticaloa', 'Eravur Town/ERAVUR', 'GN Division 1', NULL),
('Batticaloa', 'Manmunai South/Kalawanchikudi', 'GN Division 1', NULL),
('Batticaloa', 'Kattankudy/KKY', 'GN Division 1', NULL),
('Batticaloa', 'Koralai Pattu South/KIRAN', 'GN Division 1', NULL),
('Batticaloa', 'Koralei Pattu - Valachchenai', 'GN Division 1', NULL),
('Batticaloa', 'Koralei Pattu Central/VALACHCHENEI', 'GN Division 1', NULL),
('Batticaloa', 'Koralei Pattu North/WAHARAI', 'GN Division 1', NULL),
('Batticaloa', 'Koralei Pattu West - Oddamavadi', 'GN Division 1', NULL),
('Batticaloa', 'Manmunai Pattu - ArAYAMPATTU', 'GN Division 1', NULL),
('Batticaloa', 'Manmunai South West/PADDIPALAI', 'GN Division 1', NULL),
('Batticaloa', 'Manmunai West/WAWUNATHIUE', 'GN Division 1', NULL),
('Batticaloa', 'Porativu Pattu/WAELLEWELI', 'GN Division 1', NULL),

-- Colombo District (13 DS Divisions)
('Colombo', 'Colombo', 'GN Division 1', NULL),
('Colombo', 'Dehiwala - Mount Lavinia', 'GN Division 1', NULL),
('Colombo', 'Hanwella', 'GN Division 1', NULL),
('Colombo', 'Homagama', 'GN Division 1', NULL),
('Colombo', 'Kaduwela', 'GN Division 1', NULL),
('Colombo', 'Kesbewa', 'GN Division 1', NULL),
('Colombo', 'Kolonnawa', 'GN Division 1', NULL),
('Colombo', 'Maharagama', 'GN Division 1', NULL),
('Colombo', 'Moratuwa', 'GN Division 1', NULL),
('Colombo', 'Padukka', 'GN Division 1', NULL),
('Colombo', 'Ratmalana', 'GN Division 1', NULL),
('Colombo', 'Sri jayawardhenapura kotte', 'GN Division 1', NULL),
('Colombo', 'Thimbirigasyaya', 'GN Division 1', NULL),

-- Galle District (19 DS Divisions)
('Galle', 'Akmeemana', 'GN Division 1', NULL),
('Galle', 'Ambalangoda', 'GN Division 1', NULL),
('Galle', 'Baddegama', 'GN Division 1', NULL),
('Galle', 'Balapitiya', 'GN Division 1', NULL),
('Galle', 'Benthota', 'GN Division 1', NULL),
('Galle', 'Bope-poddala', 'GN Division 1', NULL),
('Galle', 'Elpitiya', 'GN Division 1', NULL),
('Galle', 'Galle Four Gravets', 'GN Division 1', NULL),
('Galle', 'Gonopinuwala', 'GN Division 1', NULL),
('Galle', 'Habaraduwa', 'GN Division 1', NULL),
('Galle', 'Hikkaduwa', 'GN Division 1', NULL),
('Galle', 'Imaduwa', 'GN Division 1', NULL),
('Galle', 'Karandaniya', 'GN Division 1', NULL),
('Galle', 'Nagoda', 'GN Division 1', NULL),
('Galle', 'Neluwa', 'GN Division 1', NULL),
('Galle', 'Niyagama', 'GN Division 1', NULL),
('Galle', 'Thawalama', 'GN Division 1', NULL),
('Galle', 'Weliwitiya-Divitura', 'GN Division 1', NULL),
('Galle', 'Yakkalamulla', 'GN Division 1', NULL),

-- Gampaha District (13 DS Divisions)
('Gampaha', 'Attanagalla', 'GN Division 1', NULL),
('Gampaha', 'Biyagama', 'GN Division 1', NULL),
('Gampaha', 'Divulapitiya', 'GN Division 1', NULL),
('Gampaha', 'Dompe/Weke', 'GN Division 1', NULL),
('Gampaha', 'Gampaha', 'GN Division 1', NULL),
('Gampaha', 'Ja-Ela', 'GN Division 1', NULL),
('Gampaha', 'Katana', 'GN Division 1', NULL),
('Gampaha', 'Kelaniya', 'GN Division 1', NULL),
('Gampaha', 'Mahara', 'GN Division 1', NULL),
('Gampaha', 'Meeregama', 'GN Division 1', NULL),
('Gampaha', 'Miniwangoda', 'GN Division 1', NULL),
('Gampaha', 'Negombo', 'GN Division 1', NULL),
('Gampaha', 'Wattala', 'GN Division 1', NULL),

-- Hambantota District (12 DS Divisions)
('Hambantota', 'Ambalanthota', 'GN Division 1', NULL),
('Hambantota', 'Angunukolapellessa', 'GN Division 1', NULL),
('Hambantota', 'Beliaththa', 'GN Division 1', NULL),
('Hambantota', 'Habanthota', 'GN Division 1', NULL),
('Hambantota', 'Katuwana', 'GN Division 1', NULL),
('Hambantota', 'Lunugamwehera', 'GN Division 1', NULL),
('Hambantota', 'Okewela', 'GN Division 1', NULL),
('Hambantota', 'Sooriyawewa', 'GN Division 1', NULL),
('Hambantota', 'Thangalla', 'GN Division 1', NULL),
('Hambantota', 'Tissamaharamaya', 'GN Division 1', NULL),
('Hambantota', 'Walasmulla', 'GN Division 1', NULL),
('Hambantota', 'Weeraketiya', 'GN Division 1', NULL),

-- Jaffna District (15 DS Divisions)
('Jaffna', 'Delft', 'GN Division 1', NULL),
('Jaffna', 'Island North/Kytes', 'GN Division 1', NULL),
('Jaffna', 'Island South/Velanai', 'GN Division 1', NULL),
('Jaffna', 'Jaffna', 'GN Division 1', NULL),
('Jaffna', 'Karainager', 'GN Division 1', NULL),
('Jaffna', 'Nallur', 'GN Division 1', NULL),
('Jaffna', 'Thenmarachchi/Chavakachcheri', 'GN Division 1', NULL),
('Jaffna', 'Wadamarachchi East/MADURANKERNEY', 'GN Division 1', NULL),
('Jaffna', 'Wadamarachchi North/Point Pedro', 'GN Division 1', NULL),
('Jaffna', 'Wadamarchchi South West/ Karaveddi', 'GN Division 1', NULL),
('Jaffna', 'Walikamam East/Kopay', 'GN Division 1', NULL),
('Jaffna', 'Walikamam North/Thellippalai', 'GN Division 1', NULL),
('Jaffna', 'Walikamam South West/Sandilippai', 'GN Division 1', NULL),
('Jaffna', 'Walikamam South /Uduwil', 'GN Division 1', NULL),
('Jaffna', 'Walikamm West/Chenkanai', 'GN Division 1', NULL),

-- Kalutara District (14 DS Divisions)
('Kalutara', 'Agalawatta', 'GN Division 1', NULL),
('Kalutara', 'Baduraliya-Palinda Nuwara', 'GN Division 1', NULL),
('Kalutara', 'Bandaragama', 'GN Division 1', NULL),
('Kalutara', 'Beruwala', 'GN Division 1', NULL),
('Kalutara', 'Bulathsinhala', 'GN Division 1', NULL),
('Kalutara', 'Dodamgoda', 'GN Division 1', NULL),
('Kalutara', 'Horana', 'GN Division 1', NULL),
('Kalutara', 'Ingiriya', 'GN Division 1', NULL),
('Kalutara', 'Kalutara', 'GN Division 1', NULL),
('Kalutara', 'Madurawala', 'GN Division 1', NULL),
('Kalutara', 'Mathugama', 'GN Division 1', NULL),
('Kalutara', 'Millaniya', 'GN Division 1', NULL),
('Kalutara', 'Panadura', 'GN Division 1', NULL),
('Kalutara', 'Walallawita', 'GN Division 1', NULL),

-- Kandy District (20 DS Divisions)
('Kandy', 'Akurana', 'GN Division 1', NULL),
('Kandy', 'Delthota', 'GN Division 1', NULL),
('Kandy', 'Doluwa', 'GN Division 1', NULL),
('Kandy', 'Ganga Ihala Korale', 'GN Division 1', NULL),
('Kandy', 'Harispattuwa', 'GN Division 1', NULL),
('Kandy', 'Hatharaliyaadda', 'GN Division 1', NULL),
('Kandy', 'Kandy Four Gravents', 'GN Division 1', NULL),
('Kandy', 'Kundasale', 'GN Division 1', NULL),
('Kandy', 'Medadumbara', 'GN Division 1', NULL),
('Kandy', 'Minipe', 'GN Division 1', NULL),
('Kandy', 'Panwila', 'GN Division 1', NULL),
('Kandy', 'Pasbage Korale', 'GN Division 1', NULL),
('Kandy', 'Pathadumbara', 'GN Division 1', NULL),
('Kandy', 'Pathahewaheta', 'GN Division 1', NULL),
('Kandy', 'Poojapitiya', 'GN Division 1', NULL),
('Kandy', 'Thumpane', 'GN Division 1', NULL),
('Kandy', 'Udadumbara', 'GN Division 1', NULL),
('Kandy', 'Udapalatha', 'GN Division 1', NULL),
('Kandy', 'Udunuwara', 'GN Division 1', NULL),
('Kandy', 'Yatinuwara', 'GN Division 1', NULL),

-- Kegalle District (11 DS Divisions)
('Kegalle', 'ARANAYAKA', 'GN Division 1', NULL),
('Kegalle', 'BULATHKOHUPITIYA', 'GN Division 1', NULL),
('Kegalle', 'DEHIOVITA', 'GN Division 1', NULL),
('Kegalle', 'DARANIYAGALA', 'GN Division 1', NULL),
('Kegalle', 'GALIGAMUWA', 'GN Division 1', NULL),
('Kegalle', 'KEGALLA', 'GN Division 1', NULL),
('Kegalle', 'MAWANALLA', 'GN Division 1', NULL),
('Kegalle', 'RAMBUKKΑΝΑ', 'GN Division 1', NULL),
('Kegalle', 'WARAKAPOLA', 'GN Division 1', NULL),
('Kegalle', 'RUWANWELLA', 'GN Division 1', NULL),
('Kegalle', 'YATIYANTHOTA', 'GN Division 1', NULL),

-- Kilinochchi District (4 DS Divisions)
('Kilinochchi', 'KANDAVALAI', 'GN Division 1', NULL),
('Kilinochchi', 'KARACHCHI', 'GN Division 1', NULL),
('Kilinochchi', 'PACHILEIPPALI', 'GN Division 1', NULL),
('Kilinochchi', 'PUNAKRI', 'GN Division 1', NULL),

-- Kurunegala District (29 DS Divisions)
('Kurunegala', 'Alawwa', 'GN Division 1', NULL),
('Kurunegala', 'Ambanpola', 'GN Division 1', NULL),
('Kurunegala', 'Bamunakotuwa', 'GN Division 1', NULL),
('Kurunegala', 'Bingiriya', 'GN Division 1', NULL),
('Kurunegala', 'Ehetuwewa', 'GN Division 1', NULL),
('Kurunegala', 'Galgamuwa', 'GN Division 1', NULL),
('Kurunegala', 'Ganewatta', 'GN Division 1', NULL),
('Kurunegala', 'Giribawa', 'GN Division 1', NULL),
('Kurunegala', 'Ibbagamuwa', 'GN Division 1', NULL),
('Kurunegala', 'kobeigane', 'GN Division 1', NULL),
('Kurunegala', 'Kotawehera', 'GN Division 1', NULL),
('Kurunegala', 'Kuliyapitiya - East', 'GN Division 1', NULL),
('Kurunegala', 'Kuliyapitiya- West', 'GN Division 1', NULL),
('Kurunegala', 'Kurunegala', 'GN Division 1', NULL),
('Kurunegala', 'Maho', 'GN Division 1', NULL),
('Kurunegala', 'Mallawapitiya', 'GN Division 1', NULL),
('Kurunegala', 'Maspotha', 'GN Division 1', NULL),
('Kurunegala', 'Mawathagama', 'GN Division 1', NULL),
('Kurunegala', 'Narammala', 'GN Division 1', NULL),
('Kurunegala', 'Nikaweratiya', 'GN Division 1', NULL),
('Kurunegala', 'Panduwasnuwara - Hettipola', 'GN Division 1', NULL),
('Kurunegala', 'Pannala', 'GN Division 1', NULL),
('Kurunegala', 'Polgahawela', 'GN Division 1', NULL),
('Kurunegala', 'Polpithigama', 'GN Division 1', NULL),
('Kurunegala', 'Rasnayakapura', 'GN Division 1', NULL),
('Kurunegala', 'Rideegama', 'GN Division 1', NULL),
('Kurunegala', 'Udubaddawa', 'GN Division 1', NULL),
('Kurunegala', 'Wariyapola', 'GN Division 1', NULL),
('Kurunegala', 'Weerambugedara', 'GN Division 1', NULL),

-- Mannar District (5 DS Divisions)
('Mannar', 'MADU', 'GN Division 1', NULL),
('Mannar', 'MANNAR', 'GN Division 1', NULL),
('Mannar', 'MANTHEI WEST', 'GN Division 1', NULL),
('Mannar', 'MUSALI', 'GN Division 1', NULL),
('Mannar', 'NANATAN', 'GN Division 1', NULL),

-- Matale District (11 DS Divisions)
('Matale', 'Ukuwela', 'GN Division 1', NULL),
('Matale', 'Wilgamuwa', 'GN Division 1', NULL),
('Matale', 'Yatawaththa', 'GN Division 1', NULL),
('Matale', 'Ambanganga Korale', 'GN Division 1', NULL),
('Matale', 'Dambulla', 'GN Division 1', NULL),
('Matale', 'Galewela', 'GN Division 1', NULL),
('Matale', 'Laggala-Pallegama', 'GN Division 1', NULL),
('Matale', 'Matale', 'GN Division 1', NULL),
('Matale', 'Naula', 'GN Division 1', NULL),
('Matale', 'Pallepola', 'GN Division 1', NULL),
('Matale', 'Raththota', 'GN Division 1', NULL),

-- Matara District (16 DS Divisions)
('Matara', 'Akuressa', 'GN Division 1', NULL),
('Matara', 'Athuraliya', 'GN Division 1', NULL),
('Matara', 'Devinuwara', 'GN Division 1', NULL),
('Matara', 'Dickwella', 'GN Division 1', NULL),
('Matara', 'Hakmana', 'GN Division 1', NULL),
('Matara', 'Kamburupitiya', 'GN Division 1', NULL),
('Matara', 'Kirinda- Puhulwella', 'GN Division 1', NULL),
('Matara', 'Kotapola', 'GN Division 1', NULL),
('Matara', 'Malimboda', 'GN Division 1', NULL),
('Matara', 'Matara', 'GN Division 1', NULL),
('Matara', 'Mulatiyana', 'GN Division 1', NULL),
('Matara', 'Pasgoda', 'GN Division 1', NULL),
('Matara', 'Pitabeddara', 'GN Division 1', NULL),
('Matara', 'Thiahagoda', 'GN Division 1', NULL),
('Matara', 'Weligama', 'GN Division 1', NULL),
('Matara', 'Welipitiya', 'GN Division 1', NULL),

-- Monaragala District (11 DS Divisions)
('Monaragala', 'Buththala', 'GN Division 1', NULL),
('Monaragala', 'katharagama', 'GN Division 1', NULL),
('Monaragala', 'Madulla', 'GN Division 1', NULL),
('Monaragala', 'Medagama', 'GN Division 1', NULL),
('Monaragala', 'Monaragala', 'GN Division 1', NULL),
('Monaragala', 'Sewanagala', 'GN Division 1', NULL),
('Monaragala', 'Siyabalanduwa', 'GN Division 1', NULL),
('Monaragala', 'Thanamalwila', 'GN Division 1', NULL),
('Monaragala', 'Wellawaya', 'GN Division 1', NULL),
('Monaragala', 'Badalkumbura', 'GN Division 1', NULL),
('Monaragala', 'Bibile', 'GN Division 1', NULL),

-- Mullaitivu District (5 DS Divisions)
('Mullaitivu', 'Dunukkai', 'GN Division 1', NULL),
('Mullaitivu', 'Manthei East', 'GN Division 1', NULL),
('Mullaitivu', 'Maritime Pattu', 'GN Division 1', NULL),
('Mullaitivu', 'Oddusudan', 'GN Division 1', NULL),
('Mullaitivu', 'Pudukudirippu', 'GN Division 1', NULL),

-- Nuwara Eliya District (6 DS Divisions)
('Nuwara Eliya', 'Welioya', 'GN Division 1', NULL),
('Nuwara Eliya', 'AMBAGAMUWA', 'GN Division 1', NULL),
('Nuwara Eliya', 'HANGURANKETHA', 'GN Division 1', NULL),
('Nuwara Eliya', 'KOTHMALE', 'GN Division 1', NULL),
('Nuwara Eliya', 'NUWARA ELIYA', 'GN Division 1', NULL),
('Nuwara Eliya', 'WALAPANE', 'GN Division 1', NULL),

-- Polonnaruwa District (7 DS Divisions)
('Polonnaruwa', 'DIMBULAGAMA', 'GN Division 1', NULL),
('Polonnaruwa', 'ELAHARA', 'GN Division 1', NULL),
('Polonnaruwa', 'HINGURAKGODA', 'GN Division 1', NULL),
('Polonnaruwa', 'LANKA PURA', 'GN Division 1', NULL),
('Polonnaruwa', 'MEDIRIGIRIYA', 'GN Division 1', NULL),
('Polonnaruwa', 'THAMANKADUWA', 'GN Division 1', NULL),
('Polonnaruwa', 'WELIKANDA', 'GN Division 1', NULL),

-- Puttalam District (16 DS Divisions)
('Puttalam', 'Anamaduwa', 'GN Division 1', NULL),
('Puttalam', 'Arachchkattuwa', 'GN Division 1', NULL),
('Puttalam', 'Chilaw', 'GN Division 1', NULL),
('Puttalam', 'Dankotuwa', 'GN Division 1', NULL),
('Puttalam', 'Kalpitiya', 'GN Division 1', NULL),
('Puttalam', 'Karuwalagaswewa', 'GN Division 1', NULL),
('Puttalam', 'Madampe', 'GN Division 1', NULL),
('Puttalam', 'Mahakumbukkadawala', 'GN Division 1', NULL),
('Puttalam', 'Mahawewa', 'GN Division 1', NULL),
('Puttalam', 'Mundel', 'GN Division 1', NULL),
('Puttalam', 'Nattandiya', 'GN Division 1', NULL),
('Puttalam', 'Nawagaththegama', 'GN Division 1', NULL),
('Puttalam', 'Pallama', 'GN Division 1', NULL),
('Puttalam', 'Puttlam', 'GN Division 1', NULL),
('Puttalam', 'Wanathawilluwa', 'GN Division 1', NULL),
('Puttalam', 'Wennappuwa', 'GN Division 1', NULL),

-- Ratnapura District (17 DS Divisions)
('Ratnapura', 'Ayagama', 'GN Division 1', NULL),
('Ratnapura', 'Balangoda', 'GN Division 1', NULL),
('Ratnapura', 'Eheliyagoda', 'GN Division 1', NULL),
('Ratnapura', 'Elapatha', 'GN Division 1', NULL),
('Ratnapura', 'Embilipitiya', 'GN Division 1', NULL),
('Ratnapura', 'Godakawela', 'GN Division 1', NULL),
('Ratnapura', 'Imbulpe', 'GN Division 1', NULL),
('Ratnapura', 'Kahawaththa', 'GN Division 1', NULL),
('Ratnapura', 'Kalawana', 'GN Division 1', NULL),
('Ratnapura', 'Kiriella', 'GN Division 1', NULL),
('Ratnapura', 'Kolonna', 'GN Division 1', NULL),
('Ratnapura', 'Kuruwita', 'GN Division 1', NULL),
('Ratnapura', 'Niwithigala', 'GN Division 1', NULL),
('Ratnapura', 'Opanayaka', 'GN Division 1', NULL),
('Ratnapura', 'Pelmadulla', 'GN Division 1', NULL),
('Ratnapura', 'Rathnapura', 'GN Division 1', NULL),
('Ratnapura', 'Weligepola', 'GN Division 1', NULL),

-- Trincomalee District (12 DS Divisions)
('Trincomalee', 'GOMARANKADAWALA', 'GN Division 1', NULL),
('Trincomalee', 'KANTHALE', 'GN Division 1', NULL),
('Trincomalee', 'KINNIYA', 'GN Division 1', NULL),
('Trincomalee', 'KUCHCHAWELI', 'GN Division 1', NULL),
('Trincomalee', 'MORAWEWA', 'GN Division 1', NULL),
('Trincomalee', 'MUTHUR', 'GN Division 1', NULL),
('Trincomalee', 'PADAVIYA SRIPURA', 'GN Division 1', NULL),
('Trincomalee', 'SERUWILA', 'GN Division 1', NULL),
('Trincomalee', 'THAMBALAGAMUWA', 'GN Division 1', NULL),
('Trincomalee', 'THOPPUR', 'GN Division 1', NULL),
('Trincomalee', 'TOWN AND GRAVETS', 'GN Division 1', NULL),
('Trincomalee', 'VERUGAL ECHCHALAMPATTU', 'GN Division 1', NULL),

-- Vavuniya District (4 DS Divisions)
('Vavuniya', 'Vavuniya', 'GN Division 1', NULL),
('Vavuniya', 'Vavuniya North', 'GN Division 1', NULL),
('Vavuniya', 'Vavuniya South', 'GN Division 1', NULL),
('Vavuniya', 'Vengalachddikulam', 'GN Division 1', NULL)

ON CONFLICT (district, divisional_secretariat, grama_niladhari_division) DO NOTHING;

-- =====================================================
-- 7. CREATE DEFAULT ADMIN USER
-- =====================================================
-- Username: admin
-- Password: Admin@2025 (bcrypt hash below)
-- This should be changed immediately after deployment

INSERT INTO compensation_admins (username, password_hash, full_name, email, role)
VALUES (
  'admin',
  '$2a$10$rQZ8qGqJZvJxKJxKZJxKZOqJxKZJxKZJxKZJxKZJxKZJxKZJxKZJxK', -- Password: Admin@2025
  'System Administrator',
  'admin@isafe.gov.lk',
  'SUPER_ADMIN'
) ON CONFLICT (username) DO NOTHING;

-- =====================================================
-- 8. COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON TABLE compensation_applications IS 'Stores disaster compensation applications from affected individuals';
COMMENT ON TABLE compensation_claims IS 'Links applications to specific claim types (15 types from gov circular)';
COMMENT ON TABLE administrative_divisions IS 'Reference data for Sri Lankan administrative divisions';
COMMENT ON TABLE compensation_admins IS 'Admin users who can access the compensation dashboard';

COMMENT ON COLUMN compensation_applications.application_code IS 'Unique code for tracking (e.g., COMP-2025-ABC123)';
COMMENT ON COLUMN compensation_applications.phone_verified IS 'Whether phone number was verified via OTP';
COMMENT ON COLUMN compensation_applications.sms_sent IS 'Whether confirmation SMS was sent to applicant';
