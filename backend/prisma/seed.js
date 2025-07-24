// prisma/seed.js
import {
  PrismaClient,
  PropertyType,
  UnitStatus,
  ApplicationStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const userId = "233ea753-3ab7-4474-81ef-3c0c25dc55bc";
  const sharedImage =
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80";

  const propertyTypes = [
    PropertyType.APARTMENT,
    PropertyType.CONDOMINIUM,
    PropertyType.BOARDING_HOUSE,
  ];

  const cities = ["Metro Manila", "Batangas", "Rizal", "Cavite"];
  const barangays = [
    "Barangay Fort Bonifacio",
    "Barangay San Antonio",
    "Barangay University Belt",
    "Barangay Matabungkay",
  ];

  const amenityTagsPool = [
    "near school",
    "near market",
    "with parking",
    "public transport accessible",
    "guarded gate",
    "flood-free",
    "quiet neighborhood",
  ];

  const propertySharedFeaturesPool = [
    "kitchen",
    "living room",
    "laundry area",
    "dining area",
    "bathroom",
    "parking",
    "wifi piso net",
  ];

  const propertyRulesPool = [
    "No pets allowed",
    "No smoking inside the unit",
    "Quiet hours from 10PM to 7AM",
    "Visitors allowed until 10PM only",
    "No overnight guests",
    "Cooking allowed in designated kitchen areas",
    "Keep shared areas clean",
    "Report maintenance issues within 24 hours",
  ];

  const unitFeatureTagsPool = [
    "Electric Fan",
    "Air Conditioning",
    "Mini Fridge",
    "Ceiling Fan",
    "Own Bathroom",
    "Rice Cooker",
    "5 Beds",
    "With Balcony",
  ];

  const leaseRulesPool = [
    "Deposit of 500 required",
    "No pets allowed",
    "Minimum lease duration: 6 months (Long-term only) and must pay in advance",
    "Smoking prohibited inside the unit",
    "Rent payable monthly in advance",
  ];

  const properties = [];

  for (let i = 1; i <= 12; i++) {
    const type = propertyTypes[i % propertyTypes.length];
    const city = cities[i % cities.length];
    const barangay = barangays[i % barangays.length];

    const propertyImages = Array.from({ length: 5 }).map(() => sharedImage);
    const mainImageUrl = propertyImages[0];

    // Randomly select some tags and rules
    const selectedAmenityTags = amenityTagsPool.filter(() => Math.random() > 0.5);
    const selectedPropertySharedFeatures = propertySharedFeaturesPool.filter(() => Math.random() > 0.5);
    const selectedPropertyRules = propertyRulesPool.filter(() => Math.random() > 0.5);

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
        mainImageUrl,
        propertyImageUrls: propertyImages,
        amenityTags: selectedAmenityTags,
        propertySharedFeatures: selectedPropertySharedFeatures,
        propertyRules: selectedPropertyRules,
      },
    });

    properties.push(property);

    // Units
    const unitCount = Math.floor(Math.random() * 11) + 10; // 10-20 units
    for (let u = 1; u <= unitCount; u++) {
      // Select random features and lease rules for unit
      const selectedUnitFeatureTags = unitFeatureTagsPool.filter(() => Math.random() > 0.5);
      const selectedLeaseRules = leaseRulesPool.filter(() => Math.random() > 0.5);

      await prisma.unit.create({
        data: {
          propertyId: property.id,
          label: `Unit ${u}`,
          description: `Spacious layout for Unit ${u}`,
          status:
            UnitStatus[
              Object.keys(UnitStatus)[
                Math.floor(Math.random() * Object.keys(UnitStatus).length)
              ]
            ],
          maxOccupancy: Math.floor(Math.random() * 5) + 1,
          unitFeatureTags: selectedUnitFeatureTags,
          unitImageUrls: Array.from({ length: 3 }).map(() => sharedImage),
          targetPrice: Math.floor(Math.random() * 15000) + 5000,
          isNegotiable: Math.random() > 0.5,
          leaseRules: selectedLeaseRules,
        },
      });
    }
  }

  // Applications for first property
  const tenantApplications = [
    {
      tenantId: "c7570364-14a0-41ce-8734-bd7f055ead7e",
      fullName: "Alice Johnson",
      contactEmail: "alice@example.com",
      contactPhone: "09171234567",
      contactFacebook: "https://facebook.com/alicejohnson",
      contactMessenger: "https://m.me/alicejohnson",
      occupants: 2,
      moveInDate: new Date("2025-09-01"),
      lengthOfStay: "1 year",
      message: "Looking forward to staying in your property.",
      questions: JSON.stringify(["Is the lease renewable?", "Are pets allowed?"]),
      status: ApplicationStatus.PENDING,
      propertyId: properties[0].id,
      unitId: null,
    },
    {
      tenantId: "dbfd6e54-38fe-4b69-9d48-37dbcc5e0947",
      fullName: "Bob Smith",
      contactEmail: "bob@example.com",
      contactPhone: "09179876543",
      contactFacebook: "https://facebook.com/bobsmith",
      contactMessenger: "https://m.me/bobsmith",
      occupants: 1,
      moveInDate: new Date("2025-10-15"),
      lengthOfStay: "6 months",
      message: "Please consider my application.",
      questions: JSON.stringify(["Is parking available?", "Is there 24/7 security?"]),
      status: ApplicationStatus.PENDING,
      propertyId: properties[0].id,
      unitId: null,
    },
  ];

  for (const app of tenantApplications) {
    await prisma.application.create({ data: app });
  }
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
