import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";

import {
  getAllTournaments,
  getTournamentById,
  joinTournament,
  leaveTournament,
  createTournament,
} from "../controllers/tournament.controller.js";

import {
  validateTournamentId,
  validateCreateTournament,
} from "../validator/tournament.validator.js";

const router = express.Router();

router.get("/", getAllTournaments);

router.post(
  "/",
  requireAuth,
  validateCreateTournament,
  createTournament
);

router.get(
  "/:id",
  validateTournamentId,
  getTournamentById
);

router.post(
  "/:id/players",
  requireAuth,
  validateTournamentId,
  joinTournament
);

router.delete(
  "/:id/players",
  requireAuth,
  validateTournamentId,
  leaveTournament
);

export default router;