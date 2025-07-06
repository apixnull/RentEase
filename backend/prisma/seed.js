import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const landlordId = '2809801e-b99e-4939-8d69-7436c1ceffbc';

  // Property 1
  const property1 = await prisma.property.create({
    data: {
      title: 'Cozy Apartment in Makati',
      description: 'Perfect for working professionals.',
      ownerId: landlordId,
      type: 'APARTMENT',
      street: '123 Ayala Ave',
      barangay: 'Bel-Air',
      municipality: 'Makati',
      city: 'Metro Manila',
      province: 'NCR',
      zipCode: '1209',
      isListed: true,
      Unit: {
        create: [
          {
            label: 'Unit A1',
            description: '1-bedroom unit with balcony',
            pricePerUnit: 18000,
            maxOccupancy: 2,
            UnitPhoto: {
              create: {
                url: 'https://picsum.photos/seed/unitA1/600/400',
              },
            },
          },
          {
            label: 'Unit A2',
            description: 'Studio with kitchen',
            pricePerUnit: 15000,
            maxOccupancy: 1,
            UnitPhoto: {
              create: {
                url: 'https://picsum.photos/seed/unitA2/600/400',
              },
            },
          },
        ],
      },
      PropertyPhoto: {
        create: [
          { url: 'https://picsum.photos/seed/property1a/800/500' },
          { url: 'https://picsum.photos/seed/property1b/800/500' },
        ],
      },
    },
  });

  // Property 2
  const property2 = await prisma.property.create({
    data: {
      title: 'Spacious Condo in Cebu',
      description: 'Great for families or students.',
      ownerId: landlordId,
      type: 'CONDOMINIUM',
      street: '456 Mango Ave',
      barangay: 'Capitol Site',
      municipality: 'Cebu City',
      city: 'Cebu',
      province: 'Cebu',
      zipCode: '6000',
      isListed: true,
      Unit: {
        create: [
          {
            label: 'Unit B1',
            description: '2-bedroom with city view',
            pricePerUnit: 25000,
            maxOccupancy: 4,
            UnitPhoto: {
              create: {
                url: 'https://picsum.photos/seed/unitB1/600/400',
              },
            },
          },
          {
            label: 'Unit B2',
            description: '1-bedroom corner unit',
            pricePerUnit: 20000,
            maxOccupancy: 2,
            UnitPhoto: {
              create: {
                url: 'https://picsum.photos/seed/unitB2/600/400',
              },
            },
          },
        ],
      },
      PropertyPhoto: {
        create: [
          { url: 'https://picsum.photos/seed/property2a/800/500' },
          { url: 'https://picsum.photos/seed/property2b/800/500' },
        ],
      },
    },
  });

  console.log('✅ Seeded Properties:', property1.title, property2.title);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
