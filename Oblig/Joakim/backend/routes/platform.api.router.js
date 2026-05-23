import express from "express";
import { getPlatformActivity } from "../controllers/platform.controller.js";

const router = express.Router();

router.get("/", getPlatformActivity);

export default router;
