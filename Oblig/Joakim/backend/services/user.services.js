import User from "../models/users.js";
import { hashPWD } from "../utils/hash.js";

export function getAllUsers() {
    return [
        { name: "Test", uid: 1, status: "Jeg er bare en test.." },
        { name: "Test2", uid: 2, status: "Jeg er også bare en test.." }
    ];
}

export function getAUser(uid) {
    return { name: "Test", uid: Number(uid), status: "Jeg er bare en test.." };
}

export async function createUser(usrObj) {
    const newUser = new User({
        uid: Math.floor(Math.random() * 1000000), // Random UID
        username: usrObj.username,
        pwd: hashPWD(usrObj.pwd),        
        email: usrObj.email,
        dob: usrObj.dob
    });

    await newUser.save();
    return newUser.uid;           
}

export function checkUserExists(uid) {
    if (uid > 0 && uid < 100) {
        return true;
    }
    throw new Error(`Brukeren med ID: ${uid} eksisterer ikke.`);
}

export function checkUsernameExists(username) {
    if (username === "true") {
        return true;
    }
    return false;
}

export async function authenticateUser(username, password) {
    const user = await User.findOne({ username });
    if (!user) {
        throw new Error("Invalid username or password");
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
        throw new Error("Invalid username or password");
    }

    return { uid: user.uid, username: user.username, email: user.email };
}

export default {
    getAllUsers,
    getAUser,
    createUser,
    checkUserExists,
    checkUsernameExists,
    authenticateUser
};
