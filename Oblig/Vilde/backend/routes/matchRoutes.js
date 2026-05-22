import express from "express";
import {
    getMatches, 
    getMatchById, 
    createMatch,
    joinMatch, 
    addRound, 
    finishMatch,
    deleteMatch,
    getLobbyMatches
} from "../controllers/matchController.js";

const router = express.Router();

router.get("/", getMatches);
router.get("/lobby", getLobbyMatches); //NEW FOR OBLIG 3
router.get("/:id", getMatchById);
router.post("/", createMatch);
router.put("/:id/join", joinMatch);
router.put("/:id/round", addRound);
router.put("/:id/finish", finishMatch);
router.delete("/:id", deleteMatch);

export default router;