import {
  getOngoingGames,
  getActiveUsers,
  getRecentGames,
} from "../services/platform.services.js";

export async function getPlatformActivity(req, res) {
  try {
    const ongoing = await getOngoingGames();
    const activeUsers = await getActiveUsers();
    const recentGames = await getRecentGames();

    res.status(200).json({
      ongoingGames: ongoing,
      activeUsers,
      recentGames,
    });
  } catch (error) {
    res.status(400).json({
      error: "Kunne ikke hente plattformaktivitet: " + error.message,
    });
  }
}
