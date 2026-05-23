import Tournament from "../models/tournament.js";
import Match from "../models/match.js";
import User from "../models/users.js";

/**
 * Create a new tournament (admin only)
 */
export async function createTournament(data) {
  const tournament = await Tournament.create({
    title: data.title,
    description: data.description,
    variant: data.variant,
    startTime: data.startTime,
    trophy: data.trophy,
    createdBy: data.createdBy,
  });

  return tournament;
}

/**
 * Add a user to the tournament
 */
export async function joinTournament(tournamentId, userId) {
  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) throw new Error("Turnering ikke funnet");

  // avoid duplicates
  if (tournament.participants.includes(userId)) {
    throw new Error("Brukeren er allerede med i turneringen");
  }

  tournament.participants.push(userId);
  await tournament.save();

  return tournament;
}

/**
 * Generate random pairs for the first round
 * - simple shuffle + pairing
 */
export async function generateFirstRound(tournamentId) {
  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) throw new Error("Turnering ikke funnet");

  const players = [...tournament.participants];

  // Fisher–Yates shuffle
  for (let i = players.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [players[i], players[j]] = [players[j], players[i]];
  }

  const matches = [];

  // pair players
  for (let i = 0; i < players.length; i += 2) {
    const p1 = players[i];
    const p2 = players[i + 1] || null; // odd number → bye

    // create match only if two players exist
    let matchId = null;

    if (p1 && p2) {
      const match = await Match.create({
        players: [
          { userId: p1, isAnonymous: false },
          { userId: p2, isAnonymous: false },
        ],
        variant: tournament.variant,
        tournamentId: tournament._id,
      });

      matchId = match._id;
    }

    matches.push({
      matchId,
      player1: p1,
      player2: p2,
      winner: null,
    });
  }

  tournament.rounds.push({
    roundNumber: 1,
    matches,
  });

  await tournament.save();
  return tournament;
}

/**
 * Advance winners to the next round
 */
export async function advanceWinners(tournamentId) {
  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) throw new Error("Turnering ikke funnet");

  const lastRound = tournament.rounds[tournament.rounds.length - 1];
  if (!lastRound) throw new Error("Ingen runder funnet");

  const winners = lastRound.matches
    .map((m) => m.winner)
    .filter((w) => w !== null);

  if (winners.length <= 1) {
    // tournament finished
    tournament.winner = winners[0] || null;
    await tournament.save();
    return tournament;
  }

  // shuffle winners before pairing
  for (let i = winners.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [winners[i], winners[j]] = [winners[j], winners[i]];
  }

  const nextMatches = [];

  for (let i = 0; i < winners.length; i += 2) {
    const p1 = winners[i];
    const p2 = winners[i + 1] || null;

    let matchId = null;

    if (p1 && p2) {
      const match = await Match.create({
        players: [
          { userId: p1, isAnonymous: false },
          { userId: p2, isAnonymous: false },
        ],
        variant: tournament.variant,
        tournamentId: tournament._id,
      });

      matchId = match._id;
    }

    nextMatches.push({
      matchId,
      player1: p1,
      player2: p2,
      winner: null,
    });
  }

  tournament.rounds.push({
    roundNumber: tournament.rounds.length + 1,
    matches: nextMatches,
  });

  await tournament.save();
  return tournament;
}

/**
 * Add a comment to a tournament
 */
export async function addComment(tournamentId, commentData) {
  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) throw new Error("Turnering ikke funnet");

  tournament.comments.push({
    user: commentData.user || null,
    text: commentData.text,
  });

  await tournament.save();
  return tournament;
}

/**
 * Get a single tournament
 */
export async function getTournamentById(tournamentId) {
  return Tournament.findById(tournamentId)
    .populate("participants", "username elo")
    .populate("winner", "username elo")
    .populate("rounds.matches.matchId")
    .populate("rounds.matches.player1", "username")
    .populate("rounds.matches.player2", "username")
    .populate("comments.user", "username");
}

/**
 * List tournaments (with filters + pagination)
 */
export async function listTournaments(filters, pagination) {
  const query = {};

  if (filters.variantRounds) query["variant.rounds"] = filters.variantRounds;

  const limit = pagination.limit || 20;
  const page = pagination.page || 1;

  return Tournament.find(query)
    .sort({ startTime: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("winner", "username");
}
