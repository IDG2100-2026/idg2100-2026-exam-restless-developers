import express from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";

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
  validateUpdateUser,
} from "../validator/user.validator.js";

const router = express.Router();

router.get("/", getAllusers);

router.get("/:uid", validateUserId(), getUser);

router.post("/", validateCreateUser(), createUser);

router.post("/login", validateLoginUser(), loginUser);

router.put("/:uid", requireAuth, validateUserId(), validateUpdateUser(), updateUser);

router.delete("/:uid", requireAuth, requireAdmin, deleteUser);

export default router;