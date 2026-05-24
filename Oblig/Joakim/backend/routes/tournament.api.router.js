import express from "express";
import {
  createTournament,
  joinTournament,
  generateFirstRound,
  advanceWinners,
  addComment,
  getTournamentById,
  listTournaments,
} from "../controllers/tournament.controller.js";

const router = express.Router();

// create tournament
router.post("/", createTournament);

// join tournament
router.post("/:id/join", joinTournament);

// generate first round (random pairing)
router.post("/:id/rounds/first", generateFirstRound);

// move winners to next round
router.post("/:id/rounds/advance", advanceWinners);

// add comment
router.post("/:id/comments", addComment);

// list tournaments
router.get("/", listTournaments);

// get one tournament
router.get("/:id", getTournamentById);

export default router;
