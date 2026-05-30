import express from "express";
import { listMatches, createMatch, getMatch, joinMatch, endTurn, startNextRound, rollDice } from "../controllers/match.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", listMatches);
router.post("/", createMatch);
router.get("/:id", getMatch);
router.post("/:id/join", requireAuth, joinMatch);
router.post("/:id/end-turn", requireAuth, endTurn);
router.post("/:id/next-round", requireAuth, startNextRound);
router.post("/:id/roll",requireAuth, rollDice);

export default router;
