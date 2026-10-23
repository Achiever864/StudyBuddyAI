import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        chatId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
            index: true
        },

        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        text: {
            type: String,
            trim: true,
            default: ""
        },

        attachment: {
            type: {
                type: String,
                enum: ["image", "video", "audio", "file"],
                default: null
            },

            url: {
                type: String,
                default: null
            },

            publicId: {
                type: String,
                default: null
            },

            fileName: {
                type: String,
                default: null
            },

            mimeType: {
                type: String,
                default: null
            },

            size: {
                type: Number,
                default: null
            },

            duration: {
                type: Number,
                default: null
            }
        },
    },
    { timestamps: true }
);

export default mongoose.model("Message", messageSchema);