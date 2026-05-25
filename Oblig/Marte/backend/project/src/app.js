const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const userRoutes = require("./routes/userRoutes");
const gameRoutes = require("./routes/gameRoutes");
const commentRoutes = require("./routes/commentRoutes");
const tournamentRoutes = require("./routes/tournamentRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");

const app = express();

// middleware to parse incoming JSON requests
app.use(express.json());

// connect to mongodb
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("connected to mongodb"))
  .catch((err) => console.error("mongodb connection error:", err));

// placeholder route to confirm server works
app.get("/", (req, res) => {
  res.json({ message: "api is running" });
});

// user routes
app.use("/api/users", userRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/tournaments", tournamentRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "route not found" });
});

// error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = app;
