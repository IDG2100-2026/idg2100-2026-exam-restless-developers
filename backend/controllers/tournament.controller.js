import Tournament from "../models/tournament.js";

export async function getAllTournaments(req, res) {
  try {
    const tournaments = await Tournament.find()
      .sort({ startDate: 1 })
      .populate("players", "username elo")
      .populate("author", "username");

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

    const tournament = await Tournament.findById(id)
      .populate("players", "username elo")
      .populate("author", "username");

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

export async function joinTournament(req, res) {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const tournament = await Tournament.findById(id);

    if (!tournament) {
      return res.status(404).json({
        message: "Tournament not found",
      });
    }

    if (tournament.status !== "upcoming") {
      return res.status(400).json({
        message: "You can only join upcoming tournaments",
      });
    }

    const alreadyJoined = tournament.players.some(
      (playerId) => playerId.toString() === userId
    );

    if (alreadyJoined) {
      return res.status(400).json({
        message: "You have already joined this tournament",
      });
    }

    if (tournament.players.length >= tournament.maxPlayers) {
      return res.status(400).json({
        message: "Tournament is full",
      });
    }

    tournament.players.push(userId);

    await tournament.save();

    const updatedTournament = await Tournament.findById(id)
      .populate("players", "username elo")
      .populate("author", "username");

    res.status(200).json(updatedTournament);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to join tournament",
    });
  }
}

export async function leaveTournament(req, res) {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const tournament = await Tournament.findById(id);

    if (!tournament) {
      return res.status(404).json({
        message: "Tournament not found",
      });
    }

    const alreadyJoined = tournament.players.some(
      (playerId) => playerId.toString() === userId
    );

    if (!alreadyJoined) {
      return res.status(400).json({
        message: "You have not joined this tournament",
      });
    }

    tournament.players = tournament.players.filter(
      (playerId) => playerId.toString() !== userId
    );

    await tournament.save();

    const updatedTournament = await Tournament.findById(id)
      .populate("players", "username elo")
      .populate("author", "username");

    res.status(200).json(updatedTournament);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to leave tournament",
    });
  }
}