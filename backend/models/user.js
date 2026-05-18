import mongoose from "mongoose";
import { hashPWD } from "../utils/hash.js";

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
      Number.MAX_SAFE_INTERGER,
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
    // THIS IS TAKEN FROM https://emailregex.com/ || A friend suggested it to me and it seems to work pretty well. Public source of course.
    validate: {
      validator: async function (email) {
        const existing = await UserActivation.exists({ email });
        return !existing;
      },
      message:
        "This email is already in use for an account that has not been activated.",
    },
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
      message: `User must be between ${MIN_AGE} and ${MAX_AGE} years old. Either you are too young, or you are a troll.`,
      // Muligens forbedre meldingen xD
    },
  },

  // Er usikker på om jeg må gjøre DOB strengere eller ikke. Spørst veldig på hvordan vi skal gjøre det. Tror det holder med årstall?

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

userSchema.methods.comparePWD = async function (candidatePWD) {
  return await hashPWD.comparePWD(candidatePWD, this.pwd);
};
