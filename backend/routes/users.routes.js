import express from "express";
import userController from "../controllers/user.controller.js";

import {
  validateUserId,
  validateCreateUser,
  validateLoginUser,
} from "../validator/user.validator.js";

const router = express.Router();

router.get("/", userController.getAllusers);

router.get(
  "/:uid",
  validateUserId(),
  userController.getUser
);

router.post(
  "/",
  validateCreateUser(),
  userController.createUser
);

router.post(
  "/login",
  validateLoginUser(),
  userController.loginUser
);

router.post("/verify", userController.verifyUserEmail);

router.put("/:uid", userController.updateUser);
router.delete("/:uid", userController.deleteUser);

export default router;