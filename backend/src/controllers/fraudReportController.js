import prisma from "../libs/prismaClient.js";

export const createFraudReport = async (req, res) => {
  const { listingId, reason, details } = req.body || {};
  const reporterId = req.user?.id;

  if (!listingId || !reason) {
    return res.status(400).json({ error: "listingId and reason are required." });
  }

  try {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true },
    });

    if (!listing) {
      return res.status(404).json({ error: "Listing not found." });
    }

    const report = await prisma.fraudReport.create({
      data: {
        listingId,
        reporterId,
        reason,
        details: details || null,
      },
    });

    return res.status(201).json({ report });
  } catch (error) {
    console.error("❌ Error in createFraudReport:", error);
    return res.status(500).json({ error: "Failed to submit report." });
  }
};

export const getFraudReports = async (_req, res) => {
  try {
    const reports = await prisma.fraudReport.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        listing: {
          select: {
            id: true,
            lifecycleStatus: true,
            unit: {
              select: {
                label: true,
                property: {
                  select: {
                    title: true,
                  },
                },
              },
            },
          },
        },
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return res.status(200).json({ reports });
  } catch (error) {
    console.error("❌ Error in getFraudReports:", error);
    return res.status(500).json({ error: "Failed to fetch fraud reports." });
  }
};

