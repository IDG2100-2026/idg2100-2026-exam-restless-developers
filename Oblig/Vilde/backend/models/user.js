import mongoose from "mongoose";
import { DEFAULT_ELO_RATING_NUMBER } from "../config/constants.js";

const userSchema = new mongoose.Schema({
    username: {
        type: String, 
        required: true, 
        unique: true, 
    }, 
    email: {
        type: String, 
        required: true, 
        unique: true,
    },
    password: {
        type: String, 
        required: true,
    },
    age: {
        type: Number, 
        required: true, 
        min: 18,
    },
    role: {
        type: String, 
        enum: ["anonymous", "user", "admin"], 
        default: "user"
    },
    elo: {
        type: Number, 
        default: DEFAULT_ELO_RATING_NUMBER, 
    }, 
    elo3sec: { //ADDED FOR OBLIG 3
        type: Number, 
        default: DEFAULT_ELO_RATING_NUMBER,
    },
    elo10sec: { //ADDED FOR OBLIG 3
        type: Number, 
        default: DEFAULT_ELO_RATING_NUMBER,
    },
    elo30sec: { //ADDED FOR OBLIG 3
        type: Number, 
        default: DEFAULT_ELO_RATING_NUMBER,
    },
    eloChangeLastWeek: {
        type: Number, 
        default: 0
    },
    stats: {
        wins: {type: Number, default: 0}, 
        losses: {type: Number, default: 0}, 
    }, 
    winsLastMonth: {
        type: Number, default: 0
    },
    lossesLastMonth: { 
        type: Number, default: 0
    },
    recentGames: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Match",
        }
    ],
    trophies: [
        {
            title: String,
            image: String,
        }
    ],
    playedMatches:[
        {
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Match", 
        },
    ],
    joinedTournaments:[
        {
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Tournament"
        },
    ],
    lastActiveAt: {
        type: Date, 
        default: Date.now
    }, 
    isBanned: {
        type: Boolean, 
        default: false
    },
    aboutMe: { //ADDED IN OBLIG 3
        type: String,
        default: "",
        trim: true,
        maxlength: 500,
    },
    profileImage: { //ADDED IN OBLIG 3
        type: String, 
        default: "",
    },
});


userSchema.virtual("winPercentage").get(function () {
    const total = this.stats.wins + this.stats.losses;
    if(total === 0) return 0;
    return (this.stats.wins / total) * 100;
});

export const User = mongoose.model("User", userSchema);

