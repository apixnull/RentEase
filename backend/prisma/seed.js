// prisma/seed.js
import { PrismaClient, Role, PropertyType, UnitStatus, PriorityLevel, RequestStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Use the existing landlord user ID directly
  const userId = "d3399287-91c8-4085-a0f2-b75a2f3bdad8";

  // Master list of amenities
  const amenityNames = [
    "WiFi",
    "Parking",
    "Laundry",
    "Swimming Pool",
    "Gym",
    "Pet-friendly",
    "Gated Community",
    "Furnished"
  ];

  // Upsert amenities
  const amenities = await Promise.all(
    amenityNames.map(name =>
      prisma.amenity.upsert({
        where: { name },
        update: {},
        create: { name }
      })
    )
  );

  // Image URLs for properties and units
  const propertyImages = {
    CONDOMINIUM: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
    APARTMENT:   "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
    HOUSE:       "https://images.unsplash.com/photo-1572120360610-d971b9d7767c",
    STUDIO:      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
  };
  const unitImages = [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
  ];

  const propertyTypes = [PropertyType.CONDOMINIUM, PropertyType.APARTMENT, PropertyType.HOUSE, PropertyType.STUDIO];
  const cities = ["Metro Manila", "Batangas", "Rizal", "Cavite"];
  const barangays = [
    "Barangay Fort Bonifacio",
    "Barangay San Antonio",
    "Barangay University Belt",
    "Barangay Matabungkay"
  ];

  for (let i = 1; i <= 20; i++) {
    const type = propertyTypes[i % propertyTypes.length];
    const city = cities[i % cities.length];
    const barangay = barangays[i % barangays.length];

    // Create property with 5 photos
    const property = await prisma.property.create({
      data: {
        title: `Property ${i} - ${type}`,
        description: `Description for Property ${i}, a beautiful ${type.toLowerCase()}`,
        ownerId: userId,
        type,
        street: `${100 + i} Main St`,
        barangay,
        municipality: "Sample Municipality",
        city,
        province: city === "Metro Manila" ? "NCR" : "Calabarzon",
        zipCode: "1000",
        requiresScreening: Math.random() > 0.5,
        isListed: true,
        PropertyPhoto: {
          create: Array.from({ length: 5 }).map(() => ({ url: propertyImages[type] }))
        }
      }
    });

    // Assign random amenities to property
    const selectedAmenities = amenities.filter(() => Math.random() > 0.5);
    await Promise.all(selectedAmenities.map(am =>
      prisma.propertyAmenity.create({ data: { propertyId: property.id, amenityId: am.id } })
    ));

    // Create units with 2 photos and maintenance
    const unitCount = Math.floor(Math.random() * 20) + 1;
    for (let u = 1; u <= unitCount; u++) {
      const chargePerHead = Math.random() > 0.6;
      const unit = await prisma.unit.create({
        data: {
          propertyId: property.id,
          label: `Unit ${u}`,
          description: `Spacious layout for Unit ${u}`,
          status: UnitStatus[Object.keys(UnitStatus)[Math.floor(Math.random() * Object.keys(UnitStatus).length)]],
          maxOccupancy: Math.floor(Math.random() * 5) + 1,
          chargePerHead,
          pricePerHead: chargePerHead ? Math.floor(Math.random() * 3000) + 2000 : null,
          pricePerUnit: !chargePerHead ? Math.floor(Math.random() * 10000) + 8000 : null,
          isNegotiable: Math.random() > 0.5,
          UnitPhoto: { create: unitImages.map(url => ({ url })) }
        }
      });

      // 1-2 maintenance requests
      const requestCount = Math.floor(Math.random() * 2) + 1;
      await Promise.all(
        Array.from({ length: requestCount }).map((_, r) =>
          prisma.maintenanceRequest.create({
            data: {
              propertyId: property.id,
              unitId: unit.id,
              reporterId: userId,
              description: `Maintenance issue #${r + 1} for Unit ${u}`,
              priority: PriorityLevel.MEDIUM,
              status: RequestStatus.OPEN
            }
          })
        )
      );
    }

    // Income and expenses
    const incomeCount = Math.floor(Math.random() * 2) + 1;
    await Promise.all(
      Array.from({ length: incomeCount }).map((_, j) =>
        prisma.income.create({ data: { propertyId: property.id, amount: Math.floor(Math.random() * 5000) + 2000, description: `Rent income #${j + 1}` } })
      )
    );

    const expenseCount = Math.floor(Math.random() * 2) + 1;
    await Promise.all(
      Array.from({ length: expenseCount }).map((_, k) =>
        prisma.expense.create({ data: { propertyId: property.id, amount: Math.floor(Math.random() * 3000) + 1000, description: `Expense #${k + 1}` } })
      )
    );
  }
}

main()
  .catch(e => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
