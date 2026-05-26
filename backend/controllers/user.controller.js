import { matchedData } from "express-validator";
import userServices from "../services/user.services.js";
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
  };

  const result = await userServices.createUser(newUser);

  res.status(201).json(result);
}

export async function updateUser(req, res) {
  const uid = req.params.uid;
  const data = matchedData(req);

  const updatedUser = {
    username: data.username,
    pwd: data.password,
    email: data.email,
    dob: data.dob,
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

    if (!user) {
      return res.status(401).json({
        error: "Invalid username or password",
      });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        error: "Please verify your email before logging in.",
      });
    }

    const token = generateToken(user);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        uid: user.uid,
        username: user.username,
        email: user.email,
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
  const userDeleted = await userServices.deleteUser(uid);

  if (userDeleted) {
    res.json({ message: "User deleted successfully" });
  } else {
    res.status(404).json({ error: "User not found" });
  }
}



export async function verifyUserEmail(req, res) {
  const { email, code } = req.body;

  const result = await userServices.verifyUserEmail(email, code);

  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }

  res.json({ message: result.message });
}

export default {
  getAllusers,
  getUser,
  createUser,
  updateUser,
  loginUser,
  deleteUser,
  verifyUserEmail,
};