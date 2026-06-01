import express from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";

import {
  getAllTournaments,
  getTournamentById,
  joinTournament,
  leaveTournament,
  createTournament,
  updateTournament,
  deleteTournament,
  recordRoundResult,
  createTournamentMatch,
} from "../controllers/tournament.controller.js";

import {
  validateTournamentId,
  validateCreateTournament,
} from "../validator/tournament.validator.js";

const router = express.Router();

router.get("/", getAllTournaments);

router.post("/", requireAuth, requireAdmin, validateCreateTournament, createTournament);

router.get("/:id", validateTournamentId, getTournamentById);

router.patch("/:id", requireAuth, requireAdmin, validateTournamentId, updateTournament);

router.delete("/:id", requireAuth, requireAdmin, validateTournamentId, deleteTournament);

router.post("/:id/players", requireAuth, validateTournamentId, joinTournament);

router.delete("/:id/players", requireAuth, validateTournamentId, leaveTournament);

router.post("/:id/matches", requireAuth, validateTournamentId, createTournamentMatch);

router.post(
  "/:id/rounds/:roundNumber/results",
  requireAuth,
  requireAdmin,
  validateTournamentId,
  recordRoundResult
);

export default router;