import User from "../models/user.js";
import { checkPWD } from "../utils/hash.js";

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
  const newUser = new User({
    uid: Math.floor(Math.random() * 1000000),
    username: usrObj.username,
    email: usrObj.email,
    pwd: usrObj.pwd,
    dob: usrObj.dob,
  });

  await newUser.save();
  return {
    uid: newUser.uid,
    username: newUser.username,
    email: newUser.email,
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




export default {
  getAllUsers,
  getAUser,
  createUser,
  authenticateUser,
  checkuserExists,
  checkUsernameExists,
};