import express from "express";

import {
  getAllTournaments,
  getTournamentById,
  joinTournament,
  leaveTournament,
} from "../controllers/tournament.controller.js";

import {
  validateTournamentId,
  validateJoinTournament,
} from "../validators/tournament.validator.js";

const router = express.Router();

router.get("/", getAllTournaments);

router.get(
  "/:id",
  validateTournamentId,
  getTournamentById
);

router.post(
  "/:id/players",
  validateTournamentId,
  validateJoinTournament,
  joinTournament
);

router.delete(
  "/:id/players",
  validateTournamentId,
  validateJoinTournament,
  leaveTournament
);

export default router;