// Made by: marte kaland

import Match from "../models/match.js";

export async function getAllMatches() {
  return Match.find({ status: "waiting" })
    .populate("players.userId", "username elo")
    .sort({ createdAt: -1 });
}

export async function getMatchById(id) {
  return Match.findById(id)
    .populate("players.userId", "username elo")
    .populate("winner", "username")
    .populate("comments.author", "username");
}

export async function createMatch(data) {
  const match = new Match({
    players: [],
    maxPlayers: data.maxPlayers,
    variant: {
      rounds: data.rounds,
      straightsAllowed: data.straightsAllowed,
      timeControl: data.timeControl,
    },
    buyIn: data.buyIn,
  });

  await match.save();
  return match;
}

export async function joinMatch(matchId, userId) {
  const match = await Match.findById(matchId);

  if (!match) return { error: "Match not found", status: 404 };
  if (match.status !== "waiting") return { error: "Game has already started", status: 400 };

  const alreadyJoined = match.players.some(
    (p) => p.userId?.toString() === userId
  );
  if (alreadyJoined) return { error: "You have already joined this game", status: 400 };

  if (match.players.length >= match.maxPlayers)
    return { error: "Game is full", status: 400 };

  match.players.push({ userId });

  if (match.players.length === match.maxPlayers) {
    match.status = "ongoing";
    match.startedAt = new Date();
  }

  await match.save();
  return { match };
}

export async function leaveMatch(matchId, userId) {
  const match = await Match.findById(matchId);

  if (!match) return { error: "Match not found", status: 404 };
  if (match.status !== "waiting") return { error: "Cannot leave a game that has already started", status: 400 };

  const isInMatch = match.players.some(
    (p) => p.userId?.toString() === userId
  );
  if (!isInMatch) return { error: "You are not in this game", status: 400 };

  match.players = match.players.filter(
    (p) => p.userId?.toString() !== userId
  );

  await match.save();
  return { match };
}

export async function addComment(matchId, userId, text) {
  const match = await Match.findById(matchId);
  if (!match) return { error: "Match not found", status: 404 };

  match.comments.push({ author: userId, text });
  await match.save();
  return { match };
}

export default {
  getAllMatches,
  getMatchById,
  createMatch,
  joinMatch,
  leaveMatch,
  addComment,
};
