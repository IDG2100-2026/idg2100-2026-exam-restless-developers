const express = require("express");
const router = express.Router();
const { auth, requireUser, requireAdmin } = require("../middleware/auth");
const {
  getAllUsers,
  getUserById,
  registerUser,
  loginUser,
  updateUser,
  banUser,
} = require("../controllers/userController");

// apply auth middleware to all user routes
router.use(auth);

// public routes, no login required
router.post("/register", registerUser);
router.post("/login", loginUser);

// protected routes, login required
router.get("/:id", getUserById);
router.patch("/:id", requireUser, updateUser);

// admin only routes
router.get("/", requireAdmin, getAllUsers);
router.patch("/:id/ban", requireAdmin, banUser);

module.exports = router;
