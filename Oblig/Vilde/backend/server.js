import express from "express";
import cors from "cors";
import apiV1 from "./routes/api.v1.js";
import dotenv from "dotenv";
dotenv.config();
import { connectDB } from "./config/db.config.js";
connectDB();
import { falseAuth } from "./middleware/auth.js";

//create express-app
const app = express();
app.use(express.json());
app.use(cors());
app.use(falseAuth);

//create middleware 
app.get("/api/test", (req, res) =>{
    res.json({message: "Backend is running"});
});

//Register routes 
app.use("/api/v1", apiV1);


const PORT = process.env.PORT || 3000;

//start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

