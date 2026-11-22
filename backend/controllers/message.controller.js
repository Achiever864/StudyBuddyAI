import mongoose from "mongoose";
import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import * as ragService from "../services/ragService.js";
import { extractFileContent } from "../services/materialProcessor.service.js";
import { createConversation } from "./conversation.controller.js";

const sendMessage = async (req, res) => {
    try {
        const userId = req.user.id;
        const { chatId, message } = req.body;

        const text = message?.trim() || "";
        const file = req.file;

        if (!text && !file) {
            return res.status(400).json({
                message: "Please enter a message or attach a file.",
            });
        }

        if (chatId && !mongoose.isValidObjectId(chatId)) {
            return res.status(400).json({
                message: "Invalid conversation ID.",
            });
        }

        let attachment = null;
        let attachmentContext = "";

        if (file) {
            const extracted = await extractFileContent(file);

            attachment = {
                fileName: extracted.fileName,
                mimeType: extracted.mimeType,
                extractedText: extracted.text,
                size: extracted.size,
            };

            attachmentContext = `
The user uploaded the following attachment:

File name: ${file.originalname}

Extracted content:
${extracted.text}

Use this content as the primary source when answering questions about the attachment.
`;
        }

        let conversation;

        if (chatId) {
            conversation = await Conversation.findOne({
                _id: chatId,
                user: userId,
            });

            if (!conversation) {
                return res.status(404).json({
                    message: "Conversation not found.",
                });
            }
        } else {
            conversation = await createConversation({
                userId,
                message: text || file.originalname,
            });
        }

        const userMessage = await Message.create({
            conversation: conversation._id,
            role: "user",
            content: text || `Uploaded ${file.originalname}`,
            attachment,
        });

        const history = await Message.find({
            conversation: conversation._id,
        })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        history.reverse();

        const enrichedHistory = history.map((msg) => {
            if (!msg.attachment?.extractedText) {
                return msg;
            }

            return {
                ...msg,
                content: `${msg.content}

Uploaded attachment: ${msg.attachment.fileName}

Attachment content:
${msg.attachment.extractedText}`,
            };
        });

        const question = attachmentContext
            ? `${text || "Please analyze this attachment."}\n\n${attachmentContext}`
            : text;

        const { answer, sources } = await ragService.answer({
            question,
            history: enrichedHistory,
            userId,
        });

        const assistantMessage = await Message.create({
            conversation: conversation._id,
            role: "assistant",
            content: answer,
            sources,
        });

        await Conversation.updateOne(
            { _id: conversation._id },
            {
                $set: {
                    updatedAt: new Date(),
                },
            }
        );

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

        return res.status(500).json({
            message: err.message || "Something went wrong processing your message.",
        });
    }
};

export {
    sendMessage,
};