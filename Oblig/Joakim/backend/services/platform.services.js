import Match from "../models/match.js";
import User from "../models/users.js";

// games that have no winner yet
export async function getOngoingGames() {
  return Match.countDocuments({ winner: null });
}

// users active in the last 7 days
export async function getActiveUsers() {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  return User.countDocuments({ updatedAt: { $gte: oneWeekAgo } });
}

// last 10 finished games
export async function getRecentGames() {
  return Match.find({ winner: { $ne: null } })
    .sort({ updatedAt: -1 })
    .limit(10)
    .populate("players.userId", "username");
}
