import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },

    title: {
        type: String,
        trim: true,
        maxlength: 100,
        default: "Untitled chat"
    },
},
{
    timestamps: true,
});

conversationSchema.index({ user: 1, updatedAt: -1 });
export default mongoose.model("Conversation", conversationSchema);