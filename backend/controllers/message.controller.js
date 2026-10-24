import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";

const sendMessage = async (req, res) => {
    try {
        const sender = req.user.id;
        const { chatId, text } = req.body;

        const conversation = await Conversation.findById(chatId);
        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        if (!text?.trim()) {
            return res.status(400).json({ message: "Message cannot be empty."})
        }



        const message = await Message.create({
            sender,
            chatId,
            text,
            attachment
        });


        return res.status(201).json({
            message: "Message sent successfully",
            //populate message..I should consider websocket or manually sha
        })
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}