import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { connectDB } from "./config/db.config.js";
import tournamentRoutes from "./routes/tournaments.routes.js";
import usersRoutes from "./routes/users.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1/users", usersRoutes);
app.use("/tournaments", tournamentRoutes);

const PORT = process.env.BACKEND_PORT || 6767;

app.get("/", (req, res) => {
  res.json({
    message: "Backend is running",
  });
});

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
}

startServer();