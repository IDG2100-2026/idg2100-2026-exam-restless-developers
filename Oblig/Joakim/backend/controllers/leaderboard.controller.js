import * as leaderboardService from "../services/leaderboard.services.js";

export async function getWins(req, res) {
  try {
    const data = await leaderboardService.leaderboardWins();
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error: "Kunne ikke hente leaderboard: " + error.message });
  }
}

export async function getWinrate(req, res) {
  try {
    const data = await leaderboardService.leaderboardWinrate();
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error: "Kunne ikke hente leaderboard: " + error.message });
  }
}

export async function getMatches(req, res) {
  try {
    const data = await leaderboardService.leaderboardMatches();
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error: "Kunne ikke hente leaderboard: " + error.message });
  }
}
