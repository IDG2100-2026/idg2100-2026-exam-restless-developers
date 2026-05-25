const User = require("../models/User");
const Game = require("../models/Game");

// get rankings by wins, win percentage, and number of matches
const getLeaderboard = async (req, res) => {
  try {
    const { sortBy = "wins", page = 1, limit = 10 } = req.query;

    // get all finished non-anonymous games
    const games = await Game.find({
      status: "finished",
      isAnonymous: false,
      winner: { $ne: null },
    });

    // get all registered users
    const users = await User.find({ isBanned: false }).select("-password");

    // calculate stats for each user
    const stats = users.map((user) => {
      const userId = user._id.toString();

      // count games where user was a player
      const userGames = games.filter(
        (g) =>
          (g.playerOne && g.playerOne.toString() === userId) ||
          (g.playerTwo && g.playerTwo.toString() === userId),
      );

      const totalMatches = userGames.length;

      // count wins
      const wins = userGames.filter(
        (g) => g.winner && g.winner.toString() === userId,
      ).length;

      // calculate win percentage
      const winPercentage =
        totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

      return {
        user: {
          _id: user._id,
          username: user.username,
          eloRating: user.eloRating,
        },
        wins,
        totalMatches,
        winPercentage,
      };
    });

    // sort based on query parameter
    if (sortBy === "wins") {
      stats.sort((a, b) => b.wins - a.wins);
    } else if (sortBy === "winPercentage") {
      stats.sort((a, b) => b.winPercentage - a.winPercentage);
    } else if (sortBy === "totalMatches") {
      stats.sort((a, b) => b.totalMatches - a.totalMatches);
    } else if (sortBy === "eloRating") {
      stats.sort((a, b) => b.user.eloRating - a.user.eloRating);
    }

    // apply pagination manually since we computed stats in memory
    const total = stats.length;
    const paginated = stats.slice((page - 1) * limit, page * limit);

    res.json({
      sortBy,
      leaderboard: paginated,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("getLeaderboard error:", err);
    res.status(500).json({ error: "Failed to get leaderboard" });
  }
};

module.exports = { getLeaderboard };
