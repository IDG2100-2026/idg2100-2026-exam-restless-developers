import mongoose from "mongoose";

import {
  TOURNAMENT_STATUSES,
  GAME_ROUNDS,
  TIME_CONTROLS,
  PLAYERS_PER_GAME,
  BUY_INS,
} from "../constants/tournament.constants.js";

const { Schema } = mongoose;

const tournamentSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 80,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 2000,
    },

    status: {
      type: String,
      enum: TOURNAMENT_STATUSES,
      default: "upcoming",
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    nextRoundStart: {
      type: Date,
      default: null,
    },

    currentRound: {
      type: Number,
      default: 0,
      min: 0,
    },

    gameVariant: {
      straightsAllowed: {
        type: Boolean,
        required: true,
      },

      rounds: {
        type: Number,
        enum: GAME_ROUNDS,
        required: true,
      },

      timeControl: {
        type: Number,
        enum: TIME_CONTROLS,
        required: true,
      },

      maxPlayersPerGame: {
        type: Number,
        enum: PLAYERS_PER_GAME,
        required: true,
      },
    },

    tournamentRounds: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },

    rounds: [
      {
        roundNumber: {
          type: Number,
          required: true,
          min: 1,
        },

        status: {
          type: String,
          enum: ["pending", "active", "completed"],
          default: "pending",
        },

        pairings: [
          {
            players: [
              {
                type: Schema.Types.ObjectId,
                ref: "User",
              },
            ],

            winner: {
              type: Schema.Types.ObjectId,
              ref: "User",
              default: null,
            },

            pointsAwarded: {
              type: Number,
              default: 0,
              min: 0,
            },

            game: {
              type: Schema.Types.ObjectId,
              ref: "Game",
              default: null,
            },
          },
        ],

        startedAt: {
          type: Date,
          default: null,
        },

        completedAt: {
          type: Date,
          default: null,
        },
      },
    ],

    buyIn: {
      type: Number,
      enum: BUY_INS,
      required: true,
    },

    maxPlayers: {
      type: Number,
      required: true,
      min: 2,
      max: 64,
    },

    players: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    winner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    trophy: {
      title: {
        type: String,
        trim: true,
        default: "Tournament Trophy",
        maxlength: 80,
      },

      description: {
        type: String,
        trim: true,
        default: "",
        maxlength: 500,
      },

      imageUrl: {
        type: String,
        trim: true,
        default: "",
        maxlength: 500,
      },
    },

    rules: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1500,
    },

    minElo: {
      type: Number,
      default: 0,
      min: 0,
      max: 3000,
    },

    maxElo: {
      type: Number,
      default: 3000,
      min: 0,
      max: 3000,
    },

    standings: [
      {
        player: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },

        points: {
          type: Number,
          default: 0,
          min: 0,
        },

        wins: {
          type: Number,
          default: 0,
          min: 0,
        },

        losses: {
          type: Number,
          default: 0,
          min: 0,
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Tournament", tournamentSchema);