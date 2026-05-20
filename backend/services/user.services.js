import User from "../models/users.js";
import { hashPWD } from "../utils/hash.js";


// Disse er IKKE ferdig på noen som helst måte, bare har den sånn vi husker å implementere den senere.
// This is in NO WAY SHAPE OR FORM finished, just have it like this so we remember to implement it later.

export function getAllUsers() {
    return User.findAll();
}

export function getAUser(uid) {
    return User.findByPk(uid);
}

export async function createUser(usrObj) {
    const newUser = new User({
        uid: Math.floor(Math.random() * 100000000),
        username: (usrObj.username),
        email: usrObj.email,
        pwd: hashPWD(usrObj.pwd)
    });

    await newUser.save();
    return newUser.uid;
}

export function checkuserExists(uid) {
    if (!uid) {
        throw new Error("User ID is required");
    }
    return User.findByPk(uid);
}

export function checkUsernameExists(username) {
    if (!username) {
        throw new Error("Username is required");
    }
    return User.findOne({ where: { username } });
};

export default {
    getAllUsers,
    getAUser,
    createUser,
    checkuserExists,
    checkUsernameExists
};