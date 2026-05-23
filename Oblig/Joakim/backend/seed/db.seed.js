import mongoose from "mongoose";
import User from "../models/users.js";
import Match from "../models/match.js";
import Tournament from "../models/tournament.js";
import { connectDB, disconnectDB } from "../config/db.config.js";

async function seed() {
  await connectDB();

  console.log("sletter eksisterende data...");
  await User.deleteMany({});
  await Match.deleteMany({});
  await Tournament.deleteMany({});

  console.log("oppretter brukere...");
  const users = await User.insertMany([
    {
      uid: 1,
      username: "olav",
      pwd: "Test!123",
      email: "olav@example.com",
      dob: 1995,
      elo: 1200,
      wins: 5,
      losses: 2,
      totalGames: 7
    },
    {
      uid: 2,
      username: "kari1",
      pwd: "Pass!123",
      email: "kari@example.com",
      dob: 1990,
      elo: 950,
      wins: 3,
      losses: 4,
      totalGames: 7
    },
    {
      uid: 3,
      username: "pern",
      pwd: "Hei!1234",
      email: "per@example.com",
      dob: 1988,
      elo: 1300,
      wins: 7,
      losses: 1,
      totalGames: 8
    }
  ]);

  console.log("oppretter matcher...");
  const matches = await Match.insertMany([
    {
      players: [users[0]._id, users[1]._id],
      winner: users[0]._id,
      rounds: 5,
      finishedAt: new Date()
    },
    {
      players: [users[1]._id, users[2]._id],
      winner: users[2]._id,
      rounds: 5,
      finishedAt: new Date()
    }
  ]);

  console.log("oppretter turnering...");
  await Tournament.create({
    name: "vårturnering",
    players: users.map(u => u._id),
    rounds: 3,
    matches: matches.map(m => m._id)
  });

  console.log("seed fullført");
  console.log("brukere:", users.length);
  console.log("matcher:", matches.length);
  console.log("turneringer: 1");

  await disconnectDB();
  process.exit(0);
}

seed();
