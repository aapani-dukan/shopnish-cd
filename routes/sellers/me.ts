
import { Router, Response, NextFunction } from "express";
import { db } from "../../server/db.ts";
import { sellersPgTable, users } from "../../shared/backend/schema.ts";
import { verifyToken, AuthenticatedRequest } from "../../server/middleware/verifyToken.ts";
import { eq } from "drizzle-orm";

const router = Router();

// Get current seller profile
router.get("/", verifyToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const firebaseUid = req.user?.userId;

    if (!firebaseUid) {
      return res.status(401).json({ message: "Unauthorized: User not authenticated." });
    }

    // Get user first
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.firebaseUid, firebaseUid))
      .limit(1);

    if (userResult.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const user = userResult[0];

    // Get seller profile
    const sellerResult = await db
      .select()
      .from(sellersPgTable)
      .where(eq(sellersPgTable.userId, user.id))
      .limit(1);

    if (sellerResult.length === 0) {
      return res.status(404).json({ message: "Seller profile not found." });
    }

    return res.status(200).json(sellerResult[0]);
  } catch (error) {
    console.error("❌ Error fetching seller profile:", error);
    next(error);
  }
});

export default router;
