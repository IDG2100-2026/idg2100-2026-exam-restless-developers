import User from "../models/user.js";
import { checkPWD } from "../utils/hash.js";

function buildUserQuery(uid) {
  if (/^[0-9a-fA-F]{24}$/.test(uid)) {
    return { _id: uid };
  }

  const numberId = Number(uid);
  if (!Number.isNaN(numberId)) {
    return { uid: numberId };
  }

  return { username: uid };
}

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

export async function updateUser(uid, updatedData) {
  const query = buildUserQuery(uid);
  const user = await User.findOne(query);

  if (!user) {
    return null;
  }

  if (typeof updatedData.email !== "undefined") {
    user.email = updatedData.email;
  }

  if (typeof updatedData.aboutMe !== "undefined") {
    user.aboutMe = updatedData.aboutMe;
  }

  if (typeof updatedData.profileImage !== "undefined") {
    user.profileImage = updatedData.profileImage;
  }

  if (typeof updatedData.password !== "undefined" && updatedData.password) {
    user.pwd = updatedData.password;
  }

  if (typeof updatedData.dob !== "undefined") {
    user.dob = updatedData.dob;
  }

  if (typeof updatedData.role !== "undefined") {
    user.role = updatedData.role;
  }

  const savedUser = await user.save();
  const userObj = savedUser.toObject();
  delete userObj.pwd;

  return userObj;
}

export async function deleteUser(uid) {
  const query = buildUserQuery(uid);
  const deletedUser = await User.findOneAndDelete(query);
  return Boolean(deletedUser);
}




export default {
  getAllUsers,
  getAUser,
  createUser,
  authenticateUser,
  checkuserExists,
  checkUsernameExists,
  updateUser,
  deleteUser,
};