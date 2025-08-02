import { Router } from "express";
import { requireAuth } from "../../server/middleware/requireAuth.js";
import { db } from "../../server/db.js";
import { sellers, users } from "../../shared/backend/schema.js";
import { eq } from "drizzle-orm";

const router = Router();

// POST /api/sellers/apply - Apply to become a seller
router.post("/", requireAuth, async (req, res) => {
  try {
    const { storeName, storeDescription, gstNumber, address, phoneNumber } = req.body;
    const userId = req.user!.id;

    // Check if user already applied
    const existingApplication = await db
      .select()
      .from(sellers)
      .where(eq(sellers.userId, userId))
      .limit(1);

    if (existingApplication.length > 0) {
      return res.status(400).json({ 
        error: "आपने पहले से ही seller के लिए apply किया है" 
      });
    }

    // Create seller application
    const newSeller = await db.insert(sellers).values({
      userId: userId,
      firebaseUid: req.user!.firebaseUid,
      email: req.user!.email,
      name: req.user!.name,
      storeName: storeName,
      storeDescription: storeDescription,
      gstNumber: gstNumber,
      address: address,
      phoneNumber: phoneNumber,
      approvalStatus: "pending",
    }).returning();

    res.json({ 
      message: "Seller application submitted successfully",
      seller: newSeller[0]
    });
  } catch (error) {
    console.error("Error applying for seller:", error);
    res.status(500).json({ error: "Failed to submit application" });
  }
});

export default router;