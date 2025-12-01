import prisma from "../src/libs/prismaClient.js";
import bcrypt from "bcrypt";

// ============================================================================
// CONFIGURATION: Paste user email here
// ============================================================================
const USER_EMAIL = "jaspercesa20@gmail.com";

// ============================================================================
// CONFIGURATION: Property main images (randomly selected)
// ============================================================================
const PROPERTY_MAIN_IMAGES = [
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
  // Add more image URLs here
];

// ============================================================================
// CONFIGURATION: Unit main images (randomly selected)
// ============================================================================
const UNIT_MAIN_IMAGES = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
  "https://images.unsplash.com/photo-1502672260256-1c3ef4d1e922?w=800",
  "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
  "https://images.unsplash.com/photo-1556912172-45b7abe8b7e4?w=800",
  // Add more image URLs here
];

// ============================================================================
// CONFIGURATION: Unit other images (randomly selected, up to 6 images per unit)
// ============================================================================
const UNIT_OTHER_IMAGES = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
  "https://images.unsplash.com/photo-1502672260256-1c3ef4d1e922?w=800",
  "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
  "https://images.unsplash.com/photo-1556912172-45b7abe8b7e4?w=800",
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
  // Add more image URLs here (will randomly select 3-6 images per unit)
];

// ============================================================================

// Sample property titles
const propertyTitles = [
  "Sunset Apartments",
  "Garden Heights Residences",
  "Metro View Condominium",
  "Riverside Boarding House",
  "Parkview Apartments",
  "City Center Residences",
  "Green Valley Condominium",
  "Ocean Breeze Apartments",
];

// Sample property types
const propertyTypes = ["APARTMENT", "CONDOMINUIM", "BOARDING_HOUSE", "SINGLE_HOUSE"];

// Sample streets in Cebu
const streets = [
  "Colon Street",
  "Osmeña Boulevard",
  "Gorordo Avenue",
  "Escario Street",
  "Lahug Street",
  "Banilad Road",
  "Mango Avenue",
  "Fuente Circle",
  "Jones Avenue",
  "Ramos Street",
];

// Sample barangays in Cebu
const barangays = [
  "Lahug",
  "Capitol Site",
  "Kamputhaw",
  "Cebu Business Park",
  "Banilad",
  "Talamban",
  "Apas",
  "Busay",
  "Kasambagan",
  "Guadalupe",
];

// Sample zip codes
const zipCodes = ["6000", "6001", "6002", "6003", "6004"];

// Helper function to get random item from array
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Sample unit descriptions
const unitDescriptions = [
  "Spacious and well-ventilated unit with modern amenities. Perfect for students or young professionals.",
  "Cozy unit with natural lighting and comfortable living space. Close to public transportation.",
  "Modern unit with updated fixtures and appliances. Ideal for small families or working professionals.",
  "Clean and well-maintained unit with basic amenities. Great location near schools and shopping centers.",
  "Comfortable unit with good ventilation and natural light. Peaceful neighborhood with easy access to city center.",
];

// Sample unit labels (6 labels for 6 units per property)
const unitLabels = ["A", "B", "C", "D", "E", "F"];

// Cebu City coordinates (approximate)
const CEBU_COORDINATES = {
  latitude: 10.3157,
  longitude: 123.8854,
};

// Generate random price between 5,000 and 50,000
function generatePrice() {
  return Math.floor(5000 + Math.random() * 45000);
}

// Generate random floor number (1-5)
function generateFloorNumber() {
  return Math.floor(Math.random() * 5) + 1;
}

// Generate random max occupancy (1-4)
function generateMaxOccupancy() {
  return Math.floor(Math.random() * 4) + 1;
}

async function main() {
  console.log("🌱 Starting property and unit seeding...");

  // Validate user email configuration
  if (!USER_EMAIL) {
    console.log("❌ Error: USER_EMAIL constant is empty or not defined.");
    console.log("   Please add a user email to the USER_EMAIL constant at the top of this file.");
    process.exit(1);
  }

  // Find or create LANDLORD user
  let landlord = await prisma.user.findUnique({
    where: { email: USER_EMAIL },
  });

  if (!landlord) {
    console.log(`❌ User with email "${USER_EMAIL}" not found.`);
    console.log(`📝 Creating new landlord user with email: ${USER_EMAIL}...`);
    const passwordHash = await bcrypt.hash("Password123!", 10);

    landlord = await prisma.user.create({
      data: {
        email: USER_EMAIL,
        passwordHash,
        role: "LANDLORD",
        firstName: "Juan",
        lastName: "Dela Cruz",
        isVerified: true,
        hasSeenOnboarding: true,
        birthdate: new Date(1980, 5, 15),
        gender: "Male",
        phoneNumber: "0321234567",
      },
    });
    console.log(`✅ Created landlord user: ${landlord.email}`);
  } else {
    if (landlord.role !== "LANDLORD") {
      console.log(`⚠️  User ${USER_EMAIL} exists but is not a LANDLORD. Updating role...`);
      landlord = await prisma.user.update({
        where: { id: landlord.id },
        data: { role: "LANDLORD" },
      });
    }
    console.log(`✅ Using existing user: ${landlord.email} (${landlord.firstName} ${landlord.lastName})`);
  }

  // Query cities and municipalities from database
  const cities = await prisma.city.findMany({
    orderBy: { name: "asc" },
  });

  const municipalities = await prisma.municipality.findMany({
    orderBy: { name: "asc" },
  });

  if (cities.length === 0 && municipalities.length === 0) {
    console.log("❌ Error: No cities or municipalities found in database.");
    console.log("   Please run the amenities/cities seeder first: npm run seed");
    process.exit(1);
  }

  // Query amenities from database
  const amenities = await prisma.amenity.findMany({
    orderBy: { name: "asc" },
  });

  if (amenities.length === 0) {
    console.log("⚠️  Warning: No amenities found in database. Units will be created without amenities.");
  } else {
    console.log(`✅ Found ${amenities.length} amenities in database`);
  }

  console.log(`\n🏢 Creating 1 property with 6 units...`);

  // Create 1 property
  for (let propIndex = 0; propIndex < 1; propIndex++) {
    const propertyTitle = propertyTitles[propIndex] || `Property ${propIndex + 1}`;
    const propertyType = propertyTypes[propIndex % propertyTypes.length];
    const street = getRandomItem(streets);
    const barangay = getRandomItem(barangays);
    const zipCode = getRandomItem(zipCodes);

    // Randomly select city or municipality
    let cityId = null;
    let municipalityId = null;
    
    if (cities.length > 0 && municipalities.length > 0) {
      // Randomly choose between city or municipality
      if (Math.random() < 0.5) {
        const selectedCity = getRandomItem(cities);
        cityId = selectedCity.id;
      } else {
        const selectedMunicipality = getRandomItem(municipalities);
        municipalityId = selectedMunicipality.id;
      }
    } else if (cities.length > 0) {
      const selectedCity = getRandomItem(cities);
      cityId = selectedCity.id;
    } else if (municipalities.length > 0) {
      const selectedMunicipality = getRandomItem(municipalities);
      municipalityId = selectedMunicipality.id;
    }

    // Generate random coordinates near Cebu City center
    const latitude = CEBU_COORDINATES.latitude + (Math.random() - 0.5) * 0.1;
    const longitude = CEBU_COORDINATES.longitude + (Math.random() - 0.5) * 0.1;

    // Randomly select property main image
    const mainImageUrl = getRandomItem(PROPERTY_MAIN_IMAGES);

    // Sample nearby institutions
    const nearInstitutions = [
      { name: "Ayala Center Cebu", type: "Commerce" },
      { name: "Cebu Doctors' University", type: "Education" },
      { name: "Cebu City Medical Center", type: "Healthcare" },
    ];

    // Sample other information
    const otherInformation = [
      {
        context: "Parking",
        description: "Free parking available for tenants",
      },
      {
        context: "Security",
        description: "24/7 security guard on duty",
      },
    ];

    try {
      const property = await prisma.property.create({
        data: {
          ownerId: landlord.id,
          title: propertyTitle,
          type: propertyType,
          street,
          barangay,
          zipCode,
          cityId,
          municipalityId,
          latitude,
          longitude,
          mainImageUrl,
          nearInstitutions,
          otherInformation,
        },
      });

      console.log(`\n✅ Created property: ${propertyTitle} (${propertyType}) for ${landlord.firstName} ${landlord.lastName}`);

      // Create 6 units for this property
      for (let unitIndex = 0; unitIndex < 6; unitIndex++) {
        const unitLabel = `Unit ${unitLabels[unitIndex] || unitIndex + 1}`;
        const description = unitDescriptions[unitIndex % unitDescriptions.length];
        const targetPrice = generatePrice();
        const floorNumber = generateFloorNumber();
        const maxOccupancy = generateMaxOccupancy();

        // Random unit condition (mostly GOOD)
        const conditions = ["GOOD", "GOOD", "GOOD", "UNDER_MAINTENANCE"];
        const unitCondition = conditions[Math.floor(Math.random() * conditions.length)];

        // Random screening requirement (30% require screening)
        const requiresScreening = Math.random() < 0.3;

        // Sample lease rules
        const unitLeaseRules = [
          { text: "No smoking inside", category: "general" },
          { text: "Quiet hours 10PM-6AM", category: "noise" },
          { text: "Keep common areas clean", category: "cleaning" },
        ];

        // Randomly select unit main image
        const unitMainImageUrl = getRandomItem(UNIT_MAIN_IMAGES);

        // Randomly select 3-6 other images for the unit (up to 6 images max)
        let otherImages = null;
        if (UNIT_OTHER_IMAGES.length > 0) {
          const numOtherImages = Math.floor(Math.random() * 4) + 3; // 3-6 images
          const shuffled = [...UNIT_OTHER_IMAGES].sort(() => 0.5 - Math.random());
          const selectedOtherImages = shuffled.slice(0, Math.min(numOtherImages, 6)); // Max 6 images
          otherImages = selectedOtherImages;
        }

        // Randomly select 3-6 amenities for the unit
        let selectedAmenities = [];
        if (amenities.length > 0) {
          const numAmenities = Math.floor(Math.random() * 4) + 3; // 3-6 amenities
          const shuffled = [...amenities].sort(() => 0.5 - Math.random());
          selectedAmenities = shuffled.slice(0, Math.min(numAmenities, amenities.length));
        }

        try {
          const unit = await prisma.unit.create({
            data: {
              propertyId: property.id,
              label: unitLabel,
              description,
              floorNumber,
              maxOccupancy,
              targetPrice,
              requiresScreening,
              unitCondition,
              unitLeaseRules,
              mainImageUrl: unitMainImageUrl,
              otherImages,
              amenities: selectedAmenities.length > 0
                ? { connect: selectedAmenities.map((a) => ({ id: a.id })) }
                : undefined,
            },
          });

          console.log(`   ✅ Created ${unitLabel} - ₱${targetPrice.toLocaleString()}/month`);
        } catch (error) {
          console.error(`   ❌ Error creating unit ${unitLabel}:`, error.message);
        }
      }
    } catch (error) {
      console.error(`❌ Error creating property ${propertyTitle}:`, error.message);
    }
  }

  // Summary
  console.log(`\n✅ Seeding completed!`);
  console.log(`📊 Summary:`);
  
  const propertyCount = await prisma.property.count({
    where: { ownerId: landlord.id },
  });

  const unitCount = await prisma.unit.count({
    where: {
      property: {
        ownerId: landlord.id,
      },
    },
  });

  console.log(`\n   Landlord: ${landlord.firstName} ${landlord.lastName} (${landlord.email})`);
  console.log(`      Properties: ${propertyCount}`);
  console.log(`      Units: ${unitCount}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seeding error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });

