import Conversation from "../models/conversation.model.js";
import mongoose from "mongoose";
import Messages from "../models/message.model.js";

const startConversation = async (req, res) => {
    try {
        const { message, materialId} = req.body;

        if (!message || !message.trim()){
            return res.status(400).json({ message: "Message is required"});
        }

        if (materialId && !mongoose.isValidObjectId(materialId)){
            return res.status(400).json({message: "Invalid material" });
        }

        const conversation = await Conversation.create({
            user: req.user._id,
            title: message.trim().slice(0, 40),
            material: materialId || null
        });

        res.status(201).json({
            messsage: "Conversation started",
            chatId: conversation._id,
            title: conversation.title
        });
    } catch (error) {
        console.error("Error starting conversation:", error);
        res.status(500).json({message: "Server Error: Unable to start conversation" });
    }
}

export {
    startConversation
}