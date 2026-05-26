// Made by: marte kaland
// Contains code from Joakim's oblig3 (roundSchema, commentSchema, match structure)

import mongoose from "mongoose";

const { Schema } = mongoose;

// From Joakim's oblig3
const commentSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: "User", required: false },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// From Joakim's oblig3
const roundSchema = new Schema({
  roundNumber: { type: Number, required: true },
  rolls: [{ type: [Number] }],
  holds: [{ type: [Boolean] }],
});

const matchSchema = new Schema(
  {
    players: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: false },
        isAnonymous: { type: Boolean, default: false },
        nickname: { type: String },
      },
    ],

    maxPlayers: {
      type: Number,
      enum: [2, 3, 5],
      required: true,
    },

    status: {
      type: String,
      enum: ["waiting", "ongoing", "finished"],
      default: "waiting",
    },

    variant: {
      rounds: { type: Number, enum: [3, 5, 7], required: true },
      straightsAllowed: { type: Boolean, required: true },
      timeControl: { type: Number, enum: [10, 30, 90], required: true },
    },

    buyIn: {
      type: Number,
      enum: [1, 10, 50],
      required: true,
    },

    roundsData: [roundSchema],

    winner: { type: Schema.Types.ObjectId, ref: "User", required: false },

    eloChanges: {
      type: Map,
      of: Number,
      default: {},
    },

    comments: [commentSchema],

    tournamentId: {
      type: Schema.Types.ObjectId,
      ref: "Tournament",
      required: false,
    },

    startedAt: { type: Date },
    endedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Match", matchSchema);
