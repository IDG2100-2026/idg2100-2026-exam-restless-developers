import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const { MONGO_URI, DB_NAME, NODE_ENV } = process.env;

export async function connectDB() {
    console.log("Connecting to MongoDB...", MONGO_URI);

    if (MONGO_URI) {
        mongoose.connection.on("error", err => {
            console.error("Mongoose/MongoDB connection error", err);
        });

        return mongoose.connect(MONGO_URI, {
            appName: `${DB_NAME}-${NODE_ENV}`,
            maxPoolSize: 67
        });
    }

    throw new Error(
        "Missing MONGO_URI env variable"
    );
}

export async function disconnectDB() {
    return mongoose.disconnect();
}