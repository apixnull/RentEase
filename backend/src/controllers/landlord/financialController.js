import prisma from "../../libs/prismaClient.js";

/**
 * @desc Get all properties with units for financial forms
 * @route GET /api/landlord/financial/properties-with-units
 * @access Private (LANDLORD)
 */
export const getPropertiesWithUnits = async (req, res) => {
  try {
    const landlordId = req.user?.id;

    if (!landlordId) {
      return res.status(401).json({ error: "Unauthorized: landlord not found." });
    }

    const properties = await prisma.property.findMany({
      where: { ownerId: landlordId },
      select: {
        id: true,
        title: true,
        type: true,
        street: true,
        barangay: true,
        zipCode: true,
        city: { select: { name: true } },
        municipality: { select: { name: true } },
        Unit: {
          select: {
            id: true,
            label: true,
          },
          orderBy: {
            label: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format the response with address
    const formattedProperties = properties.map(prop => ({
      id: prop.id,
      title: prop.title,
      type: prop.type,
      address: {
        street: prop.street,
        barangay: prop.barangay,
        zipCode: prop.zipCode,
        city: prop.city?.name || null,
        municipality: prop.municipality?.name || null,
      },
      Unit: prop.Unit,
    }));

    return res.status(200).json({ properties: formattedProperties });
  } catch (err) {
    console.error("Error fetching properties with units:", err);
    return res.status(500).json({
      error: "Failed to fetch properties.",
      details: err.message,
    });
  }
};

/**
 * @desc Get all transaction records for a landlord
 * @route GET /api/landlord/financial/transactions
 * @access Private (LANDLORD)
 */
export const getAllTransactions = async (req, res) => {
  try {
    const landlordId = req.user?.id;

    if (!landlordId) {
      return res.status(401).json({ error: "Unauthorized: landlord not found." });
    }

    // Get all properties owned by the landlord
    const properties = await prisma.property.findMany({
      where: { ownerId: landlordId },
      select: { id: true },
    });

    const propertyIds = properties.map((p) => p.id);

    // Get all transaction records for these properties
    const transactions = await prisma.transaction.findMany({
      where: {
        propertyId: { in: propertyIds },
      },
      select: {
        id: true,
        propertyId: true,
        unitId: true,
        amount: true,
        description: true,
        date: true,
        type: true,
        category: true,
        recurringInterval: true,
        createdAt: true,
        updatedAt: true,
        property: {
          select: {
            id: true,
            title: true,
            type: true,
            street: true,
            barangay: true,
            zipCode: true,
            city: { select: { name: true } },
            municipality: { select: { name: true } },
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    // Fetch units for transactions that have unitId
    const unitIds = transactions.filter(t => t.unitId).map(t => t.unitId);
    const units = unitIds.length > 0 ? await prisma.unit.findMany({
      where: { id: { in: unitIds } },
      select: { id: true, label: true },
    }) : [];

    const unitMap = new Map(units.map(u => [u.id, u]));

    // Attach unit info to transactions
    const transactionsWithUnits = transactions.map(transaction => ({
      ...transaction,
      unit: transaction.unitId ? unitMap.get(transaction.unitId) || null : null,
    }));

    return res.status(200).json({ transactions: transactionsWithUnits });
  } catch (err) {
    console.error("Error fetching transactions:", err);
    return res.status(500).json({
      error: "Failed to fetch transaction records.",
      details: err.message,
    });
  }
};

/**
 * @desc Create a new transaction record
 * @route POST /api/landlord/financial/transactions
 * @access Private (LANDLORD)
 */
export const createTransaction = async (req, res) => {
  try {
    const landlordId = req.user?.id;

    if (!landlordId) {
      return res.status(401).json({ error: "Unauthorized: landlord not found." });
    }

    const {
      propertyId,
      unitId,
      amount,
      description,
      date,
      type,
      category,
      recurringInterval,
    } = req.body;

    // Validation
    if (!propertyId || !amount || !description || !type) {
      return res.status(400).json({
        error: "Missing required fields: propertyId, amount, description, and type are required.",
      });
    }

    // Validate type
    if (type !== 'INCOME' && type !== 'EXPENSE') {
      return res.status(400).json({
        error: "Invalid type. Must be 'INCOME' or 'EXPENSE'.",
      });
    }

    // Validate description word limit (15 words)
    const wordCount = description.trim().split(/\s+/).filter(word => word.length > 0).length;
    if (wordCount > 15) {
      return res.status(400).json({
        error: "Description must not exceed 15 words. Current word count: " + wordCount,
      });
    }

    // Verify property ownership
    const property = await prisma.property.findFirst({
      where: { id: propertyId, ownerId: landlordId },
      select: { id: true },
    });

    if (!property) {
      return res.status(403).json({
        error: "Property not found or not owned by landlord.",
      });
    }

    // Validate unit if provided
    if (unitId) {
      const unit = await prisma.unit.findFirst({
        where: { id: unitId, propertyId },
        select: { id: true },
      });

      if (!unit) {
        return res.status(400).json({
          error: "Unit not found or does not belong to the specified property.",
        });
      }
    }

    // Validate amount
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: "Invalid amount. Must be a positive number." });
    }

    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        propertyId,
        unitId: unitId || null,
        amount: parsedAmount,
        description,
        date: date ? new Date(date) : new Date(),
        type,
        category: category || null,
        recurringInterval: recurringInterval || null,
      },
      select: {
        id: true,
        propertyId: true,
        unitId: true,
        amount: true,
        description: true,
        date: true,
        type: true,
        category: true,
        recurringInterval: true,
        createdAt: true,
        updatedAt: true,
        property: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
      },
    });

    return res.status(201).json({
      message: "Transaction record created successfully.",
      transaction,
    });
  } catch (err) {
    console.error("Error creating transaction:", err);
    return res.status(500).json({
      error: "Failed to create transaction record.",
      details: err.message,
    });
  }
};


/**
 * @desc Update a transaction record
 * @route PATCH /api/landlord/financial/transactions/:transactionId
 * @access Private (LANDLORD)
 */
export const updateTransaction = async (req, res) => {
  try {
    const landlordId = req.user?.id;
    const { transactionId } = req.params;

    if (!landlordId) {
      return res.status(401).json({ error: "Unauthorized: landlord not found." });
    }

    // Verify transaction exists and belongs to landlord's property
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      select: {
        id: true,
        property: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    if (!existingTransaction) {
      return res.status(404).json({ error: "Transaction record not found." });
    }

    if (existingTransaction.property.ownerId !== landlordId) {
      return res.status(403).json({ error: "You are not authorized to update this transaction record." });
    }

    const {
      propertyId,
      unitId,
      amount,
      description,
      date,
      type,
      category,
      recurringInterval,
    } = req.body;

    // Validate type if provided
    if (type !== undefined && type !== 'INCOME' && type !== 'EXPENSE') {
      return res.status(400).json({
        error: "Invalid type. Must be 'INCOME' or 'EXPENSE'.",
      });
    }

    // Validate description word limit if provided
    if (description !== undefined) {
      const wordCount = description.trim().split(/\s+/).filter(word => word.length > 0).length;
      if (wordCount > 15) {
        return res.status(400).json({
          error: "Description must not exceed 15 words. Current word count: " + wordCount,
        });
      }
    }

    // Validate amount if provided
    let parsedAmount = null;
    if (amount !== undefined) {
      parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ error: "Invalid amount. Must be a positive number." });
      }
    }

    // Build update data
    const updateData = {};
    if (propertyId !== undefined) updateData.propertyId = propertyId;
    if (unitId !== undefined) updateData.unitId = unitId || null;
    if (parsedAmount !== null) updateData.amount = parsedAmount;
    if (description !== undefined) updateData.description = description;
    if (date !== undefined) updateData.date = new Date(date);
    if (type !== undefined) updateData.type = type;
    if (category !== undefined) updateData.category = category || null;
    if (recurringInterval !== undefined) updateData.recurringInterval = recurringInterval || null;

    // Update transaction record
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: updateData,
      select: {
        id: true,
        propertyId: true,
        unitId: true,
        amount: true,
        description: true,
        date: true,
        type: true,
        category: true,
        recurringInterval: true,
        createdAt: true,
        updatedAt: true,
        property: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
      },
    });

    return res.status(200).json({
      message: "Transaction record updated successfully.",
      transaction: updatedTransaction,
    });
  } catch (err) {
    console.error("Error updating transaction:", err);
    return res.status(500).json({
      error: "Failed to update transaction record.",
      details: err.message,
    });
  }
};

/**
 * @desc Delete a transaction record
 * @route DELETE /api/landlord/financial/transactions/:transactionId
 * @access Private (LANDLORD)
 */
export const deleteTransaction = async (req, res) => {
  try {
    const landlordId = req.user?.id;
    const { transactionId } = req.params;

    if (!landlordId) {
      return res.status(401).json({ error: "Unauthorized: landlord not found." });
    }

    // Verify transaction exists and belongs to landlord's property
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      select: {
        id: true,
        property: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    if (!existingTransaction) {
      return res.status(404).json({ error: "Transaction record not found." });
    }

    if (existingTransaction.property.ownerId !== landlordId) {
      return res.status(403).json({ error: "You are not authorized to delete this transaction record." });
    }

    // Delete transaction record
    await prisma.transaction.delete({
      where: { id: transactionId },
    });

    return res.status(200).json({
      message: "Transaction record deleted successfully.",
    });
  } catch (err) {
    console.error("Error deleting transaction:", err);
    return res.status(500).json({
      error: "Failed to delete transaction record.",
      details: err.message,
    });
  }
};

