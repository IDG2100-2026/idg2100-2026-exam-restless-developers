const express = require("express");
const router = express.Router();
const { auth, requireUser, requireAdmin } = require("../middleware/auth");
const {
  getAllTournaments,
  getTournamentById,
  createTournament,
  joinTournament,
  startTournament,
  nextRound,
} = require("../controllers/tournamentController");

// apply auth middleware to all tournament routes
router.use(auth);

// public routes, no login required
router.get("/", getAllTournaments);
router.get("/:id", getTournamentById);

// registered users only
router.post("/:id/join", requireUser, joinTournament);

// admin only
router.post("/", requireAdmin, createTournament);
router.post("/:id/start", requireAdmin, startTournament);
router.post("/:id/nextround", requireAdmin, nextRound);

module.exports = router;
