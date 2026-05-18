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
})

const matchSchema = new Schema({
    players: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: false },
        isAnonymous: { type: Boolean, default: false },
        nickname: { type: String, required: function () { return this.isAnonymous; } }
      }
    ],

    variant: {
        rounds: {type: Number, enum: [1, 3, 5], required: true},
        straightsAllowed: {type: Boolean, required: true},
        timeControl: {type: String, enum: ["blitz", "rapid", "classical"], required: true},
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
    winnerIsAnonymous: { 
        type: Boolean, 
        default: false 
    },
    loserIsAnonymous: { 
        type: Boolean, 
        default: false 
    },

        eloChange: {
            winnerDelta: {
                type: Number,
                default: 0
            },
            loserDelta: {
                type: Number,
                default: 0
            }
        },

        tournamentId: { 
            type: Schema.Types.ObjectId, 
            ref: "Tournament", 
            required: false 
        },

        isAnonymousMatch: {
            type: Schema.Types.ObjectId, ref: "Tournament",
            required: false
        }
        
});

export default mongoose.model("Match", matchSchema);
