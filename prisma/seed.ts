import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create a test shelter with auth code
  const testShelter = await prisma.shelter.upsert({
    where: { code: 'CMB-CC-001' },
    update: {},
    create: {
      name: 'Colombo Central Community Center',
      code: 'CMB-CC-001',
      district: 'Colombo',
      address: '123 Main Street, Colombo 01',
      contactPerson: 'Test Coordinator',
      contactNumber: '0112345678',
      capacity: 200,
      currentCount: 0,
      isActive: true,
    },
  });

  console.log('✓ Created test shelter:', testShelter.code);

  // Create auth code for test shelter (hashed)
  const hashedCode = await bcrypt.hash('TEST123', 10);
  await prisma.shelterAuth.upsert({
    where: { shelterId: testShelter.id },
    update: {
      accessCode: hashedCode,
    },
    create: {
      shelterId: testShelter.id,
      accessCode: hashedCode,
    },
  });

  console.log('✓ Created shelter auth (code: TEST123)');

  // Create initial statistics record
  await prisma.statistics.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      totalPersons: 0,
      totalShelters: 1,
      activeShelters: 1,
      totalMissing: 0,
      totalMatches: 0,
      byDistrict: {},
    },
  });

  console.log('✓ Created statistics record');

  console.log('\n✅ Database seeded successfully!');
  console.log('\n📝 Test Credentials:');
  console.log('   Shelter Code: CMB-CC-001');
  console.log('   Access Code: TEST123');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
