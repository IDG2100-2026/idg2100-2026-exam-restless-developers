import express from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";


import {
  getAllTournaments,
  getTournamentById,
  joinTournament,
  leaveTournament,
  createTournament,
  startTournament,
  recordRoundResult,
} from "../controllers/tournament.controller.js";

import {
  validateTournamentId,
  validateCreateTournament,
} from "../validator/tournament.validator.js";

const router = express.Router();

router.get("/", getAllTournaments);

router.post("/", requireAuth, validateCreateTournament, createTournament);

router.get("/:id", validateTournamentId, getTournamentById);

router.post("/:id/players", requireAuth, validateTournamentId, joinTournament);

router.delete("/:id/players", requireAuth, validateTournamentId, leaveTournament);

router.post("/:id/start", requireAuth, requireAdmin, validateTournamentId, startTournament);

router.post("/:id/rounds/:roundNumber/results", requireAuth, requireAdmin, validateTournamentId, recordRoundResult);

export default router;