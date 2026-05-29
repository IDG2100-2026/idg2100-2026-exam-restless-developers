import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";

import {
  getTournamentComments,
  createComment,
  getAllComments,
  deleteComment,
} from "../controllers/comment.controller.js";

const router = express.Router();

router.get("/", getAllComments);

router.get("/:tournamentId", getTournamentComments);

router.post("/:tournamentId", requireAuth, createComment);

router.delete("/:commentId", requireAuth, deleteComment);

export default router;