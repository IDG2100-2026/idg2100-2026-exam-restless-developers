import express from "express";
import { isAdmin } from "../middleware/auth.js";
import {
    getTournaments, 
    getTournamentById, 
    createTournament, 
    joinTournament,
    startTournament,
    advanceTournament, 
} from "../controllers/tournamentController.js";

const router = express.Router();

router.get("/", getTournaments);
router.get("/:id", getTournamentById);
router.post("/", isAdmin, createTournament);
router.post("/:id/join", joinTournament);
router.post("/:id/start", isAdmin, startTournament);
router.post("/:id/advance", isAdmin, advanceTournament);

export default router;