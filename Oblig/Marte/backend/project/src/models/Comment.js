const mongoose = require("mongoose");

// Comment schema. used for both game and tournament comments
const commentSchema = new mongoose.Schema(
  {
    // null for anonymous commenters
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    // A comment belongs to either a game or a tournament, not both
    // check in the controller that exactly one of these is set
    game: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Game",
      default: null,
    },
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      default: null,
    },

    // Soft delete, admins can delete comments
    // Keep the document but mark it as deleted
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Comment", commentSchema);
