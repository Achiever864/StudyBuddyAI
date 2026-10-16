import User from "../models/auth.model.js";
import bcryptjs from "bcryptjs";

const registerUser = async (req, res) => {
    try {
        const { email, username, password } = req.body;

        const user = await User.findbyId(id);

        if (user){
            return res.status(400).json({
                message: "User already exists"
            })
        };

        //hash our password here
        const hashedPassword = await bcrypt.hash(password); 

        const newUser = await User.create({
            email,
            password,
        })

    } catch (error) {
        
    }
}