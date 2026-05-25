import mongoose from "mongoose";

import {
  GAME_ROUNDS,
  TIME_CONTROLS,
  PLAYERS_PER_GAME,
  BUY_INS,
} from "../constants/tournament.constants.js";

export function validateTournamentId(req, res, next) {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Invalid tournament id",
    });
  }

  next();
}

export function validateJoinTournament(req, res, next) {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({
      message: "User id is required",
    });
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
      message: "Invalid user id",
    });
  }

  next();
}

export function validateCreateTournament(req, res, next) {
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

  if (!title || title.trim().length < 3 || title.trim().length > 80) {
    return res.status(400).json({
      message: "Title must be between 3 and 80 characters",
    });
  }

  if (
    !description ||
    description.trim().length < 10 ||
    description.trim().length > 2000
  ) {
    return res.status(400).json({
      message: "Description must be between 10 and 2000 characters",
    });
  }

  const parsedStartDate = new Date(startDate);

  if (!startDate || Number.isNaN(parsedStartDate.getTime())) {
    return res.status(400).json({
      message: "Valid start date is required",
    });
  }

  if (parsedStartDate <= new Date()) {
    return res.status(400).json({
      message: "Start date must be in the future",
    });
  }

  if (!gameVariant) {
    return res.status(400).json({
      message: "Game variant is required",
    });
  }

  const { straightsAllowed, rounds, timeControl, maxPlayersPerGame } =
    gameVariant;

  if (typeof straightsAllowed !== "boolean") {
    return res.status(400).json({
      message: "Straights allowed must be true or false",
    });
  }

  if (!GAME_ROUNDS.includes(Number(rounds))) {
    return res.status(400).json({
      message: `Rounds must be one of: ${GAME_ROUNDS.join(", ")}`,
    });
  }

  if (!TIME_CONTROLS.includes(Number(timeControl))) {
    return res.status(400).json({
      message: `Time control must be one of: ${TIME_CONTROLS.join(", ")}`,
    });
  }

  if (!PLAYERS_PER_GAME.includes(Number(maxPlayersPerGame))) {
    return res.status(400).json({
      message: `Players per game must be one of: ${PLAYERS_PER_GAME.join(", ")}`,
    });
  }

  if (Number(tournamentRounds) < 1 || Number(tournamentRounds) > 10) {
    return res.status(400).json({
      message: "Tournament rounds must be between 1 and 10",
    });
  }

  if (!BUY_INS.includes(Number(buyIn))) {
    return res.status(400).json({
      message: `Buy-in must be one of: ${BUY_INS.join(", ")}`,
    });
  }

  if (Number(maxPlayers) < 2 || Number(maxPlayers) > 64) {
    return res.status(400).json({
      message: "Max players must be between 2 and 64",
    });
  }

  if (!rules || rules.trim().length < 10 || rules.trim().length > 1500) {
    return res.status(400).json({
      message: "Rules must be between 10 and 1500 characters",
    });
  }

  if (minElo !== undefined && (Number(minElo) < 0 || Number(minElo) > 3000)) {
    return res.status(400).json({
      message: "Minimum Elo must be between 0 and 3000",
    });
  }

  if (maxElo !== undefined && (Number(maxElo) < 0 || Number(maxElo) > 3000)) {
    return res.status(400).json({
      message: "Maximum Elo must be between 0 and 3000",
    });
  }

  if (
    minElo !== undefined &&
    maxElo !== undefined &&
    Number(minElo) > Number(maxElo)
  ) {
    return res.status(400).json({
      message: "Minimum Elo cannot be higher than maximum Elo",
    });
  }

  if (trophy?.title && trophy.title.trim().length > 80) {
    return res.status(400).json({
      message: "Trophy title cannot be longer than 80 characters",
    });
  }

  if (trophy?.description && trophy.description.trim().length > 500) {
    return res.status(400).json({
      message: "Trophy description cannot be longer than 500 characters",
    });
  }

  if (trophy?.imageUrl && trophy.imageUrl.trim().length > 500) {
    return res.status(400).json({
      message: "Trophy image URL cannot be longer than 500 characters",
    });
  }

  next();
}