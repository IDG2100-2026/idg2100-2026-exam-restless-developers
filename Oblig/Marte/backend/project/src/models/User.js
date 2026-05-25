const mongoose = require("mongoose");

// User schema, covers registered users and admins
// Anonymous users are not stored in the database
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    age: {
      type: Number,
      required: true,
      min: 18, // minimum age requirement
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    eloRating: {
      type: Number,
      default: 1000,
    },
    // Separate Elo ratings per time control, required by the frontend assignment
    // Tracks performance in 5s, 10s and 15s time control variants separately
    eloByTimeControl: {
      five:    { type: Number, default: 1000 },
      ten:     { type: Number, default: 1000 },
      fifteen: { type: Number, default: 1000 },
    },
    // stores a snapshot of ELO rating each time it changes
    eloHistory: [
      {
        rating: Number,
        date: { type: Date, default: Date.now },
      },
    ],
    isBanned: {
      type: Boolean,
      default: false,
    },
    trophies: [
      {
        title: String,
        image: String, // file path to trophy image
        earnedAt: Date,
      },
    ],

    aboutMe: {
      type: String,
      default: '',
      maxlength: 500,
    },

    // Base64-encoded profile image, null if not set
    avatar: {
      type: String,
      default: null,
    },

    // Stores appearance preferences set in the frontend customizer
    // Saved here so preferences follow the user across devices
    preferences: {
      theme:      { type: String, default: 'system' },
      boardColor: { type: String, default: '#1e1e1e' },
      sound:      { type: Boolean, default: true },
      lobbySize:  { type: Number, default: 5 },
    },
  },
  {
    timestamps: true, // auto-adds createdAt and updatedAt fields
  },
);

module.exports = mongoose.model("User", userSchema);
