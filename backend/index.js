import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { createServer } from "http";
import { Server } from "socket.io";

import { connectDB } from "./config/db.config.js";
import tournamentRoutes from "./routes/tournaments.routes.js";
import usersRoutes from "./routes/users.routes.js";
import matchesRoutes from "./routes/matches.routes.js";
import commentRoutes from "./routes/comments.routes.js";

dotenv.config();

const app = express();

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("User connected");
});

app.use(cors());
app.set("trust proxy", 1);
app.use(express.json());

app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/tournaments", tournamentRoutes);
app.use("/api/v1/matches", matchesRoutes);
app.use("/api/v1/comments", commentRoutes);

const PORT = process.env.BACKEND_PORT || 6767;

app.get("/", (req, res) => {
  res.json({
    message: "Backend is running",
  });
});

async function startServer() {
  try {
    await connectDB();

    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
}

startServer();