import User from "../models/users.js";
import Match from "../models/match.js";

// players with most wins
export async function leaderboardWins() {
  return User.find({})
    .sort({ wins: -1 })
    .limit(20)
    .select("username wins totalGames elo");
}

// players with best win percentage (min 5 games to avoid noise)
export async function leaderboardWinrate() {
  return User.aggregate([
    {
      $addFields: {
        winrate: {
          $cond: [
            { $gte: ["$totalGames", 5] },
            { $divide: ["$wins", "$totalGames"] },
            0,
          ],
        },
      },
    },
    { $sort: { winrate: -1 } },
    { $limit: 20 },
    {
      $project: {
        username: 1,
        wins: 1,
        totalGames: 1,
        winrate: 1,
        elo: 1,
      },
    },
  ]);
}

// players with most matches played
export async function leaderboardMatches() {
  return User.find({})
    .sort({ totalGames: -1 })
    .limit(20)
    .select("username totalGames wins elo");
}
