import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/nodecanvas";
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log("  ✓ MongoDB connected:", uri.split("@").pop()); // hide credentials
  } catch (err) {
    console.error("  ✗ MongoDB connection failed:", err.message);
    console.error("    Make sure MongoDB is running or update MONGO_URI in .env");
    process.exit(1);
  }
}

mongoose.connection.on("disconnected", () => console.warn("  ⚠ MongoDB disconnected"));

/* ─────────────────────────────────────────────────────────────────────────
   PostgreSQL via Sequelize (uncomment and update .env to use):

import { Sequelize } from "sequelize";

export const sequelize = new Sequelize(
  process.env.PG_DB   || "nodecanvas",
  process.env.PG_USER || "postgres",
  process.env.PG_PASS || "",
  {
    host:    process.env.PG_HOST || "localhost",
    port:    parseInt(process.env.PG_PORT) || 5432,
    dialect: "postgres",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    pool:    { max: 10, min: 2, acquire: 30000, idle: 10000 },
  }
);

export async function connectDB() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: process.env.NODE_ENV === "development" });
    console.log("  ✓ PostgreSQL connected");
  } catch (err) {
    console.error("  ✗ PostgreSQL connection failed:", err.message);
    process.exit(1);
  }
}
───────────────────────────────────────────────────────────────────────── */