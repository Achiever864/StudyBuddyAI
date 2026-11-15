import express from "express";
import { loginUser, registerUser, getMe } from "../controllers/auth.controller.js";
import { googleRedirect, googleCallback } from "../controllers/google.contoller.js";
import protect from "../middleware/auth.middleware.js";

const authRouter = express.Router();

authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
authRouter.get("/google", googleRedirect);
authRouter.get("/google/callback", googleCallback)
authRouter.get("/get", protect, getMe);

export default authRouter;