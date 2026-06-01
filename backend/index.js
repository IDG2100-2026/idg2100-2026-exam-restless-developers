import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import errorHandler from "./middleware/errorHandler.js";

import { createServer } from "http";
import { Server } from "socket.io";
import { apiLimiter } from "./middleware/rateLimit.middleware.js";

import { connectDB } from "./config/db.config.js";
import tournamentRoutes from "./routes/tournaments.routes.js";
import usersRoutes from "./routes/users.routes.js";
import matchesRoutes from "./routes/matches.routes.js";
import commentRoutes from "./routes/comments.routes.js";
import adminRoutes from "./routes/adminRoutes.js";
import platformRoutes from "./routes/platform.routes.js";


dotenv.config();

const app = express();

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  socket.on("join:match", (matchId) => {
    socket.join(`match:${matchId}`);
  });

  socket.on("join:tournament", (tournamentId) => {
    socket.join(`tournament:${tournamentId}`);
  });
});

app.use(cors());
app.set("trust proxy", 1);
app.use(express.json());
app.use(apiLimiter);

app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/tournaments", tournamentRoutes);
app.use("/api/v1/matches", matchesRoutes);
app.use("/api/v1/comments", commentRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/platform", platformRoutes);

const PORT = process.env.BACKEND_PORT || 6767;

app.get("/", (req, res) => {
  res.json({
    message: "Backend is running",
  });
});

app.use(errorHandler);

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