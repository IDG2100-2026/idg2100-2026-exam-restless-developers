import express from "express";

import {
  getAllTournaments,
  getTournamentById,
} from "../controllers/tournament.controller.js";

const router = express.Router();

router.get("/", getAllTournaments);

router.get("/:id", getTournamentById);

export default router;