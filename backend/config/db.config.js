import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const { DB_HOSTNAME, DB_PORT, DB_NAME, NODE_ENV } = process.env;
const CONNECTION_URI = `mongodb://${DB_HOSTNAME}:${DB_PORT}/${DB_NAME}`;

export async function connectDB() {
    console.log("Connection to MongoDB...", CONNECTION_URI);

    if (DB_HOSTNAME && DB_PORT && DB_NAME) {
        mongoose.connection.on("error", err => {
            console.error("Mongoose/MongoDB connection error", err);
        });

        return mongoose.connect(CONNECTION_URI, {
            appName: `${DB_NAME}-${NODE_ENV}`,
            maxPoolSize: 67
        });
    }

    throw new Error(
        `Missing env variables needed to connect to MongoDB: ${DB_HOSTNAME}, ${DB_PORT}, ${DB_NAME}`
    );
}

export async function disconnectDB() {
    return mongoose.disconnect();
}
