import mongoose, { mongo } from "mongoose";

const MatchInviteSchema = new mongoose.Schema({
    fromUser: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true
    }, 
    toUser: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true
    }, 
    category: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Category", 
        required: true
    }, 
    status: {
        type: String, 
        enum: ["pending", "accepted", "declined"], 
        default: "pending"
    }, 
    createdAt: {
        type: Date, 
        default: Date.now
    }
});

export const MatchInvite = mongoose.model("MatchInvite", MatchInviteSchema);