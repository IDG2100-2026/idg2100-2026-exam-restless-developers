import express from "express";
import userController from "../controllers/user.controller.js";
import matchRouter from "./match.api.router.js";
import leaderboardRouter from "./leaderboard.router.js";
import platformRouter from "./platform.api.router.js";

import { validate } from "../validator/validate.js";
import userValidator from "../validator/user.validator.js";

const apiRouter = express.Router();

apiRouter.use(express.json());

// user routes
apiRouter.post(
    "/login",
    userController.loginUser
);

apiRouter.get("/users", userController.getAllUsers);

apiRouter.get(
    "/users/:uid",
    userValidator.validateUid(),
    validate,
    userController.getUser
);

apiRouter.get(
    "/users/:uid/profile",
    userValidator.validateUid(),
    validate,
    userController.getProfile
);

apiRouter.post(
    "/login",
    userController.loginUser
);
apiRouter.post(
    "/users",
    userValidator.validateCreateUser(),
    validate,
    userController.createUser
);


// leaderboard routes
apiRouter.use("/leaderboards", leaderboardRouter);

// platform routes
apiRouter.use("/platform", platformRouter);

// match routes
apiRouter.use("/matches", matchRouter);

export default apiRouter;
