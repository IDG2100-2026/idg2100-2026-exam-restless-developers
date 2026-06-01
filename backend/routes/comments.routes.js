import express from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";

import {
  getTournamentComments,
  createComment,
  getAllComments,
  deleteComment,
  getMatchComments,
  createMatchComment,
} from "../controllers/comment.controller.js";

const router = express.Router();

router.get("/", getAllComments);

router.get("/match/:matchId", getMatchComments);
router.post("/match/:matchId", requireAuth, createMatchComment);

router.get("/:tournamentId", getTournamentComments);
router.post("/:tournamentId", requireAuth, createComment);

router.delete("/:commentId", requireAuth, requireAdmin, deleteComment);

export default router;