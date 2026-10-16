import jwt from "jsonwebtoken";
import User from "../models/auth.model.js";

const protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startWith("Bearer")){
            token = req.headers.authorization.split(" ")[1];
        }

        console.log("AuthToken: ", token);
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized. Please login"
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );
        console.log("Decoded: ", decoded);
        const user = await User.findById(decoded.id).select("-password");

        console.log("User", user)
        if (!user){
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        req.user = user;
        next();
    } catch (error){
        return res.status(401).json({
            success: false,
            message: "Invalid or expiredd token."
        })
    }
};

export default protect;