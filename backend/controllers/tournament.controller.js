import Tournament from "../models/tournament.js";

function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function createPairings(players, maxPlayersPerGame) {
  const shuffledPlayers = shuffleArray(players);
  const pairings = [];

  for (let i = 0; i < shuffledPlayers.length; i += maxPlayersPerGame) {
    pairings.push({
      players: shuffledPlayers.slice(i, i + maxPlayersPerGame),
      winner: null,
      pointsAwarded: 0,
      game: null,
    });
  }

  return pairings;
}

async function getPopulatedTournament(id) {
  return Tournament.findById(id)
    .populate("players", "username elo")
    .populate("author", "username")
    .populate("winner", "username")
    .populate("standings.player", "username elo")
    .populate("rounds.pairings.players", "username elo")
    .populate("rounds.pairings.winner", "username");
}

export async function getAllTournaments(req, res) {
  try {
    const tournaments = await Tournament.find()
      .sort({ startDate: 1 })
      .populate("players", "username elo")
      .populate("author", "username")
      .populate("winner", "username");

    res.status(200).json(tournaments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch tournaments" });
  }
}

export async function getTournamentById(req, res) {
  try {
    const { id } = req.params;

    const tournament = await getPopulatedTournament(id);

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    res.status(200).json(tournament);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch tournament" });
  }
}

export async function joinTournament(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id.toString();

    const tournament = await Tournament.findById(id);

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
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
      return res.status(400).json({ message: "Tournament is full" });
    }

    tournament.players.push(req.user._id);
    await tournament.save();

    const updatedTournament = await getPopulatedTournament(id);
    res.status(200).json(updatedTournament);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to join tournament" });
  }
}

export async function leaveTournament(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id.toString();

    const tournament = await Tournament.findById(id);

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
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

    if (tournament.status === "upcoming") {
      tournament.standings = tournament.standings.filter(
        (standing) => standing.player.toString() !== userId
      );
    }

    await tournament.save();

    const updatedTournament = await getPopulatedTournament(id);
    res.status(200).json(updatedTournament);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to leave tournament" });
  }
}

export async function createTournament(req, res) {
  try {
    const {
      title,
      description,
      startDate,
      gameVariant,
      tournamentRounds,
      buyIn,
      maxPlayers,
      trophy,
      rules,
      minElo,
      maxElo,
    } = req.body;

    const tournament = await Tournament.create({
      title,
      description,
      startDate,
      gameVariant,
      tournamentRounds,
      buyIn,
      maxPlayers,
      trophy,
      rules,
      minElo,
      maxElo,
      players: [],
      standings: [],
      rounds: [],
      currentRound: 0,
      nextRoundStart: null,
      winner: null,
      status: "upcoming",
      author: req.user._id,
    });

    const populatedTournament = await getPopulatedTournament(tournament._id);
    res.status(201).json(populatedTournament);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create tournament" });
  }
}

export async function updateTournament(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const tournament = await Tournament.findById(id);

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    if (updates.status === "ongoing") {
      if (tournament.status !== "upcoming") {
        return res.status(400).json({
          message: "Only upcoming tournaments can be started",
        });
      }

      if (tournament.players.length < 2) {
        return res.status(400).json({
          message: "At least 2 players are required to start a tournament",
        });
      }

      tournament.status = "ongoing";
      tournament.startDate = new Date();
      tournament.currentRound = 1;
      tournament.nextRoundStart = new Date(Date.now() + 1000 * 60 * 10);

      tournament.standings = tournament.players.map((playerId) => ({
        player: playerId,
        points: 0,
        wins: 0,
        losses: 0,
      }));

      tournament.rounds = [
        {
          roundNumber: 1,
          status: "active",
          pairings: createPairings(
            tournament.players,
            tournament.gameVariant.maxPlayersPerGame
          ),
          startedAt: new Date(),
          completedAt: null,
        },
      ];
    } else {
      const allowedUpdates = [
        "title",
        "description",
        "startDate",
        "gameVariant",
        "tournamentRounds",
        "buyIn",
        "maxPlayers",
        "trophy",
        "rules",
        "minElo",
        "maxElo",
        "status",
      ];

      allowedUpdates.forEach((field) => {
        if (updates[field] !== undefined) {
          tournament[field] = updates[field];
        }
      });
    }

    await tournament.save();

    const updatedTournament = await getPopulatedTournament(id);
    res.status(200).json(updatedTournament);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update tournament" });
  }
}

export async function deleteTournament(req, res) {
  try {
    const { id } = req.params;

    const tournament = await Tournament.findByIdAndDelete(id);

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    res.status(200).json({ message: "Tournament deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete tournament" });
  }
}

export async function recordRoundResult(req, res) {
  try {
    const { id, roundNumber } = req.params;
    const { pairingId, winnerId } = req.body;

    const tournament = await Tournament.findById(id);

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    if (tournament.status !== "ongoing") {
      return res.status(400).json({ message: "Tournament is not ongoing" });
    }

    const round = tournament.rounds.find(
      (round) => round.roundNumber === Number(roundNumber)
    );

    if (!round) {
      return res.status(404).json({ message: "Round not found" });
    }

    const pairing = round.pairings.id(pairingId);

    if (!pairing) {
      return res.status(404).json({ message: "Pairing not found" });
    }

    if (pairing.winner) {
      return res.status(400).json({ message: "Result already recorded" });
    }

    pairing.winner = winnerId;
    pairing.pointsAwarded = 3;

    pairing.players.forEach((playerId) => {
      const standing = tournament.standings.find(
        (standing) => standing.player.toString() === playerId.toString()
      );

      if (!standing) return;

      if (playerId.toString() === winnerId.toString()) {
        standing.points += 3;
        standing.wins += 1;
      } else {
        standing.losses += 1;
      }
    });

    const allPairingsCompleted = round.pairings.every(
      (pairing) => pairing.winner
    );

    if (allPairingsCompleted) {
      round.status = "completed";
      round.completedAt = new Date();

      const hasMoreRounds =
        tournament.currentRound < tournament.tournamentRounds;

      if (hasMoreRounds) {
        const nextRoundNumber = tournament.currentRound + 1;

        tournament.currentRound = nextRoundNumber;
        tournament.rounds.push({
          roundNumber: nextRoundNumber,
          status: "active",
          pairings: createPairings(
            tournament.players,
            tournament.gameVariant.maxPlayersPerGame
          ),
          startedAt: new Date(),
          completedAt: null,
        });

        tournament.nextRoundStart = new Date(Date.now() + 1000 * 60 * 10);
      } else {
        tournament.status = "finished";
        tournament.nextRoundStart = null;

        const winnerStanding = [...tournament.standings].sort(
          (a, b) => b.points - a.points
        )[0];

        if (winnerStanding) {
          tournament.winner = winnerStanding.player;
        }
      }
    }

    await tournament.save();

    const updatedTournament = await getPopulatedTournament(id);
    res.status(200).json(updatedTournament);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to record round result" });
  }
}