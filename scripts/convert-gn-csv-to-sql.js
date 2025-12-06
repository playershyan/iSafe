const fs = require('fs');
const path = require('path');

// Directory containing CSV files
const csvFolder = path.join(__dirname, '..', 'GN CSV Folder');
const outputJson = path.join(__dirname, '..', 'gn-data.json');
const outputSql = path.join(__dirname, '..', 'database', 'migrations', '006_insert_gn_data.sql');

// Function to extract English name from formatted string
// Example: "1: කොළඹ/ ‎கொழும்பு/ Colombo" -> "Colombo"
function extractEnglishName(formattedString) {
  if (!formattedString) return '';
  const parts = formattedString.split('/');
  if (parts.length >= 3) {
    return parts[2].trim();
  }
  // Fallback: try to extract after last colon
  const colonIndex = formattedString.lastIndexOf(':');
  if (colonIndex !== -1) {
    const afterColon = formattedString.substring(colonIndex + 1).trim();
    const slashParts = afterColon.split('/');
    return slashParts[slashParts.length - 1].trim();
  }
  return formattedString.trim();
}

// Function to parse CSV line
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Function to process a single CSV file
function processCSVFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  if (lines.length < 3) {
    console.warn(`Skipping ${filePath}: Not enough lines`);
    return [];
  }
  
  // Skip first line (header "GN List")
  // Second line is column headers
  const data = [];
  
  for (let i = 2; i < lines.length; i++) {
    const columns = parseCSVLine(lines[i]);
    
    if (columns.length < 9) {
      continue; // Skip incomplete rows
    }
    
    const lifeCode = columns[0] || '';
    const gnCode = columns[1] || '';
    const nameEnglish = columns[4] || '';
    const districtFormatted = columns[7] || '';
    const divisionalSecretariatFormatted = columns[8] || '';
    
    // Extract English names
    const district = extractEnglishName(districtFormatted);
    const divisionalSecretariat = extractEnglishName(divisionalSecretariatFormatted);
    const gramaNiladhariDivision = nameEnglish;
    
    // Skip if essential data is missing
    if (!district || !divisionalSecretariat || !gramaNiladhariDivision) {
      continue;
    }
    
    data.push({
      district,
      divisional_secretariat: divisionalSecretariat,
      grama_niladhari_division: gramaNiladhariDivision,
      gn_code: gnCode || null,
      life_code: lifeCode || null
    });
  }
  
  return data;
}

// Main processing
console.log('Starting CSV to JSON/SQL conversion...');

const csvFiles = fs.readdirSync(csvFolder)
  .filter(file => file.endsWith('.csv'))
  .map(file => path.join(csvFolder, file));

console.log(`Found ${csvFiles.length} CSV files`);

let allData = [];
const seen = new Set(); // For deduplication

for (const csvFile of csvFiles) {
  console.log(`Processing: ${path.basename(csvFile)}`);
  const data = processCSVFile(csvFile);
  
  for (const record of data) {
    // Create unique key for deduplication
    const key = `${record.district}|${record.divisional_secretariat}|${record.grama_niladhari_division}`;
    
    if (!seen.has(key)) {
      seen.add(key);
      allData.push(record);
    }
  }
}

console.log(`\nTotal unique records: ${allData.length}`);

// Sort by district, divisional secretariat, then GN division
allData.sort((a, b) => {
  if (a.district !== b.district) {
    return a.district.localeCompare(b.district);
  }
  if (a.divisional_secretariat !== b.divisional_secretariat) {
    return a.divisional_secretariat.localeCompare(b.divisional_secretariat);
  }
  return a.grama_niladhari_division.localeCompare(b.grama_niladhari_division);
});

// Write JSON file
fs.writeFileSync(outputJson, JSON.stringify(allData, null, 2), 'utf-8');
console.log(`\nJSON file written: ${outputJson}`);

// Generate SQL file
let sql = `-- =====================================================
-- Grama Niladhari Divisions Data Migration
-- Generated from CSV files in GN CSV Folder
-- Total records: ${allData.length}
-- Generated: ${new Date().toISOString()}
-- =====================================================

-- Delete existing data
DELETE FROM administrative_divisions;

-- Insert Grama Niladhari Divisions data
INSERT INTO administrative_divisions (district, divisional_secretariat, grama_niladhari_division, gn_code)
VALUES
`;

// Generate INSERT statements
const sqlValues = allData.map((record, index) => {
  const district = record.district.replace(/'/g, "''");
  const divSec = record.divisional_secretariat.replace(/'/g, "''");
  const gnDiv = record.grama_niladhari_division.replace(/'/g, "''");
  const gnCode = record.gn_code ? `'${record.gn_code.replace(/'/g, "''")}'` : 'NULL';
  
  const comma = index < allData.length - 1 ? ',' : ';';
  return `('${district}', '${divSec}', '${gnDiv}', ${gnCode})${comma}`;
});

sql += sqlValues.join('\n');

sql += `\n\n-- Verify insertion
SELECT COUNT(*) as total_records FROM administrative_divisions;
SELECT district, COUNT(*) as count FROM administrative_divisions GROUP BY district ORDER BY district;
`;

fs.writeFileSync(outputSql, sql, 'utf-8');
console.log(`SQL file written: ${outputSql}`);

// Print summary by district
const districtCounts = {};
allData.forEach(record => {
  districtCounts[record.district] = (districtCounts[record.district] || 0) + 1;
});

console.log('\nSummary by District:');
Object.entries(districtCounts)
  .sort((a, b) => a[0].localeCompare(b[0]))
  .forEach(([district, count]) => {
    console.log(`  ${district}: ${count} GN divisions`);
  });

console.log('\nConversion complete!');

