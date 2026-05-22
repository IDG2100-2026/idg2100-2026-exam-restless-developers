import express from "express";
import userRoutes from "./userRoutes.js";
import matchRoutes from "./matchRoutes.js";
import tournamentRoutes from "./tournamentRoutes.js";
import categoryRoutes from "./categoryRoutes.js";
import commentRoutes from "./commentRoutes.js";
import matchInviteRoutes from "./matchInviteRoutes.js";

const apiV1 = express.Router();

//mounting the routes 
apiV1.use("/users", userRoutes);
apiV1.use("/matches", matchRoutes);
apiV1.use("/tournaments", tournamentRoutes);
apiV1.use("/categories", categoryRoutes);
apiV1.use("/comments", commentRoutes);
apiV1.use("/invites", matchInviteRoutes);



export default apiV1;