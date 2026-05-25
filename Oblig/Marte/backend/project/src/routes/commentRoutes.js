const express = require("express");
const router = express.Router();
const { auth, requireAdmin } = require("../middleware/auth");
const {
  addComment,
  deleteComment,
  getAllComments,
} = require("../controllers/commentController");

// apply auth middleware to all comment routes
router.use(auth);

// open to all users including anonymous
router.post("/", addComment);

// admin only routes
router.get("/", requireAdmin, getAllComments);
router.delete("/:id", requireAdmin, deleteComment);

module.exports = router;
