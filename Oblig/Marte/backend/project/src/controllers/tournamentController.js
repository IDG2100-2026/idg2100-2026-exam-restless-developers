const Tournament = require("../models/Tournament");
const Game = require("../models/Game");
const User = require("../models/User");

//  get all tournaments with pagination
const getAllTournaments = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status) query.status = status;

    const tournaments = await Tournament.find(query)
      .populate("createdBy", "username")
      .populate("participants", "username eloRating")
      .populate("winner", "username")
      .sort({ startDate: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Tournament.countDocuments(query);

    res.json({
      tournaments,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to get tournaments" });
  }
};

// get a single tournament with all games and standings
const getTournamentById = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate("createdBy", "username")
      .populate("participants", "username eloRating")
      .populate("winner", "username")
      .populate({
        path: "rounds.games",
        populate: [
          { path: "playerOne", select: "username" },
          { path: "playerTwo", select: "username" },
          { path: "winner", select: "username" },
        ],
      })
      .populate({
        path: "comments",
        populate: { path: "author", select: "username" },
      });

    if (!tournament) {
      return res.status(404).json({ error: "Tournament not found" });
    }

    // build standings, count wins per participant
    const standings = tournament.participants.map((participant) => {
      let wins = 0;
      tournament.rounds.forEach((round) => {
        round.games.forEach((game) => {
          if (
            game.winner &&
            game.winner._id.toString() === participant._id.toString()
          ) {
            wins++;
          }
        });
      });
      return { player: participant, wins };
    });

    // sort standings by wins descending
    standings.sort((a, b) => b.wins - a.wins);

    res.json({ tournament, standings });
  } catch (err) {
    console.error("getTournamentById error:", err);
    res.status(500).json({ error: "Failed to get tournament" });
  }
};

// admin only: create a tournament
const createTournament = async (req, res) => {
  try {
    const {
      title,
      description,
      rounds,
      straightsAllowed,
      timePerRound,
      startDate,
      minPlayers,
      maxPlayers,
      breakBetweenRounds,
      trophyTitle,
      trophyImage,
    } = req.body;

    if (
      !title ||
      !rounds ||
      straightsAllowed === undefined ||
      !timePerRound ||
      !startDate ||
      !minPlayers ||
      !maxPlayers ||
      !trophyTitle
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const tournament = await Tournament.create({
      title,
      description,
      variant: { rounds, straightsAllowed, timePerRound },
      createdBy: req.user.userId,
      startDate: new Date(startDate),
      minPlayers,
      maxPlayers,
      breakBetweenRounds: breakBetweenRounds || 10,
      trophy: {
        title: trophyTitle,
        image: trophyImage || null,
      },
    });

    res.status(201).json({ message: "Tournament created", tournament });
  } catch (err) {
    console.error("createTournament error:", err);
    res.status(500).json({ error: "Failed to create tournament" });
  }
};

// registered user joins a tournament
const joinTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({ error: "Tournament not found" });
    }

    if (tournament.status !== "upcoming") {
      return res
        .status(400)
        .json({ error: "This tournament is no longer open to join" });
    }

    if (tournament.participants.length >= tournament.maxPlayers) {
      return res.status(400).json({ error: "Tournament is full" });
    }

    // check if user already joined
    const alreadyJoined = tournament.participants.some(
      (p) => p.toString() === req.user.userId,
    );
    if (alreadyJoined) {
      return res
        .status(409)
        .json({ error: "You have already joined this tournament" });
    }

    tournament.participants.push(req.user.userId);
    await tournament.save();

    res.json({ message: "Joined tournament successfully", tournament });
  } catch (err) {
    res.status(500).json({ error: "Failed to join tournament" });
  }
};

// admin only: start tournament and create first round
const startTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({ error: "Tournament not found" });
    }

    if (tournament.status !== "upcoming") {
      return res
        .status(400)
        .json({ error: "Tournament has already started or finished" });
    }

    if (tournament.participants.length < tournament.minPlayers) {
      return res
        .status(400)
        .json({
          error: `Need at least ${tournament.minPlayers} players to start`,
        });
    }

    // randomly shuffle participants for first round pairing
    const shuffled = [...tournament.participants].sort(
      () => Math.random() - 0.5,
    );

    // pair players up, if its a odd number, last player gets a bye (advances automatically)
    const games = [];
    for (let i = 0; i < shuffled.length - 1; i += 2) {
      const game = await Game.create({
        playerOne: shuffled[i],
        playerTwo: shuffled[i + 1],
        variant: tournament.variant,
        status: "ongoing",
        tournament: tournament._id,
        isAnonymous: false,
      });
      games.push(game._id);
    }

    // add first round to tournament
    tournament.rounds.push({ roundNumber: 1, games });
    tournament.status = "ongoing";
    await tournament.save();

    res.json({ message: "Tournament started", tournament });
  } catch (err) {
    console.error("startTournament error:", err);
    res.status(500).json({ error: "Failed to start tournament" });
  }
};

// admin only: advance to next round
const nextRound = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id).populate(
      "rounds.games",
    );

    if (!tournament) {
      return res.status(404).json({ error: "Tournament not found" });
    }

    if (tournament.status !== "ongoing") {
      return res.status(400).json({ error: "Tournament is not ongoing" });
    }

    // get the latest round
    const currentRound = tournament.rounds[tournament.rounds.length - 1];

    // check all games in current round are finished
    const allFinished = currentRound.games.every(
      (g) => g.status === "finished",
    );
    if (!allFinished) {
      return res
        .status(400)
        .json({ error: "Not all games in current round are finished" });
    }

    // collect winners from current round
    let winners = currentRound.games.map((g) => g.winner).filter(Boolean);

    // if odd number of players in previous round, carry over the bye player
    if (
      tournament.participants.length % 2 !== 0 &&
      currentRound.roundNumber === 1
    ) {
      const playedIds = currentRound.games.flatMap((g) => [
        g.playerOne.toString(),
        g.playerTwo.toString(),
      ]);
      const byePlayer = tournament.participants.find(
        (p) => !playedIds.includes(p.toString()),
      );
      if (byePlayer) winners.push(byePlayer);
    }

    // if only one winner is left, the tournament is over
    if (winners.length === 1) {
      tournament.winner = winners[0];
      tournament.status = "finished";

      // award trophy to the winner
      await User.findByIdAndUpdate(winners[0], {
        $push: {
          trophies: {
            title: tournament.trophy.title,
            image: tournament.trophy.image,
            earnedAt: new Date(),
          },
        },
      });

      await tournament.save();
      return res.json({
        message: "Tournament finished!",
        winner: winners[0],
        tournament,
      });
    }

    // create next round games by pairing winners
    const shuffled = winners.sort(() => Math.random() - 0.5);
    const newGames = [];
    for (let i = 0; i < shuffled.length - 1; i += 2) {
      const game = await Game.create({
        playerOne: shuffled[i],
        playerTwo: shuffled[i + 1],
        variant: tournament.variant,
        status: "ongoing",
        tournament: tournament._id,
        isAnonymous: false,
      });
      newGames.push(game._id);
    }

    tournament.rounds.push({
      roundNumber: currentRound.roundNumber + 1,
      games: newGames,
    });
    await tournament.save();

    res.json({
      message: `Round ${currentRound.roundNumber + 1} started`,
      tournament,
    });
  } catch (err) {
    console.error("nextRound error:", err);
    res.status(500).json({ error: "Failed to advance to next round" });
  }
};

module.exports = {
  getAllTournaments,
  getTournamentById,
  createTournament,
  joinTournament,
  startTournament,
  nextRound,
};
