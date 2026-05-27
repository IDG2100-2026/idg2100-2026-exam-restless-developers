import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";

import {
  getTournamentComments,
  createComment,
} from "../controllers/comment.controller.js";

const router = express.Router();

router.get("/:tournamentId", getTournamentComments);

router.post("/:tournamentId", requireAuth, createComment);

export default router;