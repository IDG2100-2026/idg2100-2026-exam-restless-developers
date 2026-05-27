import express from "express";
import { createMatch, getMatch, joinMatch, endTurn, startNextRound, rollDice } from "../controllers/match.controller.js";

const router = express.Router();

router.post("/", createMatch);
router.get("/:id", getMatch);
router.post("/:id/join", joinMatch);
router.post("/:id/end-turn", endTurn);
router.post("/:id/next-round", startNextRound);
router.post("/:id/roll", rollDice);

export default router;
