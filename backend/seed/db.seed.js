import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";

import User from "../models/user.js";
import Tournament from "../models/tournament.js";

dotenv.config();

const tournaments = JSON.parse(
  fs.readFileSync(new URL("./data/tournaments.json", import.meta.url))
);

async function seedDatabase() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("Missing MONGO_URI env variable");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to MongoDB");

    await Promise.all([User.deleteMany({}), Tournament.deleteMany({})]);

    const author = await User.create({
      uid: 1,
      username: "seed-admin",
      pwd: "Password123!",
      email: "seed-admin@example.com",
      role: "admin",
      aboutMe: "Seeded admin account for tournament ownership.",
      profileImage: "",
      dob: 1990,
      elo: 1200,
      wins: 0,
      losses: 0,
      totalGames: 0,
    });

    const tournamentDocs = tournaments.map((tournament) => ({
      ...tournament,
      author: author._id,
    }));

    await Tournament.insertMany(tournamentDocs);

    console.log("Tournaments seeded successfully");

    await mongoose.disconnect();

    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seedDatabase();