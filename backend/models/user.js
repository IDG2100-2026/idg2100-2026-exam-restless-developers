import mongoose from "mongoose";
import { hashPWD, checkPWD } from "../utils/hash.js";

import {
  MIN_AGE,
  MAX_AGE,
  MIN_LENGTH_USERNAME,
  MAX_LENGTH_USERNAME,
  MIN_LENGTH_PWD,
  MAX_LENGTH_PWD,
  MAX_ELO_RATING,
  MIN_ELO_RATING,
} from "../config/constants.js";

const userSchema = new mongoose.Schema({
  uid: {
    type: Number,
    min: 0,
    max: [
      Number.MAX_SAFE_INTEGER,
      "Your ID cannot be longer than the max safe interger",
    ],
    index: true,
    required: true,
    unique: true,
  },

  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: [
      MIN_LENGTH_USERNAME,
      `Username must be at least ${MIN_LENGTH_USERNAME} characters`,
    ],
    maxlength: [
      MAX_LENGTH_USERNAME,
      `Username cannot be longer than ${MAX_LENGTH_USERNAME} characters`,
    ],
  },

  pwd: {
    type: String,
    required: true,
    trim: true,
    minlength: [
      MIN_LENGTH_PWD,
      `Password must be at least ${MIN_LENGTH_PWD} characters`,
    ],
    maxlength: [
      MAX_LENGTH_PWD,
      `Password cannot be longer than ${MAX_LENGTH_PWD} characters`,
    ],
  },

  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please fill in a valid email address",
    ],
  },

  role: {
    type: String,
    enum: ["user", "admin", "anonymous"],
    default: "user",
  },

  dob: {
    type: Number,
    required: true,
    validate: {
      validator: function (year) {
        const currentYear = new Date().getFullYear();
        const age = currentYear - year;
        return age >= MIN_AGE && age <= MAX_AGE;
      },
      message: `User must be between ${MIN_AGE} and ${MAX_AGE} years old.`,
    },
  },

  elo: {
    type: Number,
    required: true,
    default: 1000,
    min: [MIN_ELO_RATING, `ELO rating cannot be lower than ${MIN_ELO_RATING}`],
    max: [MAX_ELO_RATING, `ELO rating cannot be higher than ${MAX_ELO_RATING}`],
  },

  wins: {
    type: Number,
    default: 0,
  },

  losses: {
    type: Number,
    default: 0,
  },

  totalGames: {
    type: Number,
    default: 0,
  },
});

userSchema.pre("save", function () {
  if (this.isModified("pwd")) {
    this.pwd = hashPWD(this.pwd);
  }
});

userSchema.methods.comparePWD = async function (candidatePWD) {
  return checkPWD(candidatePWD, this.pwd);
};

export default mongoose.model("User", userSchema);
