import express from "express";

import { getAdminDashboard } from "../controllers/admin.controller.js";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/dashboard", requireAuth, requireAdmin, getAdminDashboard);

export default router;