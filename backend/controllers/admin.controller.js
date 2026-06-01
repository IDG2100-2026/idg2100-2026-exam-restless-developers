import User from "../models/user.js";
import Match from "../models/match.js";
import SecurityIncident from "../models/securityIncident.js";




export async function getAdminDashboard(req, res) {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const newProfilesLastWeek = await User.countDocuments({
      createdAt: { $gte: oneWeekAgo },
    });

    const totalUsers = await User.countDocuments();

    const adminUsers = await User.countDocuments({
      role: "admin",
    });

    const gamesPlayedLastWeek = await Match.countDocuments({
      status: "finished",
      updatedAt: { $gte: oneWeekAgo },
    });

    const availableGames = await Match.countDocuments({
      status: "waiting",
    });

    const activeMatches = await Match.find({
      status: "active",
    }).select("players");

    const activePlayers = activeMatches.reduce((total, match) => {
      return total + match.players.length;
    }, 0);

    const ipChangeIncidents = await SecurityIncident.find({
        type: "ip_change",
    })
        .sort({ createdAt: -1 })
        .limit(10)

        const rateLimitIncidents = await SecurityIncident.find({
        type: "rate_limit",
    })
        .sort({ createdAt: -1 })
        .limit(10);


    res.status(200).json({
      users: {
        totalUsers,
        newProfilesLastWeek,
        adminUsers,
      },
      games: {
        activePlayers,
        gamesPlayedLastWeek,
        availableGames,
      },
      security: {
        rateLimitIncidents,
        ipChangeIncidents,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch admin dashboard data",
    });
  }
}