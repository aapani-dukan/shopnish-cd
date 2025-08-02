
import { db } from "./db.ts";
import { users } from "../shared/backend/schema.ts";
import { eq } from "drizzle-orm";

async function createAdmin() {
  try {
    const adminFirebaseUid = "admin-test-uid-123"; // आप यहाँ अपना Firebase UID डाल सकते हैं
    
    // Check if admin already exists
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.firebaseUid, adminFirebaseUid))
      .limit(1);

    if (existingAdmin.length > 0) {
      console.log("Admin user already exists:", existingAdmin[0]);
      return;
    }

    // Create admin user
    const adminUser = await db
      .insert(users)
      .values({
        firebaseUid: adminFirebaseUid,
        email: "admin@test.com",
        name: "Test Admin",
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    console.log("✅ Admin user created successfully:", adminUser[0]);
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
  }
}

createAdmin();
