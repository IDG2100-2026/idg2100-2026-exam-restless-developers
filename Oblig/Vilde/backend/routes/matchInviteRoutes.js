import express from "express";

import {
    createInvite, 
    respondInvite
} from "../controllers/matchInviteController.js";

const router = express.Router();

router.post("/", createInvite);
router.put("/:id/respond", respondInvite);

export default router;