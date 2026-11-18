import express from "express";
import { startConversation } from "../controllers/conversation.controller.js";
import protect from "../middleware/auth.middleware.js";

const converseRouter = express.Router();

converseRouter.post("/start", protect, startConversation);

export default converseRouter;