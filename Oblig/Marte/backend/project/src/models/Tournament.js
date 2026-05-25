const mongoose = require("mongoose");

// Tournament schema, admin-created knockout tournaments
const tournamentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },

    // Tournament game settings, all games in this tournament use these
    variant: {
      rounds: {
        type: Number,
        enum: [3, 5, 7],
        required: true,
      },
      straightsAllowed: {
        type: Boolean,
        required: true,
      },
      timePerRound: {
        type: Number,
        enum: [5, 10, 15],
        required: true,
      },
    },

    // Admin who created the tournament
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["upcoming", "ongoing", "finished"],
      default: "upcoming",
    },

    startDate: {
      type: Date,
      required: true,
    },

    // Min and max number of participants
    minPlayers: {
      type: Number,
      required: true,
      min: 2,
    },
    maxPlayers: {
      type: Number,
      required: true,
    },

    // Users who have joined the tournament
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Knockout rounds, each round contains a list of games
    rounds: [
      {
        roundNumber: Number,
        games: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Game",
          },
        ],
      },
    ],

    // Winner of the whole tournament
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Trophy granted to the winner
    trophy: {
      title: {
        type: String,
        required: true,
      },
      image: {
        type: String, // file path to uploaded trophy image
      },
    },

    // Break time in minutes between rounds
    breakBetweenRounds: {
      type: Number,
      default: 10,
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

module.exports = mongoose.model("Tournament", tournamentSchema);
