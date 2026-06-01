import { matchedData } from "express-validator";
import userServices, {
  updateUser as updateUserService,
  deleteUser as deleteUserService,
} from "../services/user.services.js";
import { generateToken } from "../utils/jwt.js";
import User from "../models/user.js";
import UserActivation from "../models/userActivation.model.js";

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

export async function forgotPassword(req, res) {
  const { email } = req.body;

  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.json({
        message: "If this email exists, a reset link has been generated.",
      });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await UserActivation.deleteMany({ email: normalizedEmail });
    await UserActivation.create({
      email: normalizedEmail,
      code,
      expiresAt,
    });

    const encodedEmail = encodeURIComponent(normalizedEmail);
    const resetLink = `http://localhost:5173/reset-password?email=${encodedEmail}&code=${code}`;


    return res.json({
      message: "If this email exists, a reset link has been generated.",
      resetCode: code,
      resetLink,
      expiresAt,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Could not process forgot password request" });
  }
}

export async function resetPassword(req, res) {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    return res.status(400).json({ error: "Email, code and newPassword are required" });
  }

  if (String(newPassword).trim().length < 8) {
    return res.status(400).json({ error: "New password must be at least 8 characters" });
  }

  try {
    const normalizedEmail = String(email).trim().toLowerCase();
    const activation = await UserActivation.findOne({
      email: normalizedEmail,
      code: String(code).trim(),
    });

    if (!activation) {
      return res.status(400).json({ error: "Invalid reset code" });
    }

    if (activation.expiresAt.getTime() < Date.now()) {
      await UserActivation.deleteOne({ _id: activation._id });
      return res.status(400).json({ error: "Reset code expired" });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.pwd = String(newPassword).trim();
    await user.save();

    await UserActivation.deleteMany({ email: normalizedEmail });

    return res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Could not reset password" });
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
  forgotPassword,
  resetPassword,
  deleteUser,
};