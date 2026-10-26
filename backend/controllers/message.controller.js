import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";

const sendMessage = async (req, res) => {
    try {
        const userId = req.user.id;
        const { chatId, text, materialId } = req.body;

        if (!text?.trim()) {
            return res.status(400).json({ messsage: "Message cannot be empty." });
        }

        const conversation = await Conversation.findOne({ _id: chatId, user: userId });
        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        const userMessage = await Message.create({
            chatId, role: "user", text: text.trim(), attachment: materialId,
        });

        const history = await Message.find({ chatId }).sort({ createdAt: -1 }).limit(10).lean();
        history.reverse();

        const { answer, sources } = await ragService.answer({
            question: text,
            history,
            userId,
            materialId,
        });

        const assistantMessage = await Message.create({
            chatId, role: "assistant", text: answer, sources,
        });


        return res.status(201).json({
            message: "Message sent successfully",
            userMessage,
            assistantMessage,
            //populate message..I should consider websocket or manually sha
        })
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}