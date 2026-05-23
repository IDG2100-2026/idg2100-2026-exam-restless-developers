// Inspired by IDG2100.backend.lt
// Nothing here is copy pasted, all is written and changed to fit my needs.

import { matchedData } from "express-validator";
import userServices from "../services/user.services.js";
import usrData from "../seed/data/users.json" with { type: "json" };
import User from "../models/users.js";
import { checkPWD } from "../utils/hash.js";

// GET all users
export async function getAllUsers(req, res) {
    const users = await userServices.getAllUsers();
    res.json(users);
}

// GET single user
export function getUser(req, res) {
    const uid = req.params.uid;
    console.log(`Henter brukere med ID:`, uid);
    const userObj = userServices.getAUser(uid);
    res.json({ msg: "En enkel bruker med ID: " + uid, ...userObj });
}

// GET user profile (future matches etc.)
export function getProfile(req, res) {
    res.json({ msg: "Alle tidligere kamper for brukeren: " + req.params.uid });
}

// CREATE user
export async function createUser(req, res) {
    const data = matchedData(req);

        console.log("matchedData:", data); 
        
    const newUser = {
        username: data.username,
        pwd: data.password,   // ← MAPPER password → pwd
        email: data.email,
        dob: data.dob
    };

    const newUserUID = await userServices.createUser(newUser);

    res.status(201).json({
        msg: "Bruker opprettet",
        newUserUID
    });
}

// UPDATE user (not implemented yet)
export function updateUser(req, res) {
    res.json({ msg: `Brukeren ${req.params.uid} har blitt oppdatert` });
}

// LOGIN user
export async function loginUser(req, res) {
    const { username, password } = req.body;
    try {
        const user = await userServices.authenticateUser(username, password);
        res.json({ message: "Login successful", user });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
}

export default {
    getAllUsers,
    getUser,
    getProfile,
    createUser,
    updateUser,
    loginUser
};
