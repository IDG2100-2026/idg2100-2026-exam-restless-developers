import mongoose from "mongoose";

const { Schema } = mongoose;

// one round of the game
const roundSchema = new Schema({
  roundNumber: { type: Number, required: true },
  rolls: [{ type: [Number], required: true }], // each roll is an array of 5 dice
  holds: [{ type: [Boolean], required: true }], // which dice were held after each roll
});

// comments on a match
const commentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: false }, // null for anonymous
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// main Match schema
const matchSchema = new Schema(
  {
    players: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: false },
        isAnonymous: { type: Boolean, default: false },
        nickname: { type: String, required: function () { return this.isAnonymous; } }
      }
    ],

    // game variant (3 × 2 × 3 categories)
    variant: {
      rounds: { type: Number, enum: [3, 5, 7], required: true },
      straightsAllowed: { type: Boolean, required: true },
      timeControl: { type: Number, enum: [5, 10, 15], required: true }
    },

    // game progress
    roundsData: [roundSchema],

    // result
    winner: { type: Schema.Types.ObjectId, ref: "User", required: false },
    loser: { type: Schema.Types.ObjectId, ref: "User", required: false },
    winnerIsAnonymous: { type: Boolean, default: false },
    loserIsAnonymous: { type: Boolean, default: false },

    // ELO changes (only for like registered users)
    eloChange: {
      winnerDelta: { type: Number, default: 0 },
      loserDelta: { type: Number, default: 0 }
    },

    // comments
    comments: [commentSchema],

    // timestamps
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },

    // for tournaments (optional)
    tournamentId: { type: Schema.Types.ObjectId, ref: "Tournament", required: false },

    // anonymous matches should not appear in platform activity
    isAnonymousMatch: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model("Match", matchSchema);
