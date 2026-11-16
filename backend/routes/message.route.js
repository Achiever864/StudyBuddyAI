import express from "express";
import { sendMessage } from "../controllers/message.controller.js";
import protect from "../middleware/auth.middleware.js";

const messageRouter = express.Router();

messageRouter.post("/send", protect, sendMessage);

export default messageRouter;