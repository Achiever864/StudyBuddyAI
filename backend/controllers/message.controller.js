import mongoose from "mongoose";
import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import * as ragService from "../services/ragService.js";
import { startConversation, createConversation } from "./conversation.controller.js";

const sendMessage = async (req, res) => {
    try {
        const userId = req.user.id;
        const { chatId, message, materialId } = req.body;
        const text = message?.trim();

        if (!text) {
            return res.status(400).json({ messsage: "Message cannot be empty." });
        }

        if ((chatId && !mongoose.isValidObjectId(chatId)) || (materialId && !mongoose.isValidObjectId(materialId))) {
            return res.status(400).json({ message: "Message cannot be empty." })
        }

        let conversation;

        if (chatId) {
            conversation = await Conversation.findOne({ _id: chatId, user: userId });
            if (!conversation) {
                return res.status(404).json({ message: "Conversation not found" });
            }
        } else {
            conversation = await createConversation({ userId, message: text, materialId });
        }

        const userMessage = await Message.create({
            conversation: conversation._id,
            role: "user",
            content: text,
            attachment: materialId || null,
        });

        //we want to get the last 10 messages from the chat as a context or pattern whatever
        const history = await Message.find({ conversation: conversation._id }).sort({ createdAt: -1 }).limit(10).lean();
        history.reverse();

        const { answer, sources } = await ragService.answer({
            question: text,
            history,
            userId,
            materialId: materialId || conversation.material,
        });

        const assistantMessage = await Message.create({
            conversation: conversation._id,
            role: "assistant",
            content: answer,
            sources,
        });

        await Conversation.updateOne({ _id: conversation._id }, { $set: { updatedAt: new Date() } });

        return res.status(201).json({
            message: "Message sent successfully",
            chatId: conversation._id,
            title: conversation.title,
            reply: answer,
            sources,
            userMessage,
            assistantMessage,
        });
    } catch (err) {
        console.error("Error sending message:", err);
        return res.status(500).json({ message: "Something went wrong getting a reply. Please try again." });
    }
}

export {
    sendMessage,
}