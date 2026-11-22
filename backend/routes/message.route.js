import express from "express";
import { sendMessage } from "../controllers/message.controller.js";
import protect from "../middleware/auth.middleware.js";
import { uploadSingle } from "../middleware/upload,middleware.js";

const messageRouter = express.Router();

messageRouter.post("/send", protect, uploadSingle, sendMessage);

export default messageRouter;