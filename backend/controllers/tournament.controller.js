import Tournament from "../models/tournament.js";

export async function getAllTournaments(req, res) {
  try {
    const tournaments = await Tournament.find().sort({ startDate: 1 });

    res.status(200).json(tournaments);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch tournaments",
    });
  }
}

export async function getTournamentById(req, res) {
  try {
    const { id } = req.params;

    const tournament = await Tournament.findById(id);

    if (!tournament) {
      return res.status(404).json({
        message: "Tournament not found",
      });
    }

    res.status(200).json(tournament);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch tournament",
    });
  }
}