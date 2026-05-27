import express from "express";

import {
  getAllusers,
  getUser,
  createUser,
  loginUser,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";

import {
  validateUserId,
  validateCreateUser,
  validateLoginUser,
} from "../validator/user.validator.js";

const router = express.Router();

router.get("/", getAllusers);

router.get("/:uid", validateUserId(), getUser);

router.post("/", validateCreateUser(), createUser);

router.post("/login", validateLoginUser(), loginUser);

router.put("/:uid", updateUser);

router.delete("/:uid", deleteUser);

export default router;