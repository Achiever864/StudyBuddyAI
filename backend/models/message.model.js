import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        conversation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
            index: true
        },

        role: {
            type: String,
            enum: ["user", "assistant"],
            required: true
        },

        content: {
            type: String,
            trim: true,
            required: true,
            default: ""
        },

        attachment: {
            fileName: {
                type: String,
                default: null
            },
            mimeType: {
                type: String,
                default: null
            },
            extractedText: {
                type: String,
                default: null
            },
            size: {
                type: Number,
                default: null
            }
        },

        sources: [{
            _id: false,
            materialId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Material"
            },
            chunkId: String,
            score: Number
        }],
    },
    { timestamps: true }
);

messageSchema.index({ conversation: 1, createdAt: 1 });

export default mongoose.model("Message", messageSchema);