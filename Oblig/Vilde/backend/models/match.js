import mongoose from "mongoose";

const MatchSchema = new mongoose.Schema({
    createdBy: { //NEW CODE OBLIG 3
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        default: null
    },
    players: [
        {
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User", 
            required: true, 
        },
    ],
    maxPlayers: {
        type: Number, 
        default: 2
    },
    status:{
        type: String, 
        enum: ["waiting", "in_progress", "finished"],
        default: "waiting"
    },
    allowAnonymousPlayers: {
        type: Boolean,
        default: true
    },
    minElo: {
        type: Number,
        default: 0
    },
    maxElo: {
        type: Number, 
        default: 3000
    }, //NEW CODE ENDS HERE
    rounds: [
        {
            roundNumber: Number, 
            rolls: [
                {
                    dice: [
                        {
                            type: String, 
                            enum: ["7", "8", "J", "Q", "K", "A"]
                        }
                    ], 
                    holds: [Boolean], 
                    timestamp: Date
                }
            ],
            result: String, 
        },
    ],
    winner: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
        default: null
    },
    createdAt: {
        type: Date, 
        default: Date.now, 
    },
    isAnonymous: {
        type: Boolean, 
        default: false
    }, 
    category: {
        type: mongoose.Schema.Types. ObjectId, 
        ref: "Category", 
        required: true
    },
    eloBefore: {
        type: Map, 
        of: Number
    },
    eloAfter: {
        type: Map, 
        of: Number
    } , 
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Comment"
        }
    ],
    startedAt: {
        type: Date, 
        default: Date.now
    }, 
    endedAt: {
        type: Date, 
        default: null
    }
});

export const Match =  mongoose.model("Match", MatchSchema);