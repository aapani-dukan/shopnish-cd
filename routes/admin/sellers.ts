import { Router } from "express";
import { requireAdminAuth } from "../../server/middleware/requireAdminAuth.js";
import { db } from "../../server/db.js";
import { sellers, users } from "../../shared/backend/schema.js";
import { eq } from "drizzle-orm";

const router = Router();

// GET /api/admin/sellers - Get all sellers with user details
router.get("/", requireAdminAuth, async (req, res) => {
  try {
    const allSellers = await db
      .select({
        id: sellers.id,
        userId: sellers.userId,
        email: sellers.email,
        name: sellers.name,
        storeName: sellers.storeName,
        storeDescription: sellers.storeDescription,
        gstNumber: sellers.gstNumber,
        address: sellers.address,
        phoneNumber: sellers.phoneNumber,
        approvalStatus: sellers.approvalStatus,
        createdAt: sellers.createdAt,
        updatedAt: sellers.updatedAt,
      })
      .from(sellers)
      .orderBy(sellers.createdAt);

    res.json(allSellers);
  } catch (error) {
    console.error("Error fetching sellers:", error);
    res.status(500).json({ error: "Failed to fetch sellers" });
  }
});

// GET /api/admin/sellers/pending - Get pending sellers
router.get("/pending", requireAdminAuth, async (req, res) => {
  try {
    const pendingSellers = await db
      .select()
      .from(sellers)
      .where(eq(sellers.approvalStatus, "pending"))
      .orderBy(sellers.createdAt);

    res.json(pendingSellers);
  } catch (error) {
    console.error("Error fetching pending sellers:", error);
    res.status(500).json({ error: "Failed to fetch pending sellers" });
  }
});

// PUT /api/admin/sellers/:id/approve - Approve seller
router.put("/:id/approve", requireAdminAuth, async (req, res) => {
  try {
    const sellerId = parseInt(req.params.id);

    const updatedSeller = await db
      .update(sellers)
      .set({ 
        approvalStatus: "approved",
        updatedAt: new Date()
      })
      .where(eq(sellers.id, sellerId))
      .returning();

    if (!updatedSeller.length) {
      return res.status(404).json({ error: "Seller not found" });
    }

    // Also update user role to seller if needed
    await db
      .update(users)
      .set({ 
        role: "seller",
        approvalStatus: "approved",
        updatedAt: new Date()
      })
      .where(eq(users.id, updatedSeller[0].userId));

    res.json({ 
      message: "Seller approved successfully",
      seller: updatedSeller[0]
    });
  } catch (error) {
    console.error("Error approving seller:", error);
    res.status(500).json({ error: "Failed to approve seller" });
  }
});

// PUT /api/admin/sellers/:id/reject - Reject seller
router.put("/:id/reject", requireAdminAuth, async (req, res) => {
  try {
    const sellerId = parseInt(req.params.id);
    const { reason } = req.body;

    const updatedSeller = await db
      .update(sellers)
      .set({ 
        approvalStatus: "rejected",
        updatedAt: new Date()
      })
      .where(eq(sellers.id, sellerId))
      .returning();

    if (!updatedSeller.length) {
      return res.status(404).json({ error: "Seller not found" });
    }

    res.json({ 
      message: "Seller rejected successfully",
      seller: updatedSeller[0]
    });
  } catch (error) {
    console.error("Error rejecting seller:", error);
    res.status(500).json({ error: "Failed to reject seller" });
  }
});

export default router;