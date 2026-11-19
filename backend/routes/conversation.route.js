import express from "express";
import { startConversation, fetchConversation } from "../controllers/conversation.controller.js";
import protect from "../middleware/auth.middleware.js";

const converseRouter = express.Router();

converseRouter.post("/start", protect, startConversation);
converseRouter.get("/get", protect, fetchConversation);

export default converseRouter;