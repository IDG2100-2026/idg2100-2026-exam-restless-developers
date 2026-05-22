import express from "express";
import { isAdmin } from "../middleware/auth.js";
import {
    getComments, 
    createComment, 
    deleteComment
} from "../controllers/commentController.js";

const router = express.Router();

router.get("/", getComments);
router.post("/", createComment);
router.delete("/:id", isAdmin, deleteComment);

export default router; 