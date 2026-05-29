import User from "../models/user.js";

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

    res.status(200).json({
      users: {
        totalUsers,
        newProfilesLastWeek,
        adminUsers,
      },
      games: {
        activePlayers: 0,
        gamesPlayedLastWeek: 0,
        availableGames: 0,
      },
      security: {
        rateLimitIncidents: [],
        ipChangeIncidents: [],
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch admin dashboard data",
    });
  }
}