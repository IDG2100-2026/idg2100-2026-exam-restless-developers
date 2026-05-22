import mongoose from "mongoose";

const category = new mongoose.Schema({
    rounds: {
        type: Number, 
        enum: [3, 5, 7], 
        required: true
    },
    straightsAllowed: {
        type: Boolean, 
        required: true
    }, 
    timePerRound: {
        type: Number, 
        enum: [3, 10, 30], //Changed values
        required: true
    }, 
    label: {
        type: String
    }
});

category.pre("save", function () {
    this.label = `Best of ${this.rounds} | Straights ${this.straightsAllowed ? "allowed" : "not allowed"} | ${this.timePerRound}s`;
});

export const Category = mongoose.model("Category", category);