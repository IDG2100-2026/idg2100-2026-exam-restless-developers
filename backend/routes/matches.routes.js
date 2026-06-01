import express from "express";
import { listMatches, createMatch, getMatch, joinMatch, endTurn, startNextRound, rollDice, placeBet } from "../controllers/match.controller.js";

const router = express.Router();

router.get("/", listMatches);
router.post("/", createMatch);
router.get("/:id", getMatch);
router.post("/:id/join", joinMatch);
router.post("/:id/end-turn", endTurn);
router.post("/:id/next-round", startNextRound);
router.post("/:id/roll", rollDice);
router.post("/:id/bet", placeBet);

export default router;
