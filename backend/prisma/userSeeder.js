import prisma from "../src/libs/prismaClient.js";
import bcrypt from "bcrypt";

// ============================================================================
// CONFIGURATION: Avatar URLs (randomly selected for each user)
// ============================================================================
const AVATAR_URLS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400",
  "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400",
  // Add more avatar URLs here
];

// ============================================================================
// CONFIGURATION: Sample bios (randomly selected for each user)
// ============================================================================
const SAMPLE_BIOS = [
  "Love exploring new places and meeting new people.",
  "Passionate about finding the perfect home.",
  "Student looking for affordable and comfortable living space.",
  "Professional seeking a peaceful place to call home.",
  "Travel enthusiast and adventure seeker.",
  "Working professional who values comfort and convenience.",
  "Looking for a cozy place to start my new chapter.",
  "Love cooking and need a space with a good kitchen.",
  "Pet lover seeking a pet-friendly environment.",
  "Quiet person who enjoys reading and peaceful surroundings.",
  "Active lifestyle, looking for a place near gyms and parks.",
  "Remote worker needing a comfortable workspace.",
  "Family-oriented person seeking a safe neighborhood.",
  "Artist looking for a creative and inspiring space.",
  "Nature lover who enjoys outdoor activities.",
  // Add more bios here
];

// ============================================================================

// Sample first names
const firstNames = [
  "Maria", "Juan", "Jose", "Ana", "Carlos", "Rosa", "Pedro", "Carmen",
  "Miguel", "Elena", "Francisco", "Isabel", "Antonio", "Patricia", "Manuel", "Laura",
  "Ricardo", "Sofia", "Roberto", "Andrea", "Fernando", "Monica", "Luis", "Gabriela",
  "Jorge", "Valeria", "Daniel", "Natalia", "Alejandro", "Camila", "Andres", "Mariana",
  "Sergio", "Daniela", "Rafael", "Alejandra", "Eduardo", "Paola", "Alberto", "Diana",
  "Diego", "Carolina", "Oscar", "Juliana", "Victor", "Catalina", "Hector", "Valentina",
  "Raul", "Isabella", "Javier", "Fernanda", "Mario", "Lucia", "Enrique", "Adriana",
  "Felipe", "Stephanie", "Gustavo", "Michelle", "Rodrigo", "Angela", "Pablo", "Cristina",
  "Sebastian", "Vanessa", "Ignacio", "Melissa", "Emilio", "Brenda", "Arturo", "Claudia",
  "Cesar", "Diana", "Alfredo", "Liliana", "Ruben", "Gloria", "Adrian", "Rocio",
  "Gerardo", "Teresa", "Hugo", "Silvia", "Ivan", "Martha", "Leonardo", "Beatriz",
  "Esteban", "Guadalupe", "Julio", "Esperanza", "Nicolas", "Dolores", "Agustin", "Consuelo"
];

// Sample last names
const lastNames = [
  "Garcia", "Rodriguez", "Lopez", "Martinez", "Gonzalez", "Perez", "Sanchez", "Ramirez",
  "Torres", "Flores", "Rivera", "Gomez", "Diaz", "Cruz", "Morales", "Ortiz",
  "Gutierrez", "Chavez", "Ramos", "Reyes", "Mendoza", "Vargas", "Castillo", "Jimenez",
  "Moreno", "Herrera", "Medina", "Aguilar", "Castro", "Fernandez", "Vasquez", "Romero",
  "Alvarez", "Mendez", "Guerrero", "Sandoval", "Rojas", "Contreras", "Luna", "Delgado",
  "Pena", "Vega", "Ortega", "Silva", "Navarro", "Cortes", "Dominguez", "Marquez",
  "Soto", "Hernandez", "Valdez", "Campos", "Santiago", "Villanueva", "Fuentes", "Espinoza"
];

// Generate random date within a specific month (not in the future)
function getRandomDateInMonth(year, month) {
  const now = new Date();
  const startDate = new Date(year, month, 1); // First day of month
  
  // If current month, use current date as end; otherwise use last day of month
  let endDate;
  if (year === now.getFullYear() && month === now.getMonth()) {
    endDate = now; // Current date
  } else {
    endDate = new Date(year, month + 1, 0, 23, 59, 59); // Last day of month
  }
  
  const startTime = startDate.getTime();
  const endTime = endDate.getTime();
  const randomTime = startTime + Math.random() * (endTime - startTime);
  
  return new Date(randomTime);
}

// Generate random birthdate (age between 18 and 65)
function generateBirthdate() {
  const currentYear = new Date().getFullYear();
  const minAge = 18;
  const maxAge = 65;
  const birthYear = currentYear - minAge - Math.floor(Math.random() * (maxAge - minAge + 1));
  const birthMonth = Math.floor(Math.random() * 12);
  const daysInMonth = new Date(birthYear, birthMonth + 1, 0).getDate();
  const birthDay = Math.floor(Math.random() * daysInMonth) + 1;
  
  return new Date(birthYear, birthMonth, birthDay);
}

// Generate random gender
function generateGender() {
  const genders = ["Male", "Female", "Other"];
  return genders[Math.floor(Math.random() * genders.length)];
}

// Generate random email
function generateEmail(firstName, lastName, index) {
  const domains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "email.com"];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const randomNum = Math.floor(Math.random() * 9999);
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomNum}@${domain}`;
}

// Generate random phone number (Philippines format)
function generatePhoneNumber() {
  const areaCodes = ["02", "032", "033", "034", "035", "036", "037", "038", "042", "043", "044", "045", "046", "047", "048", "049", "052", "053", "054", "055", "056", "062", "063", "064", "065", "068", "072", "074", "075", "076", "077", "078", "082", "083", "084", "085", "086", "087", "088"];
  const areaCode = areaCodes[Math.floor(Math.random() * areaCodes.length)];
  const number = Math.floor(1000000 + Math.random() * 9000000);
  return `${areaCode}${number}`;
}

// Generate random avatar URL
function generateAvatarUrl() {
  if (AVATAR_URLS.length === 0) return null;
  return AVATAR_URLS[Math.floor(Math.random() * AVATAR_URLS.length)];
}

// Generate random bio
function generateBio() {
  if (SAMPLE_BIOS.length === 0) return null;
  // 70% chance of having a bio
  if (Math.random() < 0.7) {
    return SAMPLE_BIOS[Math.floor(Math.random() * SAMPLE_BIOS.length)];
  }
  return null;
}

// Generate random IP address
function generateIpAddress() {
  return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

// Generate random user agent
function generateUserAgent() {
  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
  ];
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

async function main() {
  console.log("🌱 Starting user seeding...");
  console.log("📊 Creating 30 users in 2025, distributed across all months (Jan-Dec)...");

  const defaultPassword = "@Apix12345";
  const passwordHash = await bcrypt.hash(defaultPassword, 10);
  const now = new Date();
  const year = 2025;
  const totalUsers = 30;

  // Allocate users across months: at least 1 per month (12 users), remaining 18 distributed
  const monthAllocations = new Array(12).fill(1); // Start with 1 user per month
  const remainingUsers = totalUsers - 12; // 18 remaining users
  
  // Distribute remaining users randomly across months
  for (let i = 0; i < remainingUsers; i++) {
    const randomMonth = Math.floor(Math.random() * 12);
    monthAllocations[randomMonth]++;
  }

  console.log("\n📅 User allocation by month:");
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  monthAllocations.forEach((count, month) => {
    console.log(`   ${monthNames[month]}: ${count} user(s)`);
  });

  let userIndex = 0;
  let hasTodayUser = false; // Track if we've created a user with today's date
  let loginMonthCoverage = new Array(12).fill(false); // Track which months have login records
  let hasTodayLogin = false; // Track if we've created a login with today's date

  // Helper function to create a single user
  const createUser = async (month, useToday = false) => {
    // Generate random name
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const middleName = Math.random() > 0.7 ? firstNames[Math.floor(Math.random() * firstNames.length)] : null;
    
    // Generate unique email
    let email = generateEmail(firstName, lastName, userIndex);
    let emailExists = true;
    let attempts = 0;
    
    // Ensure email is unique
    while (emailExists && attempts < 10) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (!existing) {
        emailExists = false;
      } else {
        email = generateEmail(firstName, lastName, userIndex + attempts);
        attempts++;
      }
    }

    // Random role (60% TENANT, 40% LANDLORD)
    const role = Math.random() < 0.6 ? "TENANT" : "LANDLORD";
    
    // Random verification status (80% verified)
    const isVerified = Math.random() < 0.8;
    
    // Random disabled status (5% disabled)
    const isDisabled = Math.random() < 0.05;
    
    // Generate date: use today if requested and not already used, otherwise random date in month
    let createdAt;
    if (useToday && !hasTodayUser && year === now.getFullYear() && month === now.getMonth()) {
      createdAt = new Date(now); // Use today's date
      hasTodayUser = true;
    } else {
      createdAt = getRandomDateInMonth(year, month);
    }
    
    // Random last login (if verified, 70% chance of having logged in)
    let lastLogin = null;
    if (isVerified && Math.random() < 0.7) {
      // Last login should be after creation date but before now
      const daysSinceCreation = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
      if (daysSinceCreation > 0) {
        const loginDaysAgo = Math.floor(Math.random() * Math.min(daysSinceCreation, 30));
        lastLogin = new Date(createdAt);
        lastLogin.setDate(lastLogin.getDate() + loginDaysAgo);
      }
    }

    // Generate birthdate and gender
    const birthdate = generateBirthdate();
    const gender = generateGender();
    const avatarUrl = generateAvatarUrl();
    const bio = generateBio();

    try {
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          role,
          firstName,
          middleName,
          lastName,
          birthdate,
          gender,
          avatarUrl,
          bio,
          phoneNumber: Math.random() > 0.3 ? generatePhoneNumber() : null,
          isVerified,
          isDisabled,
          createdAt,
          lastLogin,
          hasSeenOnboarding: true,
        },
      });

      // Create login records for this user (only for 2025, distributed across all months)
      if (isVerified && lastLogin && year === 2025) {
        // Determine the range of months from user creation to last login
        const userCreationMonth = createdAt.getMonth();
        const lastLoginMonth = lastLogin.getMonth();
        const currentMonth = now.getMonth();
        const endMonth = year === now.getFullYear() ? currentMonth : lastLoginMonth;
        
        // Calculate number of months to cover
        const monthsToCover = [];
        for (let m = userCreationMonth; m <= endMonth; m++) {
          monthsToCover.push(m);
        }
        
        // If user spans across year boundary, handle it
        if (userCreationMonth > endMonth) {
          for (let m = userCreationMonth; m < 12; m++) {
            monthsToCover.push(m);
          }
          for (let m = 0; m <= endMonth; m++) {
            monthsToCover.push(m);
          }
        }
        
        // Allocate logins: at least 1 per month in the range, remaining distributed
        const numLogins = Math.floor(Math.random() * 15) + 5; // 5-20 logins total
        const loginMonthAllocations = new Array(12).fill(0);
        
        // Ensure at least 1 login per month in the covered range
        const minLoginsPerMonth = Math.min(1, Math.floor(numLogins / monthsToCover.length));
        monthsToCover.forEach(month => {
          loginMonthAllocations[month] = minLoginsPerMonth;
        });
        
        // Distribute remaining logins randomly across covered months
        const allocatedSoFar = minLoginsPerMonth * monthsToCover.length;
        const remainingLogins = numLogins - allocatedSoFar;
        for (let i = 0; i < remainingLogins; i++) {
          const randomMonth = monthsToCover[Math.floor(Math.random() * monthsToCover.length)];
          loginMonthAllocations[randomMonth]++;
        }
        
        const loginRecords = [];
        
        // Create login records for each month
        for (let loginMonth = 0; loginMonth < 12; loginMonth++) {
          const loginsInMonth = loginMonthAllocations[loginMonth];
          
          if (loginsInMonth === 0) continue; // Skip months with no logins
          
          // Ensure login month is within valid range (after creation, before/at lastLogin)
          const monthStart = new Date(year, loginMonth, 1);
          const monthEnd = new Date(year, loginMonth + 1, 0, 23, 59, 59);
          const actualMonthEnd = (year === now.getFullYear() && loginMonth === now.getMonth()) 
            ? now 
            : (monthEnd > lastLogin ? lastLogin : monthEnd);
          
          if (monthStart < createdAt || actualMonthEnd < createdAt) continue;
          
          for (let loginIndex = 0; loginIndex < loginsInMonth; loginIndex++) {
            let loggedInAt;
            
            // Use today's date for the last login in the current month (if we're in 2025 and current month)
            if (loginIndex === loginsInMonth - 1 && 
                !hasTodayLogin && 
                year === now.getFullYear() && 
                loginMonth === now.getMonth()) {
              loggedInAt = new Date(now);
              hasTodayLogin = true;
            } else {
              // Generate random date within the month, but after user creation
              const startTime = Math.max(monthStart.getTime(), createdAt.getTime());
              const endTime = actualMonthEnd.getTime();
              const randomTime = startTime + Math.random() * (endTime - startTime);
              loggedInAt = new Date(randomTime);
            }
            
            // Ensure loggedInAt is not in the future and is after user creation
            if (loggedInAt <= now && loggedInAt >= createdAt && loggedInAt <= lastLogin) {
              loginRecords.push({
                userId: user.id,
                ipAddress: generateIpAddress(),
                userAgent: generateUserAgent(),
                loggedInAt,
              });
              // Mark this month as having login records
              loginMonthCoverage[loginMonth] = true;
            }
          }
        }

        // Create login records in batch
        if (loginRecords.length > 0) {
          await prisma.userLogin.createMany({
            data: loginRecords,
          });
        }
      }

      userIndex++;
      return true;
    } catch (error) {
      console.error(`❌ Error creating user (${email}):`, error.message);
      return false;
    }
  };

  // Create users for each month
  for (let month = 0; month < 12; month++) {
    const count = monthAllocations[month];
    console.log(`\n📅 Creating ${count} user(s) for ${monthNames[month]} ${year}...`);
    
    for (let i = 0; i < count; i++) {
      // Use today's date for the last user in the current month (if we're in 2025 and current month)
      const useToday = (i === count - 1) && (year === now.getFullYear()) && (month === now.getMonth()) && !hasTodayUser;
      await createUser(month, useToday);
    }
  }

  // Count created users in 2025
  const createdCount2025 = await prisma.user.count({
    where: {
      createdAt: {
        gte: new Date(2025, 0, 1),
        lt: new Date(2026, 0, 1),
      },
    },
  });

  // Count login records in 2025
  const loginCount2025 = await prisma.userLogin.count({
    where: {
      loggedInAt: {
        gte: new Date(2025, 0, 1),
        lt: new Date(2026, 0, 1),
      },
    },
  });

  console.log(`\n✅ Successfully created ${createdCount2025} users in 2025!`);
  console.log(`✅ Successfully created ${loginCount2025} login records in 2025!`);
  
  // Show login record coverage by month
  console.log("\n📊 Login record coverage by month:");
  for (let month = 0; month < 12; month++) {
    const monthStart = new Date(2025, month, 1);
    const monthEnd = (year === now.getFullYear() && month === now.getMonth())
      ? now
      : new Date(2025, month + 1, 0, 23, 59, 59);
    
    const monthLoginCount = await prisma.userLogin.count({
      where: {
        loggedInAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    });
    const status = monthLoginCount > 0 ? "✅" : "❌";
    console.log(`   ${status} ${monthNames[month]}: ${monthLoginCount} login record(s)`);
  }
  
  console.log(`\n📝 Default password for all seeded users: ${defaultPassword}`);
  if (hasTodayLogin) {
    console.log(`📅 Latest login record: Today (${now.toLocaleDateString()})`);
  }
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