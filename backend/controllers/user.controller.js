
import { matchedData } from 'express-validator';
import userServices from "../services/user.services";
import usrData from "../seed/data/users.json"; // SWAP TO DATABASE IN FUTURE
import User from "../models/user.js";
import { checkPWD } from "../utils/hash.js";

export async function getAllusers(req, res) {
    const users = await userServices.getAllUsers();
    res.json(users);
}

export async function getUser(req, res) {
    const uid = req.params.uid;
    const userObj = userServices.getAUser(uid);
    if (userObj) {
        res.json(userObj);
    } else {
        res.status(404).json({ error: "User not found" });
    }
}

// export function getProfile(req, res) {
//     const user = req.user;
//     res.json(user);
// };

export async function createUser(req, res) {
    const data = matchedData(req);

    const newUser = {
        username: data.username,
        pwd: data.password,
        email: data.email,
        dob: data.dob 
    };

    const newUserUID = await userServices.createUser(newUser);

    res.status(201).json({ uid: newUserUID });
}

export async function updateUser(req, res) {
    const uid = req.params.uid;
    const data = matchedData(req);

    const updatedUser = {
        username: data.username,
        pwd: data.password,
        email: data.email,
        dob: data.dob
    };

    const userUpdated = await userServices.updateUser(uid, updatedUser);

    if (userUpdated) {
        res.json({ message: "User updated successfully" });
    } else {
        res.status(404).json({ error: "User not found" });
    }
}

export async function loginUser(req, res) {
    const { username, password } = req.body;
    try {
        const user = await userServices.authenticateUser(username, password);
        if (user) {
            res.json({ message: "Login successful", user });
        } else {
            res.status(401).json({ error: "Invalid username or password" });
        }
    } catch (error) {
        res.status(500).json({ error: "An error occurred during login" });
    }
}

export async function deleteUser(req, res) {
    const uid = req.params.uid;
    const userDeleted = await userServices.deleteUser(uid);
    if (userDeleted) {
        res.json({ message: "User deleted successfully" });
    } else {
        res.status(404).json({ error: "User not found" });
    }
}

export default {
    getAllusers,
    // getProfile,
    getUser,
    createUser,
    updateUser,
    loginUser,
    deleteUser
}
