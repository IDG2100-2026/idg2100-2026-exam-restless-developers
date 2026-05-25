const Comment = require("../models/Comment");
const Game = require("../models/Game");
const Tournament = require("../models/Tournament");

//add a comment to a game or tournament
const addComment = async (req, res) => {
  try {
    const { content, gameId, tournamentId } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Comment content is required" });
    }

    // must belong to either a game or tournament, not both, not neither
    if (!gameId && !tournamentId) {
      return res
        .status(400)
        .json({ error: "A gameId or tournamentId is required" });
    }
    if (gameId && tournamentId) {
      return res.status(400).json({
        error: "A comment cannot belong to both a game and a tournament",
      });
    }

    // need to verify the game or tournament exists
    if (gameId) {
      const game = await Game.findById(gameId);
      if (!game) return res.status(404).json({ error: "Game not found" });
    }
    if (tournamentId) {
      const tournament = await Tournament.findById(tournamentId);
      if (!tournament)
        return res.status(404).json({ error: "Tournament not found" });
    }

    const comment = await Comment.create({
      author: req.user?.userId || null,
      content,
      game: gameId || null,
      tournament: tournamentId || null,
    });

    // add a comment reference to the game or tournament
    if (gameId) {
      await Game.findByIdAndUpdate(gameId, {
        $push: { comments: comment._id },
      });
    }
    if (tournamentId) {
      await Tournament.findByIdAndUpdate(tournamentId, {
        $push: { comments: comment._id },
      });
    }

    await comment.populate("author", "username");

    res.status(201).json({ message: "Comment added", comment });
  } catch (err) {
    console.error("addComment error:", err);
    res.status(500).json({ error: "Failed to add comment" });
  }
};

// admin only: soft delete a comment
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true },
    );

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    res.json({ message: "Comment deleted", comment });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete comment" });
  }
};

// admin only: get all non-deleted comments with optional search
const getAllComments = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    const query = { isDeleted: false };

    // search by comment content
    if (search) {
      query.content = { $regex: search, $options: "i" };
    }

    const comments = await Comment.find(query)
      .populate("author", "username")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Comment.countDocuments(query);

    res.json({
      comments,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to get comments" });
  }
};

module.exports = { addComment, deleteComment, getAllComments };
