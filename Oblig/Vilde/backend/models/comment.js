import mongoose from "mongoose";

const comments = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true, 
    }, 
    text: {
        type: String, 
        required: true,
    },
    type: {
        type: String, 
        enum: ["match", "tournament"],
        required: true
    },
    match: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Match", 
        default: null, 
    },
    tournament: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Tournament", 
        default: null,
    }, 
    createdAt: {
        type: Date, 
        default: Date.now, 
    }, 
    isDeleted: {
        type: Boolean, 
        default: false
    }, 
    deletedAt: {
        type: Date, 
        default: null 
    }, 
    
});

export const Comment = mongoose.model("Comment", comments);