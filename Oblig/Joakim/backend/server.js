import express from "express";
import nonApiRouter from "./routes/non.api.router.js";
import apiRouter from "./routes/api.router.js";
import User from "./models/users.js";
import { connectDB, disconnectDB } from "./config/db.config.js";

await connectDB();
const count = await User.countDocuments();
console.log("antall brukere i databasen:", count);

const pokerApp = express();

// non-api routes
pokerApp.use("/", nonApiRouter);

// api routes
pokerApp.use("/api", apiRouter);

const httpServer = pokerApp.listen(process.env.BACKEND_PORT);

httpServer.on("listening", () => {
  console.log("poker app lytter på port", httpServer.address().port);
});

async function gracefulShutdown() {
  console.log("poker app avslutter...");
  await disconnectDB();
  httpServer.close(() => process.exit(0));
}

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
