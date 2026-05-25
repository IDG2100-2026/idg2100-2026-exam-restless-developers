const Game = require("../models/Game");
const User = require("../models/User");
const Comment = require("../models/Comment");

//get all public games with filtering and pagination
const getAllGames = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status) query.status = status;

    const games = await Game.find(query)
      .populate("playerOne", "username eloRating")
      .populate("playerTwo", "username eloRating")
      .populate("winner", "username")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Game.countDocuments(query);

    res.json({
      games,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("getAllGames error:", err);
    res.status(500).json({ error: "Failed to get games" });
  }
};

// get a single game by the ID
const getGameById = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id)
      .populate("playerOne", "username eloRating")
      .populate("playerTwo", "username eloRating")
      .populate("winner", "username")
      .populate({
        path: "comments",
        populate: { path: "author", select: "username" },
      });

    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    res.json({ game });
  } catch (err) {
    console.error("getGameById error:", err);
    res.status(500).json({ error: "Failed to get game" });
  }
};

// create a new game and enter matchmaking queue
const createGame = async (req, res) => {
  try {
    const { rounds, straightsAllowed, timePerRound, isAnonymous } = req.body;

    if (!rounds || straightsAllowed === undefined || !timePerRound) {
      return res.status(400).json({
        error: "rounds, straightsAllowed and timePerRound are required",
      });
    }

    const game = await Game.create({
      playerOne: req.user?.userId || null,
      variant: { rounds, straightsAllowed, timePerRound },
      isAnonymous: isAnonymous || false,
      status: "waiting",
    });

    res
      .status(201)
      .json({ message: "Game created, waiting for opponent", game });
  } catch (err) {
    res.status(500).json({ error: "Failed to create game" });
  }
};

// join an existing waiting game
const joinGame = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    if (game.status !== "waiting") {
      return res
        .status(400)
        .json({ error: "This game is no longer available to join" });
    }

    // prevent a logged-in user from joining their own game
    if (req.user?.userId && game.playerOne && game.playerOne.toString() === req.user.userId) {
      return res.status(400).json({ error: "You cannot join your own game" });
    }

    game.playerTwo = req.user?.userId || null;
    game.status = "ongoing";
    await game.save();

    res.json({ message: "Joined game successfully", game });
  } catch (err) {
    res.status(500).json({ error: "Failed to join game" });
  }
};

// save the result of a finished game
const saveGameResult = async (req, res) => {
  try {
    const { winnerId, rolls, holds, finalHands } = req.body;

    const game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    if (game.status !== "ongoing") {
      return res.status(400).json({ error: "Game is not ongoing" });
    }

    // update game with results
    game.status = "finished";
    game.winner = winnerId;
    game.result = { rolls, holds, finalHands };
    await game.save();

    // update ELO ratings for registered players
    if (!game.isAnonymous && game.playerOne && game.playerTwo) {
      await updateElo(game.playerOne, game.playerTwo, winnerId, game.variant.timePerRound);
    }

    res.json({ message: "Game result saved", game });
  } catch (err) {
    res.status(500).json({ error: "Failed to save game result" });
  }
};

// maps timePerRound value to the eloByTimeControl field name
const timeControlKey = (timePerRound) => {
  if (timePerRound === 5)  return "five";
  if (timePerRound === 10) return "ten";
  return "fifteen";
};

// helper function to update ELO ratings after a game
// updates both the overall eloRating and the per-time-control rating
// based on the standard ELO rating algorithm
const updateElo = async (playerOneId, playerTwoId, winnerId, timePerRound) => {
  const playerOne = await User.findById(playerOneId);
  const playerTwo = await User.findById(playerTwoId);

  const k = 32; // K-factor controls how much ratings change per game
  const tcKey = timeControlKey(timePerRound);

  // expected scores based on current overall ratings
  const expectedOne =
    1 / (1 + Math.pow(10, (playerTwo.eloRating - playerOne.eloRating) / 400));
  const expectedTwo =
    1 / (1 + Math.pow(10, (playerOne.eloRating - playerTwo.eloRating) / 400));

  // actual scores - 1 for win, 0 for loss
  const scoreOne = winnerId.toString() === playerOneId.toString() ? 1 : 0;
  const scoreTwo = winnerId.toString() === playerTwoId.toString() ? 1 : 0;

  // update overall ratings
  playerOne.eloRating = Math.round(
    playerOne.eloRating + k * (scoreOne - expectedOne),
  );
  playerTwo.eloRating = Math.round(
    playerTwo.eloRating + k * (scoreTwo - expectedTwo),
  );

  // update per-time-control ratings using the same algorithm
  const tcExpectedOne = 1 / (1 + Math.pow(10, (playerTwo.eloByTimeControl[tcKey] - playerOne.eloByTimeControl[tcKey]) / 400));
  const tcExpectedTwo = 1 / (1 + Math.pow(10, (playerOne.eloByTimeControl[tcKey] - playerTwo.eloByTimeControl[tcKey]) / 400));
  playerOne.eloByTimeControl[tcKey] = Math.round(playerOne.eloByTimeControl[tcKey] + k * (scoreOne - tcExpectedOne));
  playerTwo.eloByTimeControl[tcKey] = Math.round(playerTwo.eloByTimeControl[tcKey] + k * (scoreTwo - tcExpectedTwo));

  // save updated ratings with timestamp for weekly change tracking
  playerOne.eloHistory.push({ rating: playerOne.eloRating, date: new Date() });
  playerTwo.eloHistory.push({ rating: playerTwo.eloRating, date: new Date() });

  await playerOne.save();
  await playerTwo.save();
};

// platform activity summary
const getPlatformActivity = async (req, res) => {
  try {
    // count ongoing games (non-anonymous only)
    const ongoingGames = await Game.countDocuments({
      status: "ongoing",
      isAnonymous: false,
    });

    // count active users this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const activeUsers = await Game.distinct("playerOne", {
      createdAt: { $gte: oneWeekAgo },
      isAnonymous: false,
    });

    // last 10 finished public games
    const recentGames = await Game.find({
      status: "finished",
      isAnonymous: false,
    })
      .populate("playerOne", "username")
      .populate("playerTwo", "username")
      .populate("winner", "username")
      .sort({ updatedAt: -1 })
      .limit(10);

    res.json({
      ongoingGames,
      activeUsersThisWeek: activeUsers.length,
      recentGames,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to get platform activity" });
  }
};

module.exports = {
  getAllGames,
  getGameById,
  createGame,
  joinGame,
  saveGameResult,
  getPlatformActivity,
};
