import mongoose from "mongoose";

const { Schema } = mongoose;

// one comment on a tournament
const commentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: false },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// one match inside a tournament round
const roundMatchSchema = new Schema({
  matchId: { type: Schema.Types.ObjectId, ref: "Match" },
  player1: { type: Schema.Types.ObjectId, ref: "User", required: false },
  player2: { type: Schema.Types.ObjectId, ref: "User", required: false },
  winner: { type: Schema.Types.ObjectId, ref: "User", required: false },
});

// one round in the knockout bracket
const roundSchema = new Schema({
  roundNumber: { type: Number, required: true },
  matches: [roundMatchSchema],
});

const tournamentSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },

    // tournament variant (same structure as match variant)
    variant: {
      rounds: { type: Number, enum: [3, 5, 7], required: true },
      straightsAllowed: { type: Boolean, required: true },
      timeControl: { type: Number, enum: [5, 10, 15], required: true },
    },

    startTime: { type: Date, required: true },

    // players who joined
    participants: [{ type: Schema.Types.ObjectId, ref: "User" }],

    // knockout structure
    rounds: [roundSchema],

    // final winner
    winner: { type: Schema.Types.ObjectId, ref: "User", required: false },

    // trophy info
    trophy: {
      title: { type: String, required: true },
      imageUrl: { type: String, required: false }, // optional file upload
    },

    comments: [commentSchema],

    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true }, // admin
  },
  { timestamps: true }
);

export default mongoose.model("Tournament", tournamentSchema);
