import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";

import Tournament from "../models/tournament.js";

dotenv.config();

const tournaments = JSON.parse(
  fs.readFileSync(new URL("./data/tournaments.json", import.meta.url))
);

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to MongoDB");

    await Tournament.deleteMany({});
    await Tournament.insertMany(tournaments);

    console.log("Tournaments seeded successfully");

    await mongoose.disconnect();

    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seedDatabase();