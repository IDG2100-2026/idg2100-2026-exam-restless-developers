import express from "express";
import userController from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", userController.getAllusers);
router.get("/:uid", userController.getUser);
router.post("/", userController.createUser);
router.post("/login", userController.loginUser);
router.put("/:uid", userController.updateUser);
router.delete("/:uid", userController.deleteUser);

export default router;
