import Match from "../models/match.js";
import User from "../models/user.js";

export async function getPlatformActivity(req, res) {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const totalUsers = await User.countDocuments();
    const newProfilesLastWeek = await User.countDocuments({ createdAt: { $gte: oneWeekAgo } });

    const gamesPlayedLastWeek = await Match.countDocuments({ status: "finished", updatedAt: { $gte: oneWeekAgo } });
    const availableGames = await Match.countDocuments({ status: "waiting" });
    const activeMatches = await Match.find({ status: "active" }).select("players");
    const activePlayers = activeMatches.reduce((total, m) => total + (m.players?.length || 0), 0);

    res.status(200).json({
      users: { totalUsers, newProfilesLastWeek },
      games: { activePlayers, gamesPlayedLastWeek, availableGames },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
