import Match from "../models/match.js";
import User from "../models/users.js";
import mongoose from "mongoose";

function isFiniteNumber(value) {
  return Number.isFinite(Number(value));
}

async function resolveUserObjectId({ uid, userId }) {
  if (isFiniteNumber(uid)) {
    const user = await User.findOne({ uid: Number(uid) }).select("_id");
    if (!user) {
      throw new Error("Bruker ikke funnet");
    }
    return user._id;
  }

  if (isFiniteNumber(userId)) {
    const user = await User.findOne({ uid: Number(userId) }).select("_id");
    if (!user) {
      throw new Error("Bruker ikke funnet");
    }
    return user._id;
  }

  if (mongoose.Types.ObjectId.isValid(userId)) {
    const user = await User.findById(userId).select("_id");
    if (!user) {
      throw new Error("Bruker ikke funnet");
    }
    return user._id;
  }

  throw new Error("Ugyldig bruker-id");
}

async function populateMatch(matchOrId) {
  const id = matchOrId?._id || matchOrId;
  return Match.findById(id)
    .populate("players.userId", "uid username elo -_id")
    .populate("comments.user", "uid username -_id")
    .populate("winner", "uid username elo -_id")
    .populate("loser", "uid username elo -_id");
}

async function normalizePlayers(players = []) {
  const normalized = [];

  for (const player of players) {
    if (player?.isAnonymous) {
      normalized.push({
        isAnonymous: true,
        nickname: player.nickname,
      });
      continue;
    }

    const resolvedUserId = await resolveUserObjectId({
      uid: player?.uid,
      userId: player?.userId,
    });

    normalized.push({
      userId: resolvedUserId,
      isAnonymous: false,
    });
  }

  return normalized;
}

export async function createMatch(data) {
  const normalizedPlayers = await normalizePlayers(Array.isArray(data?.players) ? data.players : []);

  const created = await Match.create({
    players: normalizedPlayers,
    variant: data.variant,
    isAnonymousMatch: !!data.isAnonymousMatch,
  });

  return populateMatch(created._id);
}

export async function joinMatch(matchId, data) {
  const match = await Match.findById(matchId);
  if (!match) {
    throw new Error("Kamp ikke funnet");
  }

  const nickname = String(data?.nickname || "Guest").trim();
  let player = { isAnonymous: true, nickname };

  if (isFiniteNumber(data?.uid) || isFiniteNumber(data?.userId) || mongoose.Types.ObjectId.isValid(data?.userId)) {
    const resolvedUserId = await resolveUserObjectId({ uid: data?.uid, userId: data?.userId });
    player = { userId: resolvedUserId, isAnonymous: false };
  }

  match.players.push(player);
  await match.save();
  return populateMatch(match._id);
}

export async function saveMatchResult(matchId, data) {
  const match = await Match.findById(matchId);
  if (!match) {
    throw new Error("Kamp ikke funnet");
  }

  if (Array.isArray(data?.roundsData)) {
    match.roundsData = data.roundsData;
  }

  if (isFiniteNumber(data?.winnerUid) || isFiniteNumber(data?.winner)) {
    match.winner = await resolveUserObjectId({ uid: data?.winnerUid, userId: data?.winner });
  } else if (mongoose.Types.ObjectId.isValid(data?.winner)) {
    match.winner = await resolveUserObjectId({ userId: data?.winner });
  }

  if (isFiniteNumber(data?.loserUid) || isFiniteNumber(data?.loser)) {
    match.loser = await resolveUserObjectId({ uid: data?.loserUid, userId: data?.loser });
  } else if (mongoose.Types.ObjectId.isValid(data?.loser)) {
    match.loser = await resolveUserObjectId({ userId: data?.loser });
  }

  match.endedAt = new Date();
  await match.save();
  return populateMatch(match._id);
}

export async function addComment(matchId, data) {
  const match = await Match.findById(matchId);
  if (!match) {
    throw new Error("Kamp ikke funnet");
  }

  const text = String(data?.text || "").trim();
  if (!text) {
    throw new Error("Kommentaren kan ikke være tom");
  }

  let commentUser = null;
  if (isFiniteNumber(data?.uid) || isFiniteNumber(data?.user) || isFiniteNumber(data?.userId)) {
    commentUser = await resolveUserObjectId({ uid: data?.uid, userId: data?.userId ?? data?.user });
  } else if (mongoose.Types.ObjectId.isValid(data?.user)) {
    commentUser = await resolveUserObjectId({ userId: data?.user });
  }

  match.comments.push({
    user: commentUser,
    text,
  });

  await match.save();
  return populateMatch(match._id);
}

export function getMatchById(matchId) {
  return Match.findById(matchId)
    .populate("players.userId", "uid username elo -_id")
    .populate("comments.user", "uid username -_id")
    .populate("winner", "uid username elo -_id")
    .populate("loser", "uid username elo -_id");
}

export function listMatches(filters = {}, pagination = {}) {
  const query = {};

  if (filters.variantRounds) {
    query["variant.rounds"] = Number(filters.variantRounds);
  }

  if (filters.timeControl) {
    query["variant.timeControl"] = Number(filters.timeControl);
  }

  if (typeof filters.straightsAllowed !== "undefined" && filters.straightsAllowed !== "") {
    query["variant.straightsAllowed"] = String(filters.straightsAllowed) === "true";
  }

  if (filters.excludeAnonymous) {
    query.isAnonymousMatch = false;
  }

  const limit = Number(pagination.limit) || 20;
  const page = Number(pagination.page) || 1;

  return Match.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("players.userId", "uid username elo -_id")
    .populate("winner", "uid username elo -_id")
    .populate("loser", "uid username elo -_id");
}
