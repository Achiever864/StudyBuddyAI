import Conversation from "../models/conversation.model.js";
import mongoose from "mongoose";
import Message from "../models/message.model.js";

//helper function to start the conversation but no response or message
const createConversation = ({ userId, message, materialId }) =>
    Conversation.create({
        user: userId,
        title: message.trim().slice(0, 40), //should change to use AI to generate title..
        material: materialId || null
    });

//actual route that starts a conversation and saves the first message...
const startConversation = async (req, res) => {
    try {
        const { message, materialId} = req.body;

        if (!message || !message.trim()){
            return res.status(400).json({ message: "Message is required"});
        }

        if (materialId && !mongoose.isValidObjectId(materialId)){
            return res.status(400).json({message: "Invalid material" });
        }

        const conversation = await createConversation({
            userId: req.user._id,
            message,
            materialId
        });

        await Message.create({
            conversation: conversation._id,
            role: "user",
            content: message
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
    startConversation,
    createConversation
}