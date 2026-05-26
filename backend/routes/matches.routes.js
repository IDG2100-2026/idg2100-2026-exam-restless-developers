// Made by: marte kaland

import express from "express";
import {
  getAllMatches,
  getMatchById,
  createMatch,
  joinMatch,
  leaveMatch,
  addComment,
} from "../controllers/match.controller.js";

const router = express.Router();

router.get("/", getAllMatches);
router.get("/:id", getMatchById);
router.post("/", createMatch);
router.post("/:id/join", joinMatch);
router.delete("/:id/leave", leaveMatch);
router.post("/:id/comments", addComment);

export default router;
