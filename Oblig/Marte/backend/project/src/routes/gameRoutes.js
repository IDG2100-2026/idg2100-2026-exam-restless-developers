const express = require("express");
const router = express.Router();
const { auth, requireUser } = require("../middleware/auth");
const {
  getAllGames,
  getGameById,
  createGame,
  joinGame,
  saveGameResult,
  getPlatformActivity,
} = require("../controllers/gameController");

// apply auth middleware to all game routes
router.use(auth);

// public routes, no login required
router.get("/activity", getPlatformActivity);
router.get("/", getAllGames);
router.get("/:id", getGameById);

// open to all users including anonymous
router.post("/", createGame);
router.post("/:id/join", joinGame);
router.patch("/:id/result", requireUser, saveGameResult);

module.exports = router;
