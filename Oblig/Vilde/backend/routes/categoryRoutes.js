import express from "express";
import {
    getCategories, 
    createCategory,
    getCategoryById,
    deleteCategory
} from "../controllers/categoryController.js";

const router = express.Router();

router.get("/", getCategories);
router.post("/", createCategory);
router.get("/:id", getCategoryById);
router.delete("/:id", deleteCategory);

export default router;