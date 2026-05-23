import express from "express";
import {
  getWins,
  getWinrate,
  getMatches,
} from "../controllers/leaderboard.controller.js";

const router = express.Router();

router.get("/wins", getWins);
router.get("/winrate", getWinrate);
router.get("/matches", getMatches);

export default router;
