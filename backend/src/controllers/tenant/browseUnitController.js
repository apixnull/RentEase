// ============================================================================
// CONTROLLER: Tenant Browse Units
// File: controllers/tenant/browseUnitController.js
// Description: Handles fetching visible listings for tenant browsing.
// ============================================================================

import prisma from "../../libs/prismaClient.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Fuse from "fuse.js";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.7,
  },
});

// Helper function for retry logic with exponential backoff
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runGeminiWithRetry(prompt, retries = 2) {
  let attempt = 0;
  while (attempt <= retries) {
    try {
      return await geminiModel.generateContent([{ text: prompt }]);
    } catch (error) {
      const message = error?.message || "";
      const status = error?.status || error?.response?.status;
      const overloaded = status === 503 || /503|overload/i.test(message);

      if (!overloaded || attempt === retries) {
        throw error;
      }

      const delay = 500 * Math.pow(2, attempt);
      console.warn(`⚠️ Gemini overloaded (attempt ${attempt + 1}). Retrying in ${delay}ms...`);
      await sleep(delay);
      attempt += 1;
    }
  }
}

const LOCATION_FUSE_OPTIONS = {
  keys: ["name"],
  threshold: 0.3,
  distance: 40,
  ignoreLocation: true,
};

const addTokenToMap = (map, token) => {
  if (!token) return;
  const normalized = token.trim();
  if (!normalized) return;
  const key = normalized.toLowerCase();
  if (!map.has(key)) {
    map.set(key, normalized);
  }
};

const findBestFuseMatch = (term, words, fuseInstance) => {
  if (!fuseInstance) return null;

  const evaluateResults = (results) => {
    if (!results || results.length === 0) return null;
    const [top] = results;
    if (typeof top.score === "number" && top.score <= 0.35) {
      return top.item;
    }
    return null;
  };

  const directMatch = evaluateResults(fuseInstance.search(term));
  if (directMatch) {
    return directMatch;
  }

  for (const word of words) {
    const match = evaluateResults(fuseInstance.search(word));
    if (match) {
      return match;
    }
  }

  return null;
};

const extractSearchTokens = async (rawTerm) => {
  const normalized = rawTerm.trim().replace(/\s+/g, " ");
  if (!normalized) {
    return {
      tokens: [],
      city: null,
      municipality: null,
    };
  }

  const words = normalized.split(/\s+/).filter(Boolean);

  const [cities, municipalities] = await Promise.all([
    prisma.city.findMany({ select: { id: true, name: true } }),
    prisma.municipality.findMany({ select: { id: true, name: true } }),
  ]);

  const cityFuse = new Fuse(cities, LOCATION_FUSE_OPTIONS);
  const municipalityFuse = new Fuse(municipalities, LOCATION_FUSE_OPTIONS);

  const detectedCity = findBestFuseMatch(normalized, words, cityFuse);
  const detectedMunicipality = findBestFuseMatch(normalized, words, municipalityFuse);

  const tokenMap = new Map();

  if (detectedCity) {
    addTokenToMap(tokenMap, detectedCity.name);
  }

  if (detectedMunicipality) {
    addTokenToMap(tokenMap, detectedMunicipality.name);
  }

  if (!detectedCity && !detectedMunicipality) {
    addTokenToMap(tokenMap, normalized);
  }

  for (const word of words) {
    addTokenToMap(tokenMap, word);
  }

  return {
    tokens: Array.from(tokenMap.values()),
    city: detectedCity,
    municipality: detectedMunicipality,
  };
};

// ============================================================================
// GET CITIES AND MUNICIPALITIES
// ============================================================================
export const getCitiesAndMunicipalities = async (req, res) => {
  try {
    const cities = await prisma.city.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    const municipalities = await prisma.municipality.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    return res.status(200).json({
      success: true,
      data: {
        cities,
        municipalities,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching cities/municipalities:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch cities/municipalities.",
    });
  }
};

// ============================================================================
// SEARCH LISTINGS (Server-side search with filters)
// ============================================================================
export const searchListings = async (req, res) => {
  try {
    const {
      search, // search query string
      city, // city name
      municipality, // municipality name
      minPrice, // minimum price
      maxPrice, // maximum price
      sortBy, // sort option: TOP_RATED, FEATURED, MOST_VIEWED, NEW
    } = req.query;

    // Build where clause
    const whereClause = {
      lifecycleStatus: "VISIBLE",
      expiresAt: { gte: new Date() },
      landlord: {
        isDisabled: false, // exclude listings from disabled landlords
      },
    };

    // Build unit filters
    const unitFilters = {};
    const propertyFilters = {};

    // Price range filter
    if (minPrice || maxPrice) {
      unitFilters.targetPrice = {};
      if (minPrice) {
        unitFilters.targetPrice.gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        unitFilters.targetPrice.lte = parseFloat(maxPrice);
      }
    }

    let extractedTokens = [];
    let inferredCity = null;
    let inferredMunicipality = null;

    if (search && search.trim() !== "") {
      const extraction = await extractSearchTokens(search);
      extractedTokens = extraction.tokens || [];
      inferredCity = extraction.city;
      inferredMunicipality = extraction.municipality;
    }

    const ensurePropertyOrArray = () => {
      if (!propertyFilters.OR) {
        propertyFilters.OR = [];
      }
    };

    const applyCityFilter = (cityInfo) => {
      if (!cityInfo) return;
      ensurePropertyOrArray();
      if (cityInfo.id) {
        propertyFilters.OR.push({ cityId: cityInfo.id });
      }
      propertyFilters.OR.push({
        city: { name: { contains: cityInfo.name, mode: "insensitive" } },
      });
    };

    const applyMunicipalityFilter = (municipalityInfo) => {
      if (!municipalityInfo) return;
      ensurePropertyOrArray();
      if (municipalityInfo.id) {
        propertyFilters.OR.push({ municipalityId: municipalityInfo.id });
      }
      propertyFilters.OR.push({
        municipality: {
          name: { contains: municipalityInfo.name, mode: "insensitive" },
        },
      });
    };

    if (city && city !== "ALL") {
      applyCityFilter({ id: null, name: city });
    } else if (inferredCity) {
      applyCityFilter(inferredCity);
    }

    if (municipality && municipality !== "ALL") {
      applyMunicipalityFilter({ id: null, name: municipality });
    } else if (inferredMunicipality) {
      applyMunicipalityFilter(inferredMunicipality);
    }

    if (extractedTokens.length > 0) {
      const uniqueTokens = Array.from(
        new Map(
          extractedTokens
            .map((token) => token && token.trim())
            .filter(Boolean)
            .map((token) => [token.toLowerCase(), token])
        ).values()
      );

      if (uniqueTokens.length > 0) {
        const searchConditions = [];

        uniqueTokens.forEach((token) => {
          searchConditions.push({ label: { contains: token, mode: "insensitive" } });
          searchConditions.push({ property: { title: { contains: token, mode: "insensitive" } } });
          searchConditions.push({ property: { street: { contains: token, mode: "insensitive" } } });
          searchConditions.push({ property: { barangay: { contains: token, mode: "insensitive" } } });
          searchConditions.push({ property: { city: { name: { contains: token, mode: "insensitive" } } } });
          searchConditions.push({ property: { municipality: { name: { contains: token, mode: "insensitive" } } } });
        });

        unitFilters.OR = searchConditions;
      }
    }

    // Combine all filters
    if (Object.keys(unitFilters).length > 0 || Object.keys(propertyFilters).length > 0) {
      whereClause.unit = {};
      
      if (Object.keys(unitFilters).length > 0) {
        Object.assign(whereClause.unit, unitFilters);
      }
      
      if (Object.keys(propertyFilters).length > 0) {
        whereClause.unit.property = propertyFilters;
      }
    }

    // Build orderBy based on sortBy
    let orderBy = [
      { isFeatured: "desc" }, // Featured always first
      { visibleAt: "desc" },
    ];

    // Fetch listings
    const listings = await prisma.listing.findMany({
      where: whereClause,
      select: {
        id: true,
        isFeatured: true,
        createdAt: true,
        visibleAt: true,
        unit: {
          select: {
            id: true,
            label: true,
            mainImageUrl: true,
            targetPrice: true,
            requiresScreening: true,
            property: {
              select: {
                id: true,
                title: true,
                type: true,
                street: true,
                barangay: true,
                zipCode: true,
                city: { select: { id: true, name: true } },
                municipality: { select: { id: true, name: true } },
              },
            },
            reviews: { select: { rating: true } },
          },
        },
      },
      orderBy,
    });

    // 🔹 Count views from UnitView table for all units
    const unitIds = listings.map(l => l.unit.id);
    const viewCounts = await prisma.unitView.groupBy({
      by: ['unitId'],
      where: {
        unitId: { in: unitIds },
      },
      _count: { id: true },
    });

    const viewCountMap = {};
    viewCounts.forEach((vc) => {
      viewCountMap[vc.unitId] = vc._count.id;
    });

    // Format & enrich results
    const formatted = listings.map((listing) => {
      const reviews = listing.unit.reviews || [];
      const totalReviews = reviews.length;
      const avgRating =
        totalReviews > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
          : null;

      return {
        id: listing.id,
        isFeatured: listing.isFeatured,
        createdAt: listing.createdAt,
        unit: {
          id: listing.unit.id,
          label: listing.unit.label,
          mainImageUrl: listing.unit.mainImageUrl,
          viewCount: viewCountMap[listing.unit.id] || 0, // ✅ count from UnitView table
          targetPrice: listing.unit.targetPrice,
          requiresScreening: listing.unit.requiresScreening,
          property: listing.unit.property,
          avgRating,
          totalReviews,
        },
      };
    });

    // Apply client-side sorting if needed (for complex sorts)
    // Featured is only a priority/boost, not a primary sort option
    let sortedResults = formatted;
    if (sortBy === "TOP_RATED") {
      sortedResults = [...formatted].sort((a, b) => {
        const ratingA = Math.round((a.unit.avgRating || 0) * 10) / 10; // Round to 1 decimal
        const ratingB = Math.round((b.unit.avgRating || 0) * 10) / 10;
        
        // Primary: Sort by rating (higher first)
        if (ratingA !== ratingB) {
          return ratingB - ratingA;
        }
        
        // Tie-breaker: If same rating (rounded), featured first
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        
        // Secondary tie-breaker: More reviews
        return b.unit.totalReviews - a.unit.totalReviews;
      });
    } else if (sortBy === "MOST_VIEWED") {
      sortedResults = [...formatted].sort((a, b) => {
        // Primary: Sort by view count (higher first)
        if (a.unit.viewCount !== b.unit.viewCount) {
          return b.unit.viewCount - a.unit.viewCount;
        }
        
        // Tie-breaker: If same views, featured first
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        
        return 0;
      });
    } else if (sortBy === "NEW") {
      sortedResults = [...formatted].sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        
        // Primary: Sort by date (newer first)
        if (dateA !== dateB) {
          return dateB - dateA;
        }
        
        // Tie-breaker: If same date, featured first
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        
        return 0;
      });
    }

    return res.status(200).json({
      success: true,
      data: sortedResults,
    });
  } catch (error) {
    console.error("❌ Error searching listings:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to search listings.",
    });
  }
};

// ============================================================================
// GET VISIBLE LISTINGS WITH SEARCH AND FILTERS
// ============================================================================
export const getVisibleListingsForTenant = async (req, res) => {
  try {
    // Extract query parameters
    const {
      search, // search query string
      city, // city name or id
      municipality, // municipality name or id
      minPrice, // minimum price
      maxPrice, // maximum price
    } = req.query;

    // Build where clause
    const whereClause = {
      lifecycleStatus: "VISIBLE",
      expiresAt: { gte: new Date() }, // not expired
      landlord: {
        isDisabled: false, // exclude listings from disabled landlords
      },
    };

    // Build unit filters
    const unitFilters = {};
    const propertyFilters = {};

    // Price range filter (applied to unit)
    if (minPrice || maxPrice) {
      unitFilters.targetPrice = {};
      if (minPrice) {
        unitFilters.targetPrice.gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        unitFilters.targetPrice.lte = parseFloat(maxPrice);
      }
    }

    // City filter (applied to property)
    if (city && city !== "ALL") {
      propertyFilters.OR = [
        { city: { name: { contains: city, mode: "insensitive" } } },
        { cityId: city },
      ];
    }

    // Municipality filter (applied to property)
    if (municipality && municipality !== "ALL") {
      if (propertyFilters.OR) {
        propertyFilters.OR.push(
          { municipality: { name: { contains: municipality, mode: "insensitive" } } },
          { municipalityId: municipality }
        );
      } else {
        propertyFilters.OR = [
          { municipality: { name: { contains: municipality, mode: "insensitive" } } },
          { municipalityId: municipality },
        ];
      }
    }

    // Search filter (searches in property title, unit label, street, barangay, city, municipality)
    if (search && search.trim() !== "") {
      const searchTerm = search.trim();
      const searchConditions = [];

      // Unit-level search
      searchConditions.push({ label: { contains: searchTerm, mode: "insensitive" } });

      // Property-level search
      searchConditions.push({ property: { title: { contains: searchTerm, mode: "insensitive" } } });
      searchConditions.push({ property: { street: { contains: searchTerm, mode: "insensitive" } } });
      searchConditions.push({ property: { barangay: { contains: searchTerm, mode: "insensitive" } } });
      searchConditions.push({ property: { city: { name: { contains: searchTerm, mode: "insensitive" } } } });
      searchConditions.push({ property: { municipality: { name: { contains: searchTerm, mode: "insensitive" } } } });

      unitFilters.OR = searchConditions;
    }

    // Combine all filters
    if (Object.keys(unitFilters).length > 0 || Object.keys(propertyFilters).length > 0) {
      whereClause.unit = {};
      
      // Add unit-level filters
      if (Object.keys(unitFilters).length > 0) {
        Object.assign(whereClause.unit, unitFilters);
      }
      
      // Add property-level filters
      if (Object.keys(propertyFilters).length > 0) {
        whereClause.unit.property = propertyFilters;
      }
    }

    const listings = await prisma.listing.findMany({
      where: whereClause,
      select: {
        // --- Listing fields ---
        id: true,
        isFeatured: true,
        createdAt: true,
        visibleAt: true,

        // --- Unit relation ---
        unit: {
          select: {
            id: true,
            label: true,
            mainImageUrl: true,
            targetPrice: true,
            requiresScreening: true,

            // --- Property relation ---
            property: {
              select: {
                id: true,
                title: true,
                type: true,
                street: true,
                barangay: true,
                zipCode: true,
                city: { select: { id: true, name: true } },
                municipality: { select: { id: true, name: true } },
              },
            },

            // --- Reviews ---
            reviews: { select: { rating: true } },
          },
        },
      },
      orderBy: [
        { isFeatured: "desc" }, // Featured listings first
        { visibleAt: "desc" }, // Then newest visible listings
      ],
    });

    // 🔹 Count views from UnitView table for all units
    const unitIds = listings.map(l => l.unit.id);
    const viewCounts = await prisma.unitView.groupBy({
      by: ['unitId'],
      where: {
        unitId: { in: unitIds },
      },
      _count: { id: true },
    });

    const viewCountMap = {};
    viewCounts.forEach((vc) => {
      viewCountMap[vc.unitId] = vc._count.id;
    });

    // ✅ Format & enrich results
    const formatted = listings.map((listing) => {
      const reviews = listing.unit.reviews || [];
      const totalReviews = reviews.length;
      const avgRating =
        totalReviews > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
          : null;

      return {
        id: listing.id,
        lifecycleStatus: listing.lifecycleStatus,
        isFeatured: listing.isFeatured,
        visibleAt: listing.visibleAt,
        createdAt: listing.createdAt,
        expiresAt: listing.expiresAt,
        unit: {
          id: listing.unit.id,
          label: listing.unit.label,
          mainImageUrl: listing.unit.mainImageUrl,
          viewCount: viewCountMap[listing.unit.id] || 0, // ✅ count from UnitView table
          targetPrice: listing.unit.targetPrice,
          requiresScreening: listing.unit.requiresScreening,
          property: listing.unit.property,
          avgRating,
          totalReviews,
        },
      };
    });

    return res.status(200).json({
      data: formatted,
    });
  } catch (error) {
    console.error("❌ Error fetching listings snapshot:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch listings snapshot.",
    });
  }
};

// ------------------------------------------------------------
// GET SPECIFIC LISTING (Tenant → Full Unit + Property Details)
// ------------------------------------------------------------
export const getSpecificListing = async (req, res) => {
  try {
    const { listingId } = req.params;

    const listing = await prisma.listing.findFirst({
      where: {
        id: listingId,
        lifecycleStatus: "VISIBLE",
        expiresAt: { gte: new Date() },
        landlord: {
          isDisabled: false, // exclude listings from disabled landlords
        },
      },
      select: {
        id: true,
        isFeatured: true,
        unit: {
          select: {
            id: true,
            propertyId: true,
            label: true,
            description: true,
            floorNumber: true,
            createdAt: true,
            maxOccupancy: true,
            amenities: true,
            mainImageUrl: true,
            otherImages: true,
            unitLeaseRules: true,
            targetPrice: true,
            requiresScreening: true,
            property: {
              select: {
                id: true,
                title: true,
                type: true,
                street: true,
                barangay: true,
                zipCode: true,
                latitude: true,
                longitude: true,
                mainImageUrl: true,
                nearInstitutions: true,
                otherInformation: true,
                city: { select: { id: true, name: true } },
                municipality: { select: { id: true, name: true } },
                owner: {
                  select: {
                    id: true,
                    firstName: true,
                    middleName: true,
                    lastName: true,
                    phoneNumber: true,
                    messengerUrl: true,
                    facebookUrl: true,
                    avatarUrl: true,
                    email: true,
                  },
                },
              },
            },
            reviews: {
              orderBy: { createdAt: "desc" },
              select: {
                id: true,
                rating: true,
                comment: true,
                createdAt: true,
                tenant: {
                  select: {
                    id: true,
                    firstName: true,
                    middleName: true,
                    lastName: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found or unavailable.",
      });
    }

    const reviews = listing.unit.reviews || [];
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : null;

    const totalReviews = reviews.length;

    // 🔹 Count views from UnitView table
    const viewCount = await prisma.unitView.count({
      where: { unitId: listing.unit.id },
    });

    const owner = listing.unit.property.owner;
    const landlord = owner
      ? {
          id: owner.id,
          fullName: `${owner.firstName || ""} ${owner.middleName || ""} ${owner.lastName || ""}`.trim(),
          avatarUrl: owner.avatarUrl,
          email: owner.email,
          contact: {
            phoneNumber: owner.phoneNumber,
            messengerUrl: owner.messengerUrl,
            facebookUrl: owner.facebookUrl,
            whatsappUrl: null,
          },
        }
      : null;

    const responseData = {
      id: listing.id,
      lifecycleStatus: listing.lifecycleStatus,
      isFeatured: listing.isFeatured,
      expiresAt: listing.expiresAt,
      unit: {
        id: listing.unit.id,
        propertyId: listing.unit.propertyId,
        label: listing.unit.label,
        description: listing.unit.description,
        floorNumber: listing.unit.floorNumber,
        createdAt: listing.unit.createdAt,
        maxOccupancy: listing.unit.maxOccupancy,
        amenities: listing.unit.amenities,
        mainImageUrl: listing.unit.mainImageUrl,
        otherImages: listing.unit.otherImages,
        unitLeaseRules: listing.unit.unitLeaseRules,
        viewCount: viewCount, // ✅ count from UnitView table
        targetPrice: listing.unit.targetPrice,
        requiresScreening: listing.unit.requiresScreening,
        avgRating,
        totalReviews,
        reviews: reviews.map((r) => {
          const fullName = `${r.tenant.firstName || ""} ${r.tenant.middleName || ""} ${r.tenant.lastName || ""}`.trim();
          return {
            id: r.id,
            rating: r.rating,
            comment: r.comment,
            createdAt: r.createdAt,
            tenant: {
              id: r.tenant.id,
              fullName: fullName || "Anonymous",
              avatarUrl: r.tenant.avatarUrl,
            },
          };
        }),
      },
      property: {
        id: listing.unit.property.id,
        title: listing.unit.property.title,
        type: listing.unit.property.type,
        street: listing.unit.property.street,
        barangay: listing.unit.property.barangay,
        zipCode: listing.unit.property.zipCode,
        latitude: listing.unit.property.latitude,
        longitude: listing.unit.property.longitude,
        mainImageUrl: listing.unit.property.mainImageUrl,
        nearInstitutions: listing.unit.property.nearInstitutions,
        otherInformation: listing.unit.property.otherInformation,
        city: listing.unit.property.city || null,
        municipality: listing.unit.property.municipality || null,
      },
      landlord,
    };

    return res.status(200).json({ data: responseData });
  } catch (error) {
    console.error("Error fetching detailed listing:", error);
    return res.status(500).json({
      message: "Failed to fetch detailed listing.",
    });
  }
};


// ============================================================================
// AI CHATBOT - Rental Inquiry Assistant
// ============================================================================
export const handleAIChatbotMessage = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    const { sortBy } = req.query; // Get sortBy from query parameters (frontend filter)

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required.",
      });
    }

    // Build conversation context
    const conversationContext = conversationHistory
      .map((msg) => `${msg.isUser ? "User" : "Assistant"}: ${msg.text}`)
      .join("\n");

    // Get all cities and municipalities in Cebu Province for filtering
    const cebuCities = await prisma.city.findMany({
      where: {
        name: {
          contains: "Cebu",
          mode: "insensitive",
        },
      },
      select: { id: true, name: true },
    });

    const cebuMunicipalities = await prisma.municipality.findMany({
      where: {
        name: {
          contains: "Cebu",
          mode: "insensitive",
        },
      },
      select: { id: true, name: true },
    });

    // Get all available amenities for reference
    const allAmenities = await prisma.amenity.findMany({
      select: { id: true, name: true, category: true },
      orderBy: { name: "asc" },
    });

    const amenityNames = allAmenities.map((a) => a.name.toLowerCase());

    // Create AI prompt - AI's role is ONLY to extract information, NOT to search
    const aiPrompt = `
You are a helpful rental assistant for RentEase. Your job is to COMMUNICATE with tenants and EXTRACT information about what they're looking for in CEBU PROVINCE ONLY.

IMPORTANT CONTEXT RULES:
1. You ONLY help with rental property inquiries. If the user asks about anything NOT related to rentals (weather, news, general questions, etc.), respond: "I'm sorry, I can only help you with rental property inquiries. Is there a property you're looking for in Cebu Province?"
2. Your role is to EXTRACT information, NOT to search. Just communicate naturally and extract what the user wants.
3. ALL properties are in Cebu Province only outside of it like manila is out scope

CONVERSATION HISTORY:
${conversationContext || "No previous conversation"}

CURRENT USER MESSAGE:
${message}

AVAILABLE AMENITIES (for reference):
${amenityNames.join(", ")}

YOUR TASKS:
1. Check if the question is rental-related. If NOT, respond that you can only help with rental inquiries.
2. Communicate naturally with the user to understand what they want
3. EXTRACT the following information when user wants to search:
   - city: city name in Cebu (e.g., "Cebu City", "Mandaue", "Lapu-Lapu")
   - municipality: municipality name in Cebu
   - barangay: barangay name
   - street: street name
   - zipCode: zip code (rare)
   - unitType: unit type (e.g., "apartment", "condominium", "house", "boarding house")
   - amenities: array of amenity names mentioned (e.g., ["wifi", "air conditioning", "parking"])
   - minPrice: minimum budget (extract numbers, assume PHP)
   - maxPrice: maximum budget (extract numbers, assume PHP)
   - searchKeywords: any other keywords mentioned (property title, unit label, address parts, etc.)

SEARCH TRIGGERS (when user wants to see results):
- "show me", "find me", "search for", "look for", "I want to see", "show results", "let me see", etc.
- "what's available", "what do you have", "show available"
- After gathering enough information

RESPONSE FORMAT (JSON only):
{
  "isRentalRelated": true/false,
  "shouldSearch": true/false,
  "response": "Your conversational response to the user",
  "extractedData": {
    "city": "city name or null",
    "municipality": "municipality name or null",
    "barangay": "barangay name or null",
    "street": "street name or null",
    "zipCode": "zip code or null",
    "unitType": "unit type or null",
    "amenities": ["amenity1", "amenity2"] or null,
    "minPrice": number or null,
    "maxPrice": number or null,
    "searchKeywords": "any keywords or null"
  }
}

EXAMPLES:
User: "What's the weather today?"
Response: {
  "isRentalRelated": false,
  "shouldSearch": false,
  "response": "I'm sorry, I can only help you with rental property inquiries. Is there a property you're looking for in Cebu Province?",
  "extractedData": null
}

User: "I'm looking for a place in Cebu City"
Response: {
  "isRentalRelated": true,
  "shouldSearch": false,
  "response": "Great! Cebu City is a wonderful location. What type of unit are you looking for? Apartment, house, or condominium?",
  "extractedData": null
}

User: "Show me apartments in Cebu City, Barangay Lahug with wifi and air conditioning under 10000 pesos"
Response: {
  "isRentalRelated": true,
  "shouldSearch": true,
  "response": "I'll search for apartments in Cebu City, Barangay Lahug with wifi and air conditioning under ₱10,000 for you!",
  "extractedData": {
    "city": "Cebu City",
    "municipality": null,
    "barangay": "Lahug",
    "street": null,
    "zipCode": null,
    "unitType": "apartment",
    "amenities": ["wifi", "air conditioning"],
    "minPrice": null,
    "maxPrice": 10000,
    "searchKeywords": null
  }
}

User: "Find me properties with parking in Mandaue"
Response: {
  "isRentalRelated": true,
  "shouldSearch": true,
  "response": "I'll search for properties with parking in Mandaue!",
  "extractedData": {
    "city": "Mandaue",
    "municipality": null,
    "barangay": null,
    "street": null,
    "zipCode": null,
    "unitType": null,
    "amenities": ["parking"],
    "minPrice": null,
    "maxPrice": null,
    "searchKeywords": null
  }
}

Return JSON only, no commentary.
`;

    let aiResponse;
    try {
      const result = await runGeminiWithRetry(aiPrompt);
      const text =
        result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
        result?.response?.text?.() ||
        "";

      if (!text) {
        throw new Error("Empty AI response");
      }

      const cleaned = text.replace(/```json|```/g, "").trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No valid JSON in AI response");

      aiResponse = JSON.parse(jsonMatch[0]);
    } catch (aiError) {
      console.error("⚠️ AI processing failed:", aiError.message);
      // Fallback response
      aiResponse = {
        isRentalRelated: true,
        shouldSearch: false,
        response: "I'm here to help you find the perfect rental property in Cebu Province! What location are you interested in?",
        extractedData: null,
      };
    }

    // Check if question is rental-related
    if (aiResponse.isRentalRelated === false) {
      return res.status(200).json({
        success: true,
        data: {
          message: aiResponse.response || "I'm sorry, I can only help you with rental property inquiries. Is there a property you're looking for in Cebu Province?",
          shouldSearch: false,
          searchResults: null,
          extractedData: null,
        },
      });
    }

    // If AI says we should search, use Fuse.js to perform powerful search
    let searchResults = null;
    if (aiResponse.shouldSearch && aiResponse.extractedData) {
      try {
        const extracted = aiResponse.extractedData;
        
        // Step 1: Fetch ALL Cebu listings with basic filters (lifecycle, expires, price, amenities)
        const whereClause = {
          lifecycleStatus: "VISIBLE",
          expiresAt: { gte: new Date() },
          landlord: {
            isDisabled: false, // exclude listings from disabled landlords
          },
        };

        const unitFilters = {};
        const propertyFilters = {};

        // ALWAYS filter by Cebu Province
        const cebuLocationConditions = [];
        if (cebuCities.length > 0) {
          cebuLocationConditions.push({ cityId: { in: cebuCities.map(c => c.id) } });
        }
        if (cebuMunicipalities.length > 0) {
          cebuLocationConditions.push({ municipalityId: { in: cebuMunicipalities.map(m => m.id) } });
        }
        if (cebuLocationConditions.length > 0) {
          propertyFilters.OR = cebuLocationConditions;
        }

        // Price range filter (apply before Fuse.js search)
        if (extracted.minPrice || extracted.maxPrice) {
          unitFilters.targetPrice = {};
          if (extracted.minPrice) {
            unitFilters.targetPrice.gte = parseFloat(extracted.minPrice);
          }
          if (extracted.maxPrice) {
            unitFilters.targetPrice.lte = parseFloat(extracted.maxPrice);
          }
        }

        // Amenity filter (apply before Fuse.js search)
        if (extracted.amenities && Array.isArray(extracted.amenities) && extracted.amenities.length > 0) {
          const matchingAmenityIds = [];
          for (const requestedAmenity of extracted.amenities) {
            const matched = allAmenities.find(a => 
              a.name.toLowerCase() === requestedAmenity.toLowerCase() ||
              a.name.toLowerCase().includes(requestedAmenity.toLowerCase()) ||
              requestedAmenity.toLowerCase().includes(a.name.toLowerCase())
            );
            if (matched) {
              matchingAmenityIds.push(matched.id);
            }
          }
          if (matchingAmenityIds.length > 0) {
            unitFilters.amenities = {
              some: {
                id: { in: matchingAmenityIds },
              },
            };
          }
        }

        // Combine filters
        if (Object.keys(unitFilters).length > 0 || Object.keys(propertyFilters).length > 0) {
          whereClause.unit = {};
          if (Object.keys(unitFilters).length > 0) {
            Object.assign(whereClause.unit, unitFilters);
          }
          if (Object.keys(propertyFilters).length > 0) {
            whereClause.unit.property = propertyFilters;
          }
        }

        // Fetch ALL Cebu listings (no limit yet, Fuse.js will handle ranking)
        const allListings = await prisma.listing.findMany({
          where: whereClause,
          select: {
            id: true,
            isFeatured: true,
            createdAt: true,
            visibleAt: true,
            unit: {
              select: {
                id: true,
                label: true,
                mainImageUrl: true,
                targetPrice: true,
                requiresScreening: true,
                amenities: {
                  select: {
                    id: true,
                    name: true,
                    category: true,
                  },
                },
                property: {
                  select: {
                    id: true,
                    title: true,
                    type: true,
                    street: true,
                    barangay: true,
                    zipCode: true,
                    city: { select: { id: true, name: true } },
                    municipality: { select: { id: true, name: true } },
                  },
                },
                reviews: { select: { rating: true } },
              },
            },
          },
        });

        // 🔹 Count views from UnitView table for all units
        const unitIds = allListings.map(l => l.unit.id);
        const viewCounts = await prisma.unitView.groupBy({
          by: ['unitId'],
          where: {
            unitId: { in: unitIds },
          },
          _count: { id: true },
        });

        const viewCountMap = {};
        viewCounts.forEach((vc) => {
          viewCountMap[vc.unitId] = vc._count.id;
        });

        // Format listings for Fuse.js search
        const formattedListings = allListings.map((listing) => {
          const reviews = listing.unit.reviews || [];
          const totalReviews = reviews.length;
          const avgRating =
            totalReviews > 0
              ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
              : null;

          // Create searchable text fields for Fuse.js
          const cityName = listing.unit.property.city?.name || "";
          const municipalityName = listing.unit.property.municipality?.name || "";
          const amenityNames = listing.unit.amenities.map(a => a.name).join(" ");

          return {
            id: listing.id,
            isFeatured: listing.isFeatured,
            createdAt: listing.createdAt,
            visibleAt: listing.visibleAt,
            unit: {
              id: listing.unit.id,
              label: listing.unit.label,
              mainImageUrl: listing.unit.mainImageUrl,
              viewCount: viewCountMap[listing.unit.id] || 0, // ✅ count from UnitView table
              targetPrice: listing.unit.targetPrice,
              requiresScreening: listing.unit.requiresScreening,
              property: listing.unit.property,
              avgRating,
              totalReviews,
              amenities: listing.unit.amenities,
            },
            // Searchable fields for Fuse.js
            _searchable: {
              city: cityName,
              municipality: municipalityName,
              barangay: listing.unit.property.barangay || "",
              street: listing.unit.property.street || "",
              zipCode: listing.unit.property.zipCode || "",
              unitType: listing.unit.property.type || "",
              unitLabel: listing.unit.label || "",
              propertyTitle: listing.unit.property.title || "",
              amenities: amenityNames,
              keywords: `${cityName} ${municipalityName} ${listing.unit.property.barangay} ${listing.unit.property.street} ${listing.unit.property.title} ${listing.unit.label} ${amenityNames}`.toLowerCase(),
            },
          };
        });

        // Step 2: Use Fuse.js for powerful fuzzy search
        const searchKeywords = [];
        if (extracted.city) searchKeywords.push(extracted.city);
        if (extracted.municipality) searchKeywords.push(extracted.municipality);
        if (extracted.barangay) searchKeywords.push(extracted.barangay);
        if (extracted.street) searchKeywords.push(extracted.street);
        if (extracted.zipCode) searchKeywords.push(extracted.zipCode);
        if (extracted.unitType) searchKeywords.push(extracted.unitType);
        if (extracted.searchKeywords) searchKeywords.push(extracted.searchKeywords);
        if (extracted.amenities && Array.isArray(extracted.amenities)) {
          searchKeywords.push(...extracted.amenities);
        }

        const searchQuery = searchKeywords.join(" ").trim();

        let fuseResults = formattedListings;
        
        if (searchQuery) {
          // Configure Fuse.js for powerful search
          const fuse = new Fuse(formattedListings, {
            keys: [
              { name: "_searchable.city", weight: 0.3 },
              { name: "_searchable.municipality", weight: 0.3 },
              { name: "_searchable.barangay", weight: 0.25 },
              { name: "_searchable.street", weight: 0.2 },
              { name: "_searchable.zipCode", weight: 0.1 },
              { name: "_searchable.unitType", weight: 0.25 },
              { name: "_searchable.unitLabel", weight: 0.2 },
              { name: "_searchable.propertyTitle", weight: 0.25 },
              { name: "_searchable.amenities", weight: 0.2 },
              { name: "_searchable.keywords", weight: 0.15 },
            ],
            threshold: 0.4, // 0 = perfect match, 1 = match anything (lower = stricter)
            includeScore: true,
            minMatchCharLength: 2,
            ignoreLocation: true,
            findAllMatches: true,
          });

          const fuseSearchResults = fuse.search(searchQuery);
          fuseResults = fuseSearchResults.map(result => result.item);
        }

        // Step 3: Apply sorting (from frontend filter, not AI extraction)
        // Featured is only a priority/boost, not a primary sort option
        const appliedSortBy = sortBy && sortBy !== "ALL" ? sortBy : null;
        
        if (appliedSortBy === "TOP_RATED") {
          fuseResults.sort((a, b) => {
            const ratingA = Math.round((a.unit.avgRating || 0) * 10) / 10; // Round to 1 decimal
            const ratingB = Math.round((b.unit.avgRating || 0) * 10) / 10;
            
            // Primary: Sort by rating (higher first)
            if (ratingA !== ratingB) {
              return ratingB - ratingA;
            }
            
            // Tie-breaker: If same rating (rounded), featured first
            if (a.isFeatured && !b.isFeatured) return -1;
            if (!a.isFeatured && b.isFeatured) return 1;
            
            // Secondary tie-breaker: More reviews
            return b.unit.totalReviews - a.unit.totalReviews;
          });
        } else if (appliedSortBy === "MOST_VIEWED") {
          fuseResults.sort((a, b) => {
            // Primary: Sort by view count (higher first)
            if (a.unit.viewCount !== b.unit.viewCount) {
              return b.unit.viewCount - a.unit.viewCount;
            }
            
            // Tie-breaker: If same views, featured first
            if (a.isFeatured && !b.isFeatured) return -1;
            if (!a.isFeatured && b.isFeatured) return 1;
            
            return 0;
          });
        } else if (appliedSortBy === "NEW") {
          fuseResults.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            
            // Primary: Sort by date (newer first)
            if (dateA !== dateB) {
              return dateB - dateA;
            }
            
            // Tie-breaker: If same date, featured first
            if (a.isFeatured && !b.isFeatured) return -1;
            if (!a.isFeatured && b.isFeatured) return 1;
            
            return 0;
          });
        } else {
          // Default: Featured first, then by date
          fuseResults.sort((a, b) => {
            if (a.isFeatured && !b.isFeatured) return -1;
            if (!a.isFeatured && b.isFeatured) return 1;
            return new Date(b.visibleAt).getTime() - new Date(a.visibleAt).getTime();
          });
        }

        // Remove _searchable field from results
        searchResults = fuseResults.slice(0, 20).map(item => {
          const { _searchable, ...rest } = item;
          return rest;
        });

        // Update AI response with results count
        if (searchResults.length > 0) {
          aiResponse.response = `I found ${searchResults.length} ${searchResults.length === 1 ? 'property' : 'properties'} that match your criteria! Here's what I found:`;
        } else {
          aiResponse.response = "I couldn't find any properties matching your criteria. Would you like to try different search parameters?";
        }
      } catch (searchError) {
        console.error("⚠️ Search failed:", searchError.message);
        aiResponse.response = "I encountered an issue searching for properties. Could you please try again?";
      }
    }

    return res.status(200).json({
      success: true,
        data: {
          message: aiResponse.response,
          shouldSearch: aiResponse.shouldSearch,
          searchResults: searchResults,
          extractedData: aiResponse.extractedData,
        },
    });
  } catch (error) {
    console.error("❌ Error handling AI chatbot message:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process chatbot message.",
    });
  }
};

// ============================================================================
// RECORD UNIT VIEW (after 20 seconds on page)
// ============================================================================
export const recordUnitView = async (req, res) => {
  try {
    const { unitId } = req.params;
    const userId = req.user?.id || null; // Get logged-in user ID (can be null for anonymous)

    if (!unitId) {
      return res.status(400).json({
        success: false,
        message: "Unit ID is required.",
      });
    }

    // Verify unit exists
    const unit = await prisma.unit.findUnique({
      where: { id: unitId },
      select: { id: true },
    });

    if (!unit) {
      return res.status(404).json({
        success: false,
        message: "Unit not found.",
      });
    }

    // Record the view in UnitView table
    await prisma.unitView.create({
      data: {
        unitId: unitId,
        userId: userId, // Can be null for anonymous views
      },
    });

    return res.status(200).json({
      success: true,
      message: "View recorded successfully.",
    });
  } catch (error) {
    console.error("❌ Error recording unit view:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to record view.",
    });
  }
};

// ============================================================================
// CREATE UNIT REVIEW
// ============================================================================
export const createUnitReview = async (req, res) => {
  try {
    const { unitId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not authenticated.",
      });
    }

    if (!unitId) {
      return res.status(400).json({
        success: false,
        message: "Unit ID is required.",
      });
    }

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5.",
      });
    }

    // Validate comment (required, at least 15 words)
    if (!comment || typeof comment !== 'string') {
      return res.status(400).json({
        success: false,
        message: "Comment is required.",
      });
    }

    const wordCount = comment.trim().split(/\s+/).filter(word => word.length > 0).length;
    if (wordCount > 15) {
      return res.status(400).json({
        success: false,
        message: "Comment must contain a maximum of 15 words.",
      });
    }

    // Verify unit exists
    const unit = await prisma.unit.findUnique({
      where: { id: unitId },
      select: { id: true },
    });

    if (!unit) {
      return res.status(404).json({
        success: false,
        message: "Unit not found.",
      });
    }

    // Check if user already reviewed this unit (unique constraint)
    const existingReview = await prisma.unitReview.findUnique({
      where: {
        tenantId_unitId: {
          tenantId: userId,
          unitId: unitId,
        },
      },
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this unit.",
      });
    }

    // Create the review
    const review = await prisma.unitReview.create({
      data: {
        tenantId: userId,
        unitId: unitId,
        rating: parseInt(rating),
        comment: comment.trim(),
      },
      include: {
        tenant: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully.",
      data: review,
    });
  } catch (error) {
    console.error("❌ Error creating unit review:", error);
    
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this unit.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to submit review.",
    });
  }
};

// ============================================================================
// UPDATE UNIT REVIEW
// ============================================================================
export const updateUnitReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not authenticated.",
      });
    }

    if (!reviewId) {
      return res.status(400).json({
        success: false,
        message: "Review ID is required.",
      });
    }

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5.",
      });
    }

    // Validate comment (required, maximum 15 words)
    if (!comment || typeof comment !== 'string') {
      return res.status(400).json({
        success: false,
        message: "Comment is required.",
      });
    }

    const wordCount = comment.trim().split(/\s+/).filter(word => word.length > 0).length;
    if (wordCount > 15) {
      return res.status(400).json({
        success: false,
        message: "Comment must contain a maximum of 15 words.",
      });
    }

    // Find the review and verify ownership
    const existingReview = await prisma.unitReview.findUnique({
      where: { id: reviewId },
      select: {
        id: true,
        tenantId: true,
        unitId: true,
      },
    });

    if (!existingReview) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    if (existingReview.tenantId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own reviews.",
      });
    }

    // Update the review
    const review = await prisma.unitReview.update({
      where: { id: reviewId },
      data: {
        rating: parseInt(rating),
        comment: comment.trim(),
      },
      include: {
        tenant: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    const fullName = `${review.tenant.firstName || ""} ${review.tenant.middleName || ""} ${review.tenant.lastName || ""}`.trim();

    return res.status(200).json({
      success: true,
      message: "Review updated successfully.",
      data: {
        ...review,
        tenant: {
          ...review.tenant,
          fullName: fullName || "Anonymous",
        },
      },
    });
  } catch (error) {
    console.error("❌ Error updating unit review:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update review.",
    });
  }
};

// ============================================================================
// DELETE UNIT REVIEW
// ============================================================================
export const deleteUnitReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not authenticated.",
      });
    }

    if (!reviewId) {
      return res.status(400).json({
        success: false,
        message: "Review ID is required.",
      });
    }

    // Find the review and verify ownership
    const existingReview = await prisma.unitReview.findUnique({
      where: { id: reviewId },
      select: {
        id: true,
        tenantId: true,
        unitId: true,
      },
    });

    if (!existingReview) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    if (existingReview.tenantId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own reviews.",
      });
    }

    // Delete the review
    await prisma.unitReview.delete({
      where: { id: reviewId },
    });

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully.",
    });
  } catch (error) {
    console.error("❌ Error deleting unit review:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete review.",
    });
  }
};
