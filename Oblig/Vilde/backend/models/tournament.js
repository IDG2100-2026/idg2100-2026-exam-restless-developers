import mongoose, { mongo } from "mongoose";

const TournamentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true, 
    },
    description: {
        type: String, 
        default: ""
    },
    players: [
        {
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User",
        },
    ],
    rounds: [
        {
            roundNumber: Number, 
            matches: [
                {
                    type: mongoose.Schema.Types.ObjectId, 
                    ref: "Match",
                },
            ],
            byePlayers: [
                {
                    type: mongoose.Schema.Types.ObjectId, 
                    ref: "User",
                },
            ],
        },
    ],
    status: {
        type: String, 
        enum: ["pending", "ongoing", "finished"],
        default: "pending"
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true 
    },
    trophy: {
        title: {type: String, required: true}, 
        image: {type: String, required: true}
    }, 
    startTime: {
        type: Date, 
        required: true 
    }, 
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId, 
            ref:"Comment"
        }
    ], 
    winner: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
        default: null
    },
    createdAt: {
        type: Date, 
        default: Date.now
    }

});

export const Tournament = mongoose.model("Tournament", TournamentSchema);