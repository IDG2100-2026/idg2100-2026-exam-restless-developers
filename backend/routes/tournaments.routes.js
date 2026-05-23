import express from "express";

import {
  getAllTournaments,
  getTournamentById,
  joinTournament,
} from "../controllers/tournament.controller.js";

const router = express.Router();
    
router.get("/", getAllTournaments);
router.get("/:id", getTournamentById);
router.post("/:id/players", joinTournament);


export default router;