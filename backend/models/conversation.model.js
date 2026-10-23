import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
    roomName: {
        type: String,
        trim: true,
        default: null
    }
},
{
    timestamps: true
})

export default mongoose.model("Conversation", conversationSchema);