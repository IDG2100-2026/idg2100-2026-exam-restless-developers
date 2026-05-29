import Comment from "../models/comment.js";
import Tournament from "../models/tournament.js";

export async function getTournamentComments(req, res) {
  try {
    const { tournamentId } = req.params;

    const comments = await Comment.find({
      tournament: tournamentId,
    })
      .sort({ createdAt: -1 })
      .populate("author", "username");

    res.status(200).json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch comments",
    });
  }
}

export async function createComment(req, res) {
  try {
    const { tournamentId } = req.params;
    const { content } = req.body;

    const tournament = await Tournament.findById(tournamentId);

    if (!tournament) {
      return res.status(404).json({
        message: "Tournament not found",
      });
    }

    if (!content?.trim()) {
      return res.status(400).json({
        message: "Comment content is required",
      });
    }

    const comment = await Comment.create({
      tournament: tournamentId,
      author: req.user._id,
      content: content.trim(),
    });

    const populatedComment = await Comment.findById(comment._id).populate(
      "author",
      "username"
    );

    const io = req.app.get("io");

    io.emit("new-tournament-comment", {
      tournamentId,
      comment: populatedComment,
    });

    res.status(201).json(populatedComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to create comment",
    });
  }
}

export async function getAllComments(req, res) {
  try {
    const comments = await Comment.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("author", "username email")
      .populate("tournament", "title");

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch comments",
    });
  }
}

export async function deleteComment(req, res) {
  try {
    const { commentId } = req.params;

    const deletedComment = await Comment.findByIdAndDelete(commentId);

    if (!deletedComment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    res.status(200).json({
      message: "Comment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete comment",
    });
  }
}