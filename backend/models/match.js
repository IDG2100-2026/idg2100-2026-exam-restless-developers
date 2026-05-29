import mongoose from "mongoose";

const { Schema } = mongoose;

const roundSchema = new Schema({
    roundNumber: {
        type: Number,
        required: true,
    },
    rolls: [{
        type: Number,
        required: true,
    }],
    holds: [{
        type: [Boolean],
        required: true,
    }],
});

const matchSchema = new Schema({
    players: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: false },
        isAnonymous: { type: Boolean, default: false },
        nickname: { type: String, required: function () { return this.isAnonymous; } },
        dice: { type: [Number], default: [] },
        held: { type: [Boolean], default: [] },
        rollsLeft: { type: Number, default: 3 },
        roundWins: { type: Number, default: 0 },
      }
    ],

    status: { type: String, enum: ["waiting", "active", "finished"], default: "waiting" },
    maxPlayers: { type: Number, enum: [2, 3, 5], required: true },
    buyIn: { type: Number, enum: [1, 10, 50], default: 1 },
    currentTurn: { type: Schema.Types.ObjectId, ref: "User", required: false },
    currentRound: { type: Number, default: 1 },
    roundPending: { type: Boolean, default: false },
    lastRoundWinnerId: { type: Schema.Types.ObjectId, ref: "User", required: false },

    variant: {
        rounds: { type: Number, enum: [3, 5, 7], required: true },
        straightsAllowed: { type: Boolean, required: true },
        timeControl: { type: Number, enum: [10, 30, 90], required: true },
    },

    roundsData: [roundSchema],

    winner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: false,
    },
    loser: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: false,
    },
    winnerIsAnonymous: { type: Boolean, default: false },
    loserIsAnonymous: { type: Boolean, default: false },

    eloChange: {
        winnerDelta: { type: Number, default: 0 },
        loserDelta: { type: Number, default: 0 },
    },

    tournamentId: {
        type: Schema.Types.ObjectId,
        ref: "Tournament",
        required: false,
    },

    isAnonymousMatch: {
        type: Boolean,
        default: false,
    },
},
    { timestamps: true}

);

export default mongoose.model("Match", matchSchema);
