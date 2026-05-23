import mongoose from "mongoose";

const {Schema} = mongoose;

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
            maxlength: 2000,
        }, 
        status: {
            type: String, 
            enum: ["upcoming", "ongoing", "finished", "cancelled"],
            default: "upcoming", 
            required: true, 
        }, 
        startDate: {
            type: Date, 
            required: true,
        },
        gameVariant: {
            straightsAllowed: {
                type: Boolean, 
                required: true,
            },
            rounds: {
                type: Number, 
                enum: [3, 5, 7],
                required: true,
            },
            timeControl: {
                type: Number, 
                enum: [10, 30, 90],
                required: true,
            },
            maxPlayersPerGame: {
                type: Number,
                enum: [2, 3, 5],
                required: true,
            },
        },
        tournamentRounds: {
            type: Number, 
            required: true,
            min: 1,
            max: 10,
        },
        buyIn: {
            type: Number,
            enum: [1, 10, 50],
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
            reuired: false,
        },
        trophy: {
            title: {
                type: String,
                default: "Tournament Trophy",
            },
            description: {
                type: String, 
                default: "",
            },
            imageUrl: {
                type: String,
                default: "",
            },
        },
        rules: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1500,
        },
        minElo: {
            type: Number, 
            default: 0,
        },
        maxElo: {
            type: Number,
            default: 3000,
        },
        standings: [
            {
                player: {
                    type: Schema.Types.ObjectId,
                    ref: "User",
                },
                points: {
                    type: Number,
                    default: 0,
                },
                wins: {
                    type: Number,
                    default: 0,
                },
                losses: {
                    type: Number,
                    default: 0,
                },
            },
        ],
    },
    {timestamps: true}
);

export default mongoose.model("Tournament", tournamentSchema);