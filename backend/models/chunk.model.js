import mongoose from "mongoose";

const chunkSchema = new mongoose.Schema(
    {
        materialId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Material",
            required: true,
            index: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        index: {
            type: Number,
            required: true
        },

        text: {
            type: String,
            required: true
        },

        embedding: {
            type: [Number],
            required: true,
            select: false,
        },  //768 dims
    },
    {
        timestamps: true
    }
)

export default mongoose.model("Chunk", chunkSchema);