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

const fetchConversation = async (req, res) => {
    try {
        const userId = req.user.id;

        const conversations = await Conversation.find({ user: userId }).sort({ updatedAt: -1 });

        return res.status(200).json({
            message: "Conversations fetched successfully",
            conversations
        })
    } catch (error) {
        console.error("conversation fetch errror:", err);
        res.status(500).json({ message: "Error in fetching conversations" });
    }
}

const fetchChats = async (req, res) => {
    try {
        const userId = req.user.id;
        const { chatId } = req.params;

        if (!mongoose.isValidObjectId(chatId)){
            return res.status(400).json({ message: "Invalid chat" });
        }

        //we must confirm that a user owns the chat before sending access...
        const conversation = await Conversation.findOne({ _id: chatId, user: userId });
        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        const messages = await Message.find({ conversation: chatId })
            .sort({ createdAt: 1 })
            .select("role content sources createdAt")
            .lean();

        return res.status(200).json({
            message: "Messages fetched successfully",
            chatId: conversation._id,
            title: conversation.title,
            messages
        });
    } catch (error) {
        console.error("Error fetching messages:", error);
        return res.status(500).json({ message: "Internal Server Error"});
    }
}

export {
    startConversation,
    createConversation,
    fetchConversation,
    fetchChats
}