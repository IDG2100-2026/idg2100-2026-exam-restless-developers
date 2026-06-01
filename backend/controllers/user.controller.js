import { matchedData } from "express-validator";
import userServices, {
  updateUser as updateUserService,
  deleteUser as deleteUserService,
} from "../services/user.services.js";
import { generateToken } from "../utils/jwt.js";

export async function getAllusers(req, res) {
  const users = await userServices.getAllUsers();
  res.json(users);
}

export async function getUser(req, res) {
  const uid = req.params.uid;
  const userObj = await userServices.getAUser(uid);

  if (userObj) {
    res.json(userObj);
  } else {
    res.status(404).json({ error: "User not found" });
  }
}

export async function createUser(req, res) {
  const data = matchedData(req);

  const newUser = {
    username: data.username,
    pwd: data.password,
    email: data.email,
    dob: data.dob,
    aboutMe: "",
    profileImage: "",
  };

  const result = await userServices.createUser(newUser);

  res.status(201).json(result);
}

export async function updateUser(req, res) {
  const uid = req.params.uid;
  const data = matchedData(req);

  const updatedUser = {
    password: data.password,
    email: data.email,
    aboutMe: data.aboutMe,
    profileImage: data.profileImage,
    dob: data.dob,
    role: data.role,
    isBanned: data.isBanned,
  };

  const userUpdated = await updateUserService(uid, updatedUser);

  if (userUpdated) {
    res.json({ message: "User updated successfully", user: userUpdated });
  } else {
    res.status(404).json({ error: "User not found" });
  }
}

export async function loginUser(req, res) {
  const { username, password } = req.body;

  try {
    const user = await userServices.authenticateUser(username, password);

    if (!user) {
      return res.status(401).json({
        error: "Invalid username or password",
      });
    }

    if (user.isBanned) {
        return res.status(403).json({
            error: "This account has been banned",
        });
    }

    const token = generateToken(user, req.ip);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        uid: user.uid,
        username: user.username,
        email: user.email,
        aboutMe: user.aboutMe,
        profileImage: user.profileImage,
        elo: user.elo,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "An error occurred during login",
    });
  }
}

export async function deleteUser(req, res) {
  const uid = req.params.uid;
  const userDeleted = await deleteUserService(uid);

  if (userDeleted) {
    res.json({ message: "User deleted successfully" });
  } else {
    res.status(404).json({ error: "User not found" });
  }
}

export default {
  getAllusers,
  getUser,
  createUser,
  updateUser,
  loginUser,
  deleteUser,
};