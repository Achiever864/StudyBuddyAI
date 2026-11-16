import express from "express";
import { startConversation } from "../controllers/conversation.controller";
import protect from "../middleware/auth.middleware";

const converseRouter = express.Router();

converseRouter.post("/start", protect, startConversation);

export default converseRouter;