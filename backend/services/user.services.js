import User from "../models/user.js";
import UserActivation from "../models/userActivation.model.js";
import { hashPWD, checkPWD } from "../utils/hash.js";

export async function getAllUsers() {
  return User.find().select("-pwd");
}

export async function getAUser(uid) {
  if (!uid) {
    return null;
  }

  if (/^[0-9a-fA-F]{24}$/.test(uid)) {
    return User.findById(uid).select("-pwd");
  }

  const numberId = Number(uid);
  if (!Number.isNaN(numberId)) {
    return User.findOne({ uid: numberId }).select("-pwd");
  }

  return User.findOne({ username: uid }).select("-pwd");
}

export async function createUser(usrObj) {
  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();

  const newUser = new User({
    uid: Math.floor(Math.random() * 1000000),
    username: usrObj.username,
    email: usrObj.email,
    pwd: hashPWD(usrObj.pwd),
    dob: usrObj.dob,
    isEmailVerified: false,
  });

  await newUser.save();

  await UserActivation.create({
    email: newUser.email,
    code: verificationCode,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
  });

  return {
    uid: newUser.uid,
    verificationCode,
  };
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




export async function verifyUserEmail(email, code) {
  const activation = await UserActivation.findOne({ email, code });

  if (!activation) {
    return { success: false, message: "Invalid verification code" };
  }

  if (activation.expiresAt < new Date()) {
    await UserActivation.deleteOne({ email, code });
    return { success: false, message: "Verification code has expired" };
  }

  await User.findOneAndUpdate(
    { email },
    { isEmailVerified: true }
  );

  await UserActivation.deleteOne({ email, code });

  return { success: true, message: "Email verified successfully" };
}

export default {
  getAllUsers,
  getAUser,
  createUser,
  authenticateUser,
  checkuserExists,
  checkUsernameExists,
  verifyUserEmail,
};