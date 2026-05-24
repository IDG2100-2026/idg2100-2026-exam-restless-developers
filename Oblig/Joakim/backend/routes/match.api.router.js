import express from "express";
import {
  createMatch,
  joinMatch,
  saveMatchResult,
  addComment,
  getMatchById,
  listMatches,
} from "../controllers/match.controller.js";

// import { validateCreateMatch, validateJoinMatch, validateSaveResult, validateComment } from "../validator/match.validator.js";
// import validate from "../validator/validate.js";

const router = express.Router();

// create a new match
router.post(
  "/",
  // validateCreateMatch, validate,
  createMatch
);

// join an existing match
router.post(
  "/:id/join",
  // validateJoinMatch, validate,
  joinMatch
);

// save match result
router.post(
  "/:id/result",
  // validateSaveResult, validate,
  saveMatchResult
);

// add a comment to a match
router.post(
  "/:id/comments",
  // validateComment, validate,
  addComment
);

// get all matches (with filters + pagination)
router.get("/", listMatches);

// get a single match by id
router.get("/:id", getMatchById);

export default router;
