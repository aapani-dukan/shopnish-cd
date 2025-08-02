
import { Router } from "express";
import { db } from "../server/db.js";
import { categories } from "../shared/backend/schema.js";

const router = Router();

// GET /api/categories - Get all categories
router.get("/", async (req, res) => {
  try {
    const allCategories = await db.select().from(categories);
    res.json(allCategories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

export default router;
