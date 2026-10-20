import User from "../models/auth.model.js";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";

const registerUser = async (req, res) => {
    try {
        const { email, username, password } = req.body;

        const user = await User.findOne({ email });

        if (user){
            return res.status(400).json({
                message: "User already exists"
            })
        };

        const existingUsername = await User.findOne({ username });
        if (existingUsername){
            return res.status(400).json({
                message: "Username is already taken"
            })
        }
        //hash our password here
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            email,
            username,
            password: hashedPassword,
            degreeLevel
        })

        const token = jwt.sign(
            { id: newUser._id},
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            message: "User created successfully",
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                token: token
            }
        })
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({
            message: "Server Error: Unable to create account"
        })   
    }
}