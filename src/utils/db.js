import { initDatabase, Projects, Pages, Templates } from "../db/jsonDb.js";
import { seedDefaultData } from "./seed.js";

/**
 * Initializes JSON file database and seeds essential data if empty
 */
export async function connectDB() {
  try {
    await initDatabase();
    await seedDefaultData();
    console.log("  ✓ JSON file database initialized (data directory ready)");
    return true;
  } catch (err) {
    console.error("  ✗ Failed to initialize JSON database:", err.message);
    throw err;
  }
}