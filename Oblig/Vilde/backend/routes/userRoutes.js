import express from "express";
import { isAdmin } from "../middleware/auth.js";

import {
    getUsers, 
    getUserById, 
    createUser, 
    loginUser,
    updateUser,
    deleteUser, 
    getLeaderboard, 
    getPlatformActivity,
    banUser
} from "../controllers/userController.js";

const router = express.Router();

router.get("/", getUsers);
router.get("/leaderboard", getLeaderboard);
router.get("/activity",getPlatformActivity); 
router.post("/", createUser);
router.post("/login", loginUser);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", isAdmin, deleteUser);
router.put("/:id/ban", isAdmin, banUser);

export default router;

