const mongoose = require("mongoose");

// Game schema. Represents a single match between two players
const gameSchema = new mongoose.Schema(
  {
    // Players, stored as references to User documents
    // playerOne can be null if anonymous
    playerOne: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    playerTwo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Game variant settings
    variant: {
      rounds: {
        type: Number,
        enum: [3, 5, 7], // best of 3, 5, or 7
        required: true,
      },
      straightsAllowed: {
        type: Boolean,
        required: true,
      },
      timePerRound: {
        type: Number,
        enum: [5, 10, 15], // seconds per round
        required: true,
      },
    },

    status: {
      type: String,
      enum: ["waiting", "ongoing", "finished"],
      default: "waiting",
    },

    // Winner is null until game is finished
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Full record of what happened in the game
    result: {
      rolls: [mongoose.Schema.Types.Mixed], // array of roll data per round
      holds: [mongoose.Schema.Types.Mixed], // which dice were held each round
      finalHands: [String], // final hand name per round
    },

    // Which tournament this game belongs to (null if standalone)
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      default: null,
    },

    // Whether this was an anonymous game
    isAnonymous: {
      type: Boolean,
      default: false,
    },

    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Game", gameSchema);
