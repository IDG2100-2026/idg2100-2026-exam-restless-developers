import mongoose from "mongoose";
import { hashPWD } from "../utils/hash.js";

import {
    MIN_AGE,
    MAX_AGE,
    MAX_LENGTH_USERNAME,
    MIN_LENGTH_USERNAME,
    MAX_LENGTH_PWD,
    MIN_LENGTH_PWD,
    MAX_ELO_RATING,
    MIN_ELO_RATING,
} from "../config/constants.js";

const userSchema = new mongoose.Schema({

    uid: {
        type: Number,
        min: 0,
        max: [Number.MAX_SAFE_INTEGER, "Din ID kan ikke være lengere enn maks trygg integer"],
        index: true,
        required: true,
        unique: true
    },

    username: {
        type: String,
        trim: true,
        required: true,
        minLength: [MIN_LENGTH_USERNAME, `Brukernavnet kan ikke være kortere enn ${MIN_LENGTH_USERNAME}`],
        maxLength: [MAX_LENGTH_USERNAME, `Brukernavnet kan ikke være lengere enn ${MAX_LENGTH_USERNAME}`],
        match: [/^\w+$/, `Brukernavnet kan kun inneholde bokstaver og tall`]
    },

    pwd: {
        type: String,
        required: true,
        trim: true,
        minLength: [MIN_LENGTH_PWD, `Passordet må være minst ${MIN_LENGTH_PWD} tegn`],
        maxLength: [MAX_LENGTH_PWD, `Passordet kan ikke være lengere enn ${MAX_LENGTH_PWD} tegn`]
    },

    email: {
        type: String,
        required: true,
        trim: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, `Epostadressen er ikke gyldig`],

        validate: {
            validator: async function (email) {
                const existing = await User.exists({ email });
                return !existing;
            },
            message: `Epostadressen er allerede i bruk`
        }
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
            message: `Du må være eldre enn ${MIN_AGE - 1} og yngre enn ${MAX_AGE - 1}`
        }
    },

    elo: {
        type: Number,
        default: 1000,
        min: MIN_ELO_RATING,
        max: MAX_ELO_RATING
    },

    wins: {
        type: Number,
        default: 0
    },

    losses: {
        type: Number,
        default: 0
    },

    totalGames: {
        type: Number,
        default: 0
    }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return hashPWD(candidatePassword) === this.pwd;
};

const User = mongoose.model("User", userSchema);
export default User;
