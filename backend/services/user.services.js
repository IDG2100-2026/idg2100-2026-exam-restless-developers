import User from "../models/user.js";
import { hashPWD, checkPWD } from "../utils/hash.js";

export async function getAllUsers() {
    return User.find();
}

export async function getAUser(uid) {
    if (!uid) {
        return null;
    }

    if (/^[0-9a-fA-F]{24}$/.test(uid)) {
        return User.findById(uid);
    }

    const numberId = Number(uid);
    if (!Number.isNaN(numberId)) {
        return User.findOne({ uid: numberId });
    }

    return User.findOne({ username: uid });
}

export async function createUser(usrObj) {
    const newUser = new User({
        uid: Math.floor(Math.random() * 1000000),
        username: usrObj.username,
        email: usrObj.email,
        pwd: hashPWD(usrObj.pwd),
        dob: usrObj.dob,
    });

    await newUser.save();
    return newUser.uid;
}

export async function authenticateUser(username, password) {
    if (!username || !password) {
        return null;
    }

    const user = await User.findOne({ username });
    if (!user) {
        return null;
    }

    if (!checkPWD(password, user.pwd)) {
        return null;
    }

    return user.toObject();
}

export async function checkuserExists(uid) {
    return getAUser(uid);
}

export async function checkUsernameExists(username) {
    if (!username) throw new Error("Username is required");
    return User.findOne({ username });
}

export default {
    getAllUsers,
    getAUser,
    createUser,
    authenticateUser,
    checkuserExists,
    checkUsernameExists,
};