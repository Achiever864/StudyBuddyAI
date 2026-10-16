import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        lowercase: true,
        index: true      //This is used for faster database querying oo
    },

    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters"],
        select: false   //to avoid inclusion on passwords in general get queries
    },

    avatar:{
        type: String,
        required: true,
        trim: true,
        default: "https://res.cloudinary.com/dxagtjaiy/image/upload/v1782975000/userCloud.jpg"
    },

    degreeLevel: {
        type: String,
        enum: ["Higher Institutions e.g pHD" ,"Tertiary", "Secondary", "Primary"],
        default: "Tertiary",
        trim: true,
        lowercase: true,
    }
})

export mongoose.model("User", userSchema);