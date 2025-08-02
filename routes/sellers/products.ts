
import { Router } from "express";
import { requireAuth } from "../../server/middleware/requireAuth.js";
import { db } from "../../server/db.js";
import { products, sellers } from "../../shared/backend/schema.js";
import { eq, and } from "drizzle-orm";

const router = Router();

// GET /api/sellers/products - Get seller's products
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;

    // Get seller info
    const seller = await db
      .select()
      .from(sellers)
      .where(eq(sellers.userId, userId))
      .limit(1);

    if (!seller.length || seller[0].approvalStatus !== "approved") {
      return res.status(403).json({ error: "Seller not approved" });
    }

    // Get seller's products
    const sellerProducts = await db
      .select()
      .from(products)
      .where(eq(products.sellerId, seller[0].id));

    res.json(sellerProducts);
  } catch (error) {
    console.error("Error fetching seller products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// POST /api/sellers/products - Add new product
router.post("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { name, description, price, originalPrice, categoryId, image, brand } = req.body;

    // Verify seller is approved
    const seller = await db
      .select()
      .from(sellers)
      .where(eq(sellers.userId, userId))
      .limit(1);

    if (!seller.length || seller[0].approvalStatus !== "approved") {
      return res.status(403).json({ error: "Seller not approved" });
    }

    // Create product
    const newProduct = await db.insert(products).values({
      name,
      description,
      price: price.toString(),
      originalPrice: originalPrice?.toString(),
      categoryId,
      sellerId: seller[0].id,
      image: image || "/placeholder-product.jpg",
      brand,
      isActive: true,
    }).returning();

    res.json({ 
      message: "Product added successfully",
      product: newProduct[0]
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ error: "Failed to add product" });
  }
});

export default router;
