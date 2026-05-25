const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const { getLeaderboard } = require("../controllers/leaderboardController");

// apply auth middleware
router.use(auth);

// public route, anyone can see the leaderboard
router.get("/", getLeaderboard);

module.exports = router;
